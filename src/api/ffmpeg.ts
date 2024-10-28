import fs from "fs";
import { execSync } from "child_process";
import { Clip } from "../types/twitchTypes";
import config from "../config";
import { Config } from "../config";

export async function createVideo(clips: Clip[]) {
	setupDirectories();
	// FFmpeg component (createVideo)
	// -- Download the raw clips fetched from Twitch (downloadClips())
	// -- Process the raw clips (how to process?) into folder (processClips())
	//      -- Scale to 1920x1080 (must have same resolution and aspect ratio)
	// -- Use FFmpeg to concatenate processed clips into single video (how?) (concatenateClips())

	await downloadClips(clips);
	await processClips();
}

export async function downloadClips(clips: Clip[]) {
	console.log(`Downloading clips to ${config.LOCAL_RAW_CLIPS_PATH}...`);
	// Download each clip
	for (const clip of clips) {
		try {
			execSync(
				`streamlink --output ${config.LOCAL_RAW_CLIPS_PATH}/${clip.id}.mp4 ${clip.url} best`,
			);
			console.log(`Downloaded clip ${clip.id}`);
		} catch (error) {
			console.error("Exec error:", error);
		}

		// exec(
		// 	`streamlink --output ${config.LOCAL_RAW_CLIPS_PATH}/${clip.id}.mp4 ${clip.url} best`,
		// )
		// 	.on("error", (error) => {
		// 		console.error("Exec error:", error);
		// 	})
		// 	.on("close", () => {
		// 		console.log(`Downloaded clip ${clip.id}`);
		// 	});
	}
	console.log("All clips downloaded");
}

export async function processClips() {
	console.log("Processing clips...");
	// process each clip to be same resolution (1920x1080), aspect ratio(16:9), and same codecs (H.264, MPEG AAC Audio mp4A)

	const localRawClipsPath = config.LOCAL_RAW_CLIPS_PATH as string;
	const localProcessedClipsPath = config.LOCAL_PROCESSED_CLIPS_PATH as string;

	// process each clip
	fs.readdirSync(localRawClipsPath).forEach((file) => {
		try {
			execSync(
				`ffmpeg -i ${localRawClipsPath}/${file} -vcodec libx264 -acodec aac -vf scale=1920x1080 ${localProcessedClipsPath}/${file}`,
			);
			console.log(`Processed clip ${file}`);
		} catch (error) {
			console.error("Exec error:", error);
		}

		// exec(
		// 	`ffmpeg -i ${localRawClipsPath}/${file} -vcodec libx264 -acodec aac -vf scale=1920x1080 ${localProcessedClipsPath}/${file}`,
		// ).on("close", () => {
		// 	console.log(`Processed clip ${localRawClipsPath}/${file}`);
		// });
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

// function concatenateClips() {
// 	// Concatenate all clips in processed-clips directory (will all be of same codec)
// }

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
