import { google } from "googleapis";
import fs from "fs";
import logger from "../../logger";
import path from "path";
import getOAuth2Client from "./auth";

export async function uploadVideo(date: string) {
	try {
		logger.info("uploadVideo :: Uploading video to YouTube...");

		const oauth2Client = await getOAuth2Client();
		const youtube = google.youtube({
			version: "v3",
			auth: oauth2Client,
		});

		const videoFileName = `output-${date}.mp4`;
		const videoFilePath = path.resolve(videoFileName);

		const res = await youtube.videos.insert({
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
				mimeType: "video/mp4",
				body: fs.createReadStream(videoFilePath),
			},
		});

		logger.info(`uploadVideo :: ${res.status} -- ${res.data}`);
		logger.info("uploadVideo :: done");
	} catch (error) {
		logger.error(`uploadVideo :: ${error}`);
	}
}
