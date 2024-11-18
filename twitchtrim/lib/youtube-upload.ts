"use server";
import { google } from "googleapis";
import fs from "fs";
import path from "path";

export async function uploadVideo(date: string) {
	try {
		// const oauth2Client = await getOAuth2Client();
		const youtube = google.youtube({
			version: "v3",
			// auth: oauth2Client,
		});

		const videoFileName = `output-${date}.mp4`;
		const videoFilePath = path.resolve(videoFileName);

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

		return {
			success: true,
			videoId: response.data.id,
		};
	} catch (error) {
		console.error("YouTube upload error:", error);
		return {
			success: false,
			message: error,
		};
	}
}
