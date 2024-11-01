import util from "axios";
import { GetClipsQueryParams, Clip } from "../../types/twitchTypes";
import config from "../../config";

export function getClient() {
	const baseUrl = "https://api.twitch.tv/helix";
	const client = util.create({
		baseURL: baseUrl,
		headers: {
			"Content-Type": "application/json",
			Authorization: config.ACCESS_TOKEN,
			"Client-id": config.CLIENT_ID,
		},
	});
	return client;
}

export async function getClips(
	queryParams: GetClipsQueryParams,
): Promise<Clip[]> {
	try {
		const client = getClient();
		const response = await client.get("/clips", {
			params: {
				...queryParams,
			},
		});

		const clips: Clip[] = response.data.data;

		if (response.status >= 200 && response.status < 300) {
			console.log("Request successful:", response.data);
		}

		return clips;
	} catch (error) {
		throw new Error(`Error fetching clips: ${error}`);
	}
}
