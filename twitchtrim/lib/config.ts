import "dotenv/config";

export const config = {
	twitch: {
		accessToken: process.env.TWITCH_ACCESS_TOKEN,
		clientId: process.env.TWITCH_CLIENT_ID,
	},
	paths: {
		rawClips: process.env.LOCAL_RAW_CLIPS_PATH,
		processedClips: process.env.LOCAL_PROCESSED_CLIPS_PATH,
		output: process.env.OUTPUT_FILE_NAME,
	},
	youtube: {
		clientId: process.env.YOUTUBE_CLIENT_ID,
		clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
		redirectUrl: process.env.YOUTUBE_REDIRECT_URL,
	},
};
