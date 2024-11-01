import { getClips } from "../api/twitch/twitch";
import { createVideo, setupDirectories } from "../api/ffmpeg/ffmpeg";
import { GetClipsQueryParams } from "../types/twitchTypes";
import logger from "../logger";

const queryParams: GetClipsQueryParams = {
	game_id: "33214",
	started_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
	first: 2,
};

async function testCurrentProject() {
	try {
		const clips = await getClips(queryParams);
		const date = Date.now().toString();
		await setupDirectories(date);
		await createVideo(clips, date);
	} catch (error) {
		logger.error(error);
	}
}

testCurrentProject();
