"use server";

import { exec } from "child_process";
import { promisify } from "util";
import { mkdir, readdir } from "fs/promises";
import { Clip } from "@/app/twitchTypes";
import { config } from "./config";
import logger from "@/lib/logger";
import path from "path";
import fs from "fs";

const asyncExec = promisify(exec);

export async function createVideo(clips: Clip[], date: string) {
	try {
		const { rawPath, processedPath } = await setupDirectories(date);
		console.log("Directories set up, proceeding with video creation");

		await downloadClips(clips, date, rawPath);
		await processClips(date, rawPath, processedPath);
		await concatenateClips(date, processedPath);

		logger.info("createVideo :: done");
		return { success: true, message: "Video processing complete" };
	} catch (error) {
		console.error("Video processing error:", error);
		return { success: false, message: error };
		throw new Error(`createVideo :: ${error}`);
	}
}

export async function downloadClips(
	clips: Clip[],
	date: string,
	rawPath: string,
) {
	try {
		if (!rawPath) {
			throw new Error("Download directory path undefined");
		}

		logger.info(`downloadClips :: Downloading clips to /${rawPath}...`);

		// Download each clip
		for (const clip of clips) {
			await asyncExec(
				`streamlink --output ${rawPath}/${clip.id}.mp4 ${clip.url} best`,
			);
			logger.info(`downloadClips :: Downloaded clip ${clip.id}`);
		}
	} catch (error) {
		logger.error(`downloadClips :: ${error}`);
	}
}

export async function processClips(
	date: string,
	rawPath: string,
	processedPath: string,
) {
	try {
		if (!processedPath) {
			throw new Error("Process directory path undefined");
		}

		logger.info("processClips :: Processing clips...");

		// process each clip
		const files = await readdir(rawPath as string);
		for (const file of files) {
			await asyncExec(
				`ffmpeg -i ${rawPath}/${file} -vcodec libx264 -acodec aac -vf scale=1920x1080 -v error ${processedPath}/${file}`,
			);
			logger.info(`processClips :: Processed clip ${file}`);
		}
	} catch (error) {
		logger.error(`processClips :: ${error}`);
	}
}

export async function concatenateClips(date: string, processedPath: string) {
	logger.info("concatenateClips :: Concatenating clips...");

	const outputFileName = `${config.paths.output}-${date}.mp4`;
	const concatListFileName = `concatlist-${date}.txt`;
	try {
		// copy files in processed clips directory into txt file for concatenation
		await asyncExec(
			`(for  %i in (${processedPath}/*.mp4) do @echo file '${processedPath}/%i') > ${concatListFileName}`,
		);
		// concatenate clips listed in txt file
		await asyncExec(
			`ffmpeg -f concat -i ${concatListFileName} -c copy ${outputFileName} -v error`,
		);
	} catch (error) {
		logger.error(`concatenateClips :: ${error}`);
	}
}

// async function ensureDirectoryExistence(dirPath: string) {
// 	try {
// 		await mkdir(dirPath, { recursive: true });
// 		logger.info(`ensureDirectoryExistence :: Path created at: /${dirPath}`);
// 	} catch (error) {
// 		logger.error(`ensureDirectoryExistence :: ${error}`);
// 	}
// }

export async function setupDirectories(date: string) {
	try {
		const baseDir = process.cwd();
		const publicDir = path.join(baseDir, "public");
		if (!fs.existsSync(publicDir)) {
			await mkdir(publicDir);
		}

		const clipsDir = path.join(publicDir, "clips");
		if (!fs.existsSync(clipsDir)) {
			await mkdir(clipsDir);
		}

		const rawDir = path.join(clipsDir, "raw");
		const processedDir = path.join(clipsDir, "processed");
		if (!fs.existsSync(rawDir)) {
			await mkdir(rawDir);
		}
		if (!fs.existsSync(processedDir)) {
			await mkdir(processedDir);
		}

		const rawPath = path.join(rawDir, date);
		const processedPath = path.join(processedDir, date);
		await mkdir(rawPath, { recursive: true });
		await mkdir(processedPath, { recursive: true });

		console.log("Directories created:", {
			rawPath,
			processedPath,
		});

		return { rawPath, processedPath };
	} catch (error) {
		console.error("Directory creation error:", error);
		throw error;
	}
}
