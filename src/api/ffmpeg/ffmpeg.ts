import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { Clip } from "../../types/twitchTypes";
import config from "../../config";
import { Config } from "../../config";
import logger from "../../logger";

export function createVideo(clips: Clip[]) {
	try {
		clearFiles("./", ".txt");
		clearFiles("./", ".mp4");

		downloadClips(clips);
		processClips();
		concatenateClips();

		logger.info("createVideo :: done");
	} catch (error) {
		throw new Error(`createVideo :: ${error}`);
	}
}

const localRawClipsPath = config.LOCAL_RAW_CLIPS_PATH;
const localProcessedClipsPath = config.LOCAL_PROCESSED_CLIPS_PATH;

export function downloadClips(clips: Clip[]) {
	if (!localRawClipsPath) {
		throw new Error("downloadClips :: Download directory path undefined");
	}

	logger.info(`downloadClips :: Downloading clips to /${localRawClipsPath}...`);

	// Download each clip
	for (const clip of clips) {
		try {
			execSync(
				`streamlink --output ${localRawClipsPath}/${clip.id}.mp4 ${clip.url} best`,
			);
			logger.info(`downloadClips :: Downloaded clip ${clip.id}`);
		} catch (error) {
			logger.error(`downloadClips :: ${error}`);
		}
	}
}

export function processClips() {
	if (!localProcessedClipsPath) {
		throw new Error("processClips :: Process directory path undefined");
	}

	logger.info("processClips :: Processing clips...");

	// process each clip
	try {
		fs.readdirSync(localRawClipsPath as string).forEach((file) => {
			execSync(
				`ffmpeg -i ${localRawClipsPath}/${file} -vcodec libx264 -acodec aac -vf scale=1920x1080 -v error ${localProcessedClipsPath}/${file}`,
			);
			logger.info(`processClips :: Processed clip ${file}`);
		});
	} catch (error) {
		logger.error(`processClips :: ${error}`);
	}
}

export function concatenateClips() {
	logger.info("concatenateClips :: Concatenating clips...");
	const outputFileName = `${config.OUTPUT_FILE_NAME}.mp4`;

	try {
		// copy files in processed clips directory into txt file for concatenation
		execSync(
			`(for  %i in (${localProcessedClipsPath}/*.mp4) do @echo file '${localProcessedClipsPath}/%i') > filelist.txt`,
		);
		// concatenate clips listed in txt file
		execSync(
			`ffmpeg -f concat -i filelist.txt -c copy ${outputFileName} -v error`,
		);
	} catch (error) {
		logger.error(`concatenateClips :: ${error}`);
	}
}

function getConfigKey(dirPath: string): keyof Config | undefined {
	if (dirPath === localRawClipsPath) {
		return "LOCAL_RAW_CLIPS_PATH";
	} else if (dirPath === localProcessedClipsPath) {
		return "LOCAL_PROCESSED_CLIPS_PATH";
	} else {
		return undefined;
	}
}

function ensureDirectoryExistence(dirPath: string) {
	const configKey = getConfigKey(dirPath);

	if (!configKey || !config[configKey]) {
		throw new Error(
			`ensureDirectoryExistence :: Missing path for ${configKey || "unknown key"}`,
		);
	}

	fs.mkdirSync(dirPath, { recursive: true });
	logger.info(`ensureDirectoryExistence :: Path created at: /${dirPath}`);
}

function clearFiles(dir: string, extension: string) {
	try {
		const files = fs.readdirSync(dir);
		files.forEach((file) => {
			const filePath = path.join(dir, file);
			const fileExtension = path.extname(filePath);

			if (fileExtension === extension.toLowerCase()) {
				fs.unlinkSync(filePath);
				logger.info(`Deleted file: ${filePath}`);
			}
		});
	} catch (error) {
		logger.error(`clearFiles :: ${error}`);
	}
}

export function clearDirectories() {
	if (fs.existsSync(`./${localRawClipsPath}`)) {
		fs.rmSync(localRawClipsPath as string, { recursive: true });
		logger.info(`clearDirectories :: Cleared directory "${localRawClipsPath}"`);
	}

	if (fs.existsSync(`./${localProcessedClipsPath}`)) {
		fs.rmSync(localProcessedClipsPath as string, { recursive: true });
		logger.info(
			`clearDirectories :: Cleared directory "${localProcessedClipsPath}"`,
		);
	}
}

export function setupDirectories() {
	clearDirectories();
	ensureDirectoryExistence(localRawClipsPath as string);
	ensureDirectoryExistence(localProcessedClipsPath as string);
}
