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

const validateConfig = () => {
	const required = [
		"TWITCH_ACCESS_TOKEN",
		"TWITCH_CLIENT_ID",
		"YOUTUBE_CLIENT_ID",
		"YOUTUBE_CLIENT_SECRET",
		"YOUTUBE_REDIRECT_URL",
	];

	for (const key of required) {
		if (!process.env[key]) {
			throw new Error(`Missing required environment variable: ${key}`);
		}
	}
};

validateConfig();
