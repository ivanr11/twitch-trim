import { readdir, mkdir } from "fs/promises";
import { promisify } from "node:util";
import child_process from "node:child_process";
import { Clip } from "../../types/twitchTypes";
import config from "../../config";
import logger from "../../logger";

export async function createVideo(clips: Clip[], date: string) {
	try {
		await downloadClips(clips);
		await processClips();
		await concatenateClips(date);

		logger.info("createVideo :: done");
	} catch (error) {
		throw new Error(`createVideo :: ${error}`);
	}
}

let localRawClipsPath = config.LOCAL_RAW_CLIPS_PATH;
let localProcessedClipsPath = config.LOCAL_PROCESSED_CLIPS_PATH;
const exec = promisify(child_process.exec);

export async function downloadClips(clips: Clip[]) {
	try {
		if (!localRawClipsPath) {
			throw new Error("Download directory path undefined");
		}

		logger.info(
			`downloadClips :: Downloading clips to /${localRawClipsPath}...`,
		);

		// Download each clip
		for (const clip of clips) {
			await exec(
				`streamlink --output ${localRawClipsPath}/${clip.id}.mp4 ${clip.url} best`,
			);
			logger.info(`downloadClips :: Downloaded clip ${clip.id}`);
		}
	} catch (error) {
		logger.error(`downloadClips :: ${error}`);
	}
}

export async function processClips() {
	try {
		if (!localProcessedClipsPath) {
			throw new Error("Process directory path undefined");
		}

		logger.info("processClips :: Processing clips...");

		// process each clip
		const files = await readdir(localRawClipsPath as string);
		for (const file of files) {
			await exec(
				`ffmpeg -i ${localRawClipsPath}/${file} -vcodec libx264 -acodec aac -vf scale=1920x1080 -v error ${localProcessedClipsPath}/${file}`,
			);
			logger.info(`processClips :: Processed clip ${file}`);
		}
	} catch (error) {
		logger.error(`processClips :: ${error}`);
	}
}

export async function concatenateClips(date: string) {
	logger.info("concatenateClips :: Concatenating clips...");
	const outputFileName = `${config.OUTPUT_FILE_NAME}-${date}.mp4`;
	const concatListFileName = `concatlist-${date}.txt`;
	try {
		// copy files in processed clips directory into txt file for concatenation
		await exec(
			`(for  %i in (${localProcessedClipsPath}/*.mp4) do @echo file '${localProcessedClipsPath}/%i') > ${concatListFileName}`,
		);
		// concatenate clips listed in txt file
		await exec(
			`ffmpeg -f concat -i ${concatListFileName} -c copy ${outputFileName} -v error`,
		);
	} catch (error) {
		logger.error(`concatenateClips :: ${error}`);
	}
}

async function ensureDirectoryExistence(dirPath: string) {
	try {
		await mkdir(dirPath, { recursive: true });
		logger.info(`ensureDirectoryExistence :: Path created at: /${dirPath}`);
	} catch (error) {
		logger.error(`ensureDirectoryExistence :: ${error}`);
	}
}

export async function setupDirectories(date: string) {
	try {
		localRawClipsPath += `-${date}`;
		localProcessedClipsPath += `-${date}`;

		await ensureDirectoryExistence(`${localRawClipsPath}`);
		await ensureDirectoryExistence(`${localProcessedClipsPath}`);
	} catch (error) {
		logger.error(`setupDirectories :: ${error}`);
	}
}
