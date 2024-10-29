import fs from "fs";
import { execSync } from "child_process";
import { Clip } from "../types/twitchTypes";
import config from "../config";
import { Config } from "../config";

export async function createVideo(clips: Clip[]) {
	setupDirectories();

	downloadClips(clips);
	processClips();
	concatenateClips();
}

export function downloadClips(clips: Clip[]) {
	console.log(`Downloading clips to ${config.LOCAL_RAW_CLIPS_PATH}...`);

	// Download each clip
	for (const clip of clips) {
		try {
			execSync(
				`streamlink --output ${config.LOCAL_RAW_CLIPS_PATH}/${clip.id}.mp4 ${clip.url} best`,
			);
			console.log(`Downloaded clip ${clip.id}`);
		} catch (error) {
			console.error(error);
		}
	}

	console.log("All clips downloaded");
}

export function processClips() {
	console.log("Processing clips...");

	const localRawClipsPath = config.LOCAL_RAW_CLIPS_PATH as string;
	const localProcessedClipsPath = config.LOCAL_PROCESSED_CLIPS_PATH as string;

	// process each clip
	fs.readdirSync(localRawClipsPath).forEach((file) => {
		try {
			execSync(
				`ffmpeg -i ${localRawClipsPath}/${file} -vcodec libx264 -acodec aac -vf scale=1920x1080 -v error ${localProcessedClipsPath}/${file}`,
			);
			console.log(`Processed clip ${file}`);
		} catch (error) {
			console.error("Exec error:", error);
		}
	});
	console.log("All clips processed");
	// TODO: Skip reencoding if not needed
	// TODO: Only process if clips aren't of same resolution OR aspect ratio
	// fs.readdirSync(localRawClipsPath).forEach((file) => {
	// 	const ffprobe = exec(
	// 		`ffprobe ${file} -show_entries stream=display_aspect_ratio,width,height -of csv=s=x:p=0`,
	// 	);
	// 	let output = "";
	// 	ffprobe.stdout?.on("data", (data) => {
	// 		output += data.toString();
	// 	});
	// 	console.log(output);
	// });
}

export function concatenateClips() {
	console.log("Concatenating clips...");
	const localProcessedClipsPath = config.LOCAL_PROCESSED_CLIPS_PATH;
	// const outputFileName = '';
	// const outputFilePath = '';
	// Concatenate all clips in processed-clips directory (will all be of same codec)
	// 1. Execture for loop to copy every file in processed clips directory into mylist.txt for concatenation
	try {
		execSync(
			`(for  %i in (${localProcessedClipsPath}/*.mp4) do @echo file '${localProcessedClipsPath}/%i') > mylist.txt`,
		);
	} catch (error) {
		console.error(error);
	}
	// 2. concat the videos in mylist.txt
	try {
		execSync("ffmpeg -f concat -i mylist.txt -c copy output.mp4 -v error");
	} catch (error) {
		console.error(error);
	}

	console.log("Clips concatenated");
}

function getConfigKey(dirPath: string): keyof Config | undefined {
	if (dirPath === config.LOCAL_RAW_CLIPS_PATH) {
		return "LOCAL_RAW_CLIPS_PATH";
	} else if (dirPath === config.LOCAL_PROCESSED_CLIPS_PATH) {
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

	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
		console.log(`Path created at: ${dirPath}`);
	}
}

function setupDirectories() {
	ensureDirectoryExistence(config.LOCAL_RAW_CLIPS_PATH as string);
	ensureDirectoryExistence(config.LOCAL_PROCESSED_CLIPS_PATH as string);
}
