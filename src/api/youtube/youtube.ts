import { google } from "googleapis";
import fs from "fs";
import path from "path";
import logger from "../../logger";
import getOAuth2Client from "./auth";

// scope: "https://www.googleapis.com/auth/youtube.upload"

async function uploadVideo(date: string) {
	try {
		const oauth2client = await getOAuth2Client();

		const youtube = google.youtube({
			version: "v3",
			auth: oauth2client,
		});

		const videoPath = `output-${date}.mp4`;
		const videoFilePath = path.resolve(videoPath);

		await youtube.videos.insert({
			part: ["snippet", "status"],
			notifySubscribers: false,
			requestBody: {
				snippet: {
					title: "Test video",
					description: "A test video",
				},
				status: {
					privacyStatus: "private",
				},
			},
			media: {
				body: fs.createReadStream(videoFilePath),
				mimeType: "video/mp4",
			},
		});
	} catch (error) {
		logger.error(`uploadVideo :: ${error}`);
	}
}
