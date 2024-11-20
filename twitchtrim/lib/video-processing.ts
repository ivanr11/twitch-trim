"use server";

import { exec } from "child_process";
import { promisify } from "util";
import { mkdir, readdir } from "fs/promises";
import { Clip } from "@/app/types/twitchTypes";
import logger from "@/lib/logger";
import path from "path";

const asyncExec = promisify(exec);

export async function createVideo(clips: Clip[], date: string) {
	try {
		const { rawPath, processedPath } = await setupDirectories(date);
		logger.info(
			"createVideo :: Directories set up, proceeding with video creation",
		);

		await downloadClips(clips, date, rawPath);
		await processClips(date, rawPath, processedPath);
		await concatenateClips(date, processedPath);

		logger.info("createVideo :: Video Processing Complete");
		return { success: true, message: "Video processing complete" };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`createVideo :: ${errorMessage}`);
		return { success: false, message: errorMessage };
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

		logger.info(
			`downloadClips :: Starting download of ${clips.length} clips to ${rawPath}`,
		);

		// Download each clip
		for (const clip of clips) {
			await asyncExec(
				`streamlink --output ${rawPath}/${clip.id}.mp4 ${clip.url} best`,
			);
			logger.info(`downloadClips :: Successfully downloaded clip ${clip.id}`);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`downloadClips :: ${errorMessage}`);
		throw new Error(`Failed to download clips: ${errorMessage}`);
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
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`processClips :: ${error}`);
		throw new Error(`Failed to process clips: ${errorMessage}`);
	}
}

export async function concatenateClips(date: string, processedPath: string) {
	logger.info("concatenateClips :: Concatenating clips...");

	const outputFileName = `output-${date}.mp4`;
	const concatListFileName = `concatlist-${date}.txt`;
	try {
		// copy files in processed clips directory into txt file for concatenation
		await asyncExec(
			`(for  %i in (${processedPath}/*.mp4) do @echo file 'public/clips/processed/${date}/%~nxi') > ${concatListFileName}`,
		);
		// concatenate clips listed in txt file
		await asyncExec(
			`ffmpeg -f concat -i ${concatListFileName} -c copy public/clips/output/${outputFileName} -v error`,
		);
		logger.info("concatenateClips :: Successfully concatenated clips");
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`concatenateClips :: ${errorMessage}`);
		throw new Error(`Failed to concatenate clips: ${errorMessage}`);
	}
}

async function ensureDirectoryExistence(dirPath: string) {
	try {
		await mkdir(dirPath, { recursive: true });
		logger.info(`ensureDirectoryExistence :: Path created at: ${dirPath}`);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`ensureDirectoryExistence :: ${errorMessage}`);
		throw new Error(`Failed to create directory ${dirPath}: ${errorMessage}`);
	}
}

export async function setupDirectories(date: string) {
	logger.info(`setupDirectories :: Setting up directories for date: ${date}`);

	const baseDir = process.cwd();
	const rawPath = path.join(baseDir, "public", "clips", "raw", date);
	const processedPath = path.join(
		baseDir,
		"public",
		"clips",
		"processed",
		date,
	);
	const outputPath = path.join(baseDir, "public", "clips", "output");

	try {
		ensureDirectoryExistence(rawPath);
		ensureDirectoryExistence(processedPath);
		ensureDirectoryExistence(outputPath);
		logger.info(
			`setupDirectories :: Successfully created directories for date ${date}`,
		);
		return { rawPath, processedPath };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`setupDirectories :: ${errorMessage}`);
		throw new Error(`Failed to setup directories: ${errorMessage}`);
	}
}
