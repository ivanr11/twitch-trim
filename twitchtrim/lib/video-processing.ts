"use server";

import { exec } from "child_process";
import { promisify } from "util";
import { mkdir, readdir, writeFile, unlink, rm } from "fs/promises";
import { Clip } from "@/app/types/twitchTypes";
import logger from "@/lib/logger";
import path from "path";

const asyncExec = promisify(exec);

export async function createVideo(clips: Clip[], date: string) {
	try {
		const { rawPath, processedPath, outputPath } = await setupDirectories(date);
		logger.info(
			"createVideo :: Directories set up, proceeding with video creation",
		);

		await clearOutputDirectory(outputPath);

		await downloadClips(clips, date, rawPath);
		await processClips(date, rawPath, processedPath);
		await concatenateClips(date, processedPath);

		await cleanupTempDirectories(rawPath, processedPath);

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
		throw error;
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
		const files = await readdir(rawPath);
		for (const file of files) {
			await asyncExec(
				`ffmpeg -i ${rawPath}/${file} -vcodec libx264 -acodec aac -ar 48000 -vf "scale=1920x1080,fps=60" -preset ultrafast -threads 0 -v error "${processedPath}/${file}"`,
			);
			logger.info(`processClips :: Processed clip ${file}`);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`processClips :: ${errorMessage}`);
		throw error;
	}
}

export async function concatenateClips(date: string, processedPath: string) {
	logger.info("concatenateClips :: Concatenating clips...");

	const outputFileName = `output-${date}.mp4`;
	const concatListFileName = `concatlist-${date}.txt`;
	try {
		// copy files in processed clips directory into txt file for concatenation
		const files = await readdir(processedPath);
		const mp4Files = files.filter((file) => file.endsWith(".mp4"));

		const fileList = mp4Files
			.map(
				(file) =>
					`file '${path.posix.join("public", "clips", "processed", date, file)}'`,
			)
			.join("\n");

		await writeFile(concatListFileName, fileList);

		// concatenate clips listed in txt file
		await asyncExec(
			`ffmpeg -f concat -i ${concatListFileName} -c copy public/clips/output/${outputFileName} -v error`,
		);

		await unlink(concatListFileName);

		logger.info("concatenateClips :: Successfully concatenated clips");
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`concatenateClips :: ${errorMessage}`);
		throw error;
	}
}

async function ensureDirectoryExistence(dirPath: string) {
	try {
		await mkdir(dirPath, { recursive: true });
		logger.info(`ensureDirectoryExistence :: Path created at: ${dirPath}`);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`ensureDirectoryExistence :: ${errorMessage}`);
		throw error;
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
		await ensureDirectoryExistence(rawPath);
		await ensureDirectoryExistence(processedPath);
		await ensureDirectoryExistence(outputPath);
		logger.info(
			`setupDirectories :: Successfully created directories for date ${date}`,
		);
		return { rawPath, processedPath, outputPath };
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`setupDirectories :: ${errorMessage}`);
		throw error;
	}
}

async function clearOutputDirectory(outputPath: string) {
	try {
		const files = await readdir(outputPath);
		await Promise.all(files.map((file) => unlink(path.join(outputPath, file))));
		logger.info(
			"clearOutputDirectory :: Successfully cleared output directory",
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`clearOutputDirectory :: ${errorMessage}`);
		throw error;
	}
}

async function cleanupTempDirectories(rawPath: string, processedPath: string) {
	try {
		await Promise.all([
			rm(rawPath, { recursive: true, force: true }),
			rm(processedPath, { recursive: true, force: true }),
		]);
		logger.info(`cleanupTempDirectories :: Successfully removed temporary directories: 
			Raw: ${rawPath}
			Processed: ${processedPath}`);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(
			`cleanupTempDirectories :: Failed to remove directories: ${errorMessage}`,
		);
	}
}
