"use server";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import logger from "./logger";
import { refreshYouTubeToken } from "./youtube-auth";

export async function uploadVideo(date: string) {
	try {
		const oauth2Client = await refreshYouTubeToken();
		const youtube = google.youtube({
			version: "v3",
			auth: oauth2Client,
		});

		const videoFileName = `output-${date}.mp4`;
		const baseDir = process.cwd();
		const videoFilePath = path.join(
			baseDir,
			"public",
			"clips",
			"output",
			videoFileName,
		);

		if (!fs.existsSync(videoFilePath)) {
			const error = `Video file not found at ${videoFilePath}`;
			logger.error(`uploadVideo :: ${error}`);
			return {
				success: false,
				message: error,
			};
		}

		logger.info(`uploadVideo :: Starting upload for video ${videoFileName}`);

		const response = await youtube.videos.insert({
			part: ["snippet", "status"],
			notifySubscribers: false,
			requestBody: {
				snippet: {
					title: `TwitchTrim Video - ${date}`,
					description: "Compiled Twitch clips",
				},
				status: {
					privacyStatus: "private",
				},
			},
			media: {
				mimeType: "video/mp4",
				body: fs.createReadStream(videoFilePath),
			},
		});

		if (!response.data.id) {
			throw new Error("Failed to get video ID from YouTube response");
		}

		logger.info(
			`uploadVideo :: Successfully uploaded video with ID: ${response.data.id}`,
		);

		return {
			success: true,
			videoId: response.data.id,
			videoUrl: `https://youtube.com/watch?v=${response.data.id}`,
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`uploadVideo :: ${errorMessage}`);
		return {
			success: false,
			message: `Failed to upload video: ${errorMessage}`,
		};
	}
}
