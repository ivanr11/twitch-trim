"use server";

import util from "axios";
import {
	GetClipsQueryParams,
	Clip,
	TwitchCategory,
	CategorySearchResult,
} from "@/app/types/twitchTypes";
import { config } from "./config";
import logger from "./logger";

export async function getClient() {
	try {
		const baseUrl = "https://api.twitch.tv/helix";
		if (!config.twitch.accessToken || !config.twitch.clientId) {
			throw new Error("Missing Twitch API credentials");
		}

		const client = util.create({
			baseURL: baseUrl,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${config.twitch.accessToken}`,
				"Client-id": config.twitch.clientId,
			},
		});

		logger.info("getClient :: Twitch API client created successfully");
		return client;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`getClient :: ${errorMessage}`);
		throw new Error(`Failed to create Twitch API client: ${errorMessage}`);
	}
}

export async function searchCategories(
	query: string,
): Promise<CategorySearchResult[]> {
	try {
		if (!query) return [];

		const client = await getClient();
		const response = await client.get("/search/categories", {
			params: { query, first: 10 },
		});

		if (!response.data?.data) {
			throw new Error("Invalid response format from Twitch API");
		}

		return response.data.data.map((category: TwitchCategory) => ({
			id: category.id,
			name: category.name,
			boxArtUrl: category.box_art_url,
		}));
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`searchCategories :: ${errorMessage}`);
		throw new Error(`Error searching categories: ${errorMessage}`);
	}
}

async function getGameId(gameName: string) {
	try {
		const client = await getClient();
		const response = await client.get("/games", {
			params: { name: gameName },
		});

		if (!response.data.data.length) {
			throw new Error(`Game "${gameName}" not found`);
		}

		return response.data.data[0].id;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`getGameId :: ${errorMessage}`);
		throw new Error(`Failed to get game ID: ${errorMessage}`);
	}
}

export async function getClips(
	queryParams: Omit<GetClipsQueryParams, "game_id"> & { game_name: string },
): Promise<Clip[]> {
	try {
		logger.info("getClips :: Fetching clips with params:", queryParams);
		const gameId = await getGameId(queryParams.game_name);
		const client = await getClient();

		const response = await client.get("/clips", {
			params: {
				started_at: queryParams.started_at,
				first: queryParams.first,
				game_id: gameId,
			},
		});

		if (!response.data?.data) {
			throw new Error("Invalid response format from Twitch API");
		}

		const clips: Clip[] = response.data.data;
		logger.info(`getClips :: Successfully retrieved ${clips.length} clips`);
		return clips;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`getClips :: ${errorMessage}`);
		throw new Error(`Error fetching clips: ${errorMessage}`);
	}
}
