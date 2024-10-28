import fs from "fs";
import { exec } from "child_process";
import { Clip } from "../types/twitchTypes";
import config from "../config";
import { Config } from "../config";

async function createVideo(clips: Clip[]) {
	// FFmpeg component (createVideo)
	// -- Download the raw clips fetched from Twitch (downloadClips())
	// -- Process the raw clips (how to process?) into folder (processClips())
	//      -- Scale to 1920x1080 (must have same resolution and aspect ratio)
	// -- Use FFmpeg to concatenate processed clips into single video (how?) (concatenateClips())

	downloadClips(clips);
	processClips();
}

function processClips() {
	setupDirectories();

	// Look in raw clips directory, (process) scale each clip to 1080 and same aspect ratio, store in
	// processed clips folder
	// fs.readdirSync(local);
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

export async function downloadClips(clips: Clip[]) {
	// Download each clip
	for (const clip of clips) {
		exec(
			`streamlink --output ${config.LOCAL_RAW_CLIPS_PATH}/${clip.id}.mp4 ${clip.url} best`,
		)
			.on("error", (error) => {
				console.error("Exec error:", error);
			})
			.on("close", () => {
				console.log(
					`Downloaded clip ${clip.id} to ${config.LOCAL_RAW_CLIPS_PATH}/${clip.id}`,
				);
			});
	}
}
