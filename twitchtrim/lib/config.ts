// import "dotenv/config";

export const config = {
	twitch: {
		accessToken: process.env.TWITCH_ACCESS_TOKEN,
		clientId: process.env.TWITCH_CLIENT_ID,
	},
	youtube: {
		clientId: process.env.YOUTUBE_CLIENT_ID,
		clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
		redirectUrl: process.env.YOUTUBE_REDIRECT_URL,
	},
};
