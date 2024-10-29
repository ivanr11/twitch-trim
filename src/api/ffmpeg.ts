import fs from "fs";
import { execSync } from "child_process";
import { Clip } from "../types/twitchTypes";
import config from "../config";
import { Config } from "../config";

export function createVideo(clips: Clip[]) {
	try {
		setupDirectories();
		clearFiles();

		downloadClips(clips);
		processClips();
		concatenateClips();

		console.log("Done");
	} catch (error) {
		throw new Error(error as string);
	}
}

const localRawClipsPath = config.LOCAL_RAW_CLIPS_PATH;
const localProcessedClipsPath = config.LOCAL_PROCESSED_CLIPS_PATH;

export function downloadClips(clips: Clip[]) {
	console.log(`Downloading clips to /${localRawClipsPath}...`);

	// Download each clip
	for (const clip of clips) {
		try {
			execSync(
				`streamlink --output ${localRawClipsPath}/${clip.id}.mp4 ${clip.url} best`,
			);
			console.log(`Downloaded clip ${clip.id}`);
		} catch (error) {
			console.error(error);
		}
	}
}

export function processClips() {
	console.log("Processing clips...");

	// process each clip
	fs.readdirSync(localRawClipsPath as string).forEach((file) => {
		try {
			execSync(
				`ffmpeg -i ${localRawClipsPath}/${file} -vcodec libx264 -acodec aac -vf scale=1920x1080 -v error ${localProcessedClipsPath}/${file}`,
			);
			console.log(`Processed clip ${file}`);
		} catch (error) {
			console.error(error);
		}
	});
}

export function concatenateClips() {
	console.log("Concatenating clips...");
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
		console.error(error);
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
			`Unexpected error: Missing path for ${configKey || "unknown key"}`,
		);
	}

	fs.mkdirSync(dirPath, { recursive: true });
	console.log(`Path created at: /${dirPath}`);
}

function clearFiles() {
	const outputFileName = `${config.OUTPUT_FILE_NAME}.mp4`;
	if (fs.existsSync(outputFileName)) {
		fs.rmSync(`${outputFileName}`);
	}

	if (fs.existsSync("filelist.txt")) {
		fs.rmSync("filelist.txt");
	}
}

function clearDirectories() {
	if (fs.existsSync(`./${localRawClipsPath}`)) {
		fs.rmSync(localRawClipsPath as string, { recursive: true });
	}

	if (fs.existsSync(`./${localProcessedClipsPath}`)) {
		fs.rmSync(localProcessedClipsPath as string, { recursive: true });
	}
}

function setupDirectories() {
	clearDirectories();
	ensureDirectoryExistence(localRawClipsPath as string);
	ensureDirectoryExistence(localProcessedClipsPath as string);
}
