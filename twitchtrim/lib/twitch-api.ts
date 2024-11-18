"use server";

import util from "axios";
import { GetClipsQueryParams, Clip } from "@/app/twitchTypes";
import { config } from "./config";
import logger from "./logger";
import https from "https";

export async function getClient() {
	const baseUrl = "https://api.twitch.tv/helix";
	const client = util.create({
		baseURL: baseUrl,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${config.twitch.accessToken}`,
			"Client-id": config.twitch.clientId,
		},
		httpsAgent: new https.Agent({
			rejectUnauthorized: false,
			family: 4,
		}),
	});
	return client;
}

export async function getClips(
	queryParams: GetClipsQueryParams,
): Promise<Clip[]> {
	try {
		const client = getClient();
		const response = await (
			await client
		).get("/clips", {
			params: {
				...queryParams,
			},
		});

		const clips: Clip[] = response.data.data;
		logger.info("found clips", clips);
		return clips;
	} catch (error) {
		throw new Error(`Error fetching clips: ${error}`);
	}
}
