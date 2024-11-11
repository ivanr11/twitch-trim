import { google } from "googleapis";
import config from "../../config";
import { OAuth2Client } from "google-auth-library";
import logger from "../../logger";
import fsPromises from "fs/promises";
import path from "path";

const TOKEN_PATH = path.join(process.cwd(), "token.json");

export default async function getOAuth2Client(authCode = null) {
	try {
		const oauth2Client = new google.auth.OAuth2({
			clientId: config.YOUTUBE_CLIENT_ID,
			clientSecret: config.YOUTUBE_CLIENT_SECRET,
			redirectUri: config.REDIRECT_URL,
		});

		try {
			const tokenFile = await fsPromises.readFile(TOKEN_PATH);
			const token = JSON.parse(tokenFile.toString());
			oauth2Client.setCredentials(token);

			return oauth2Client;
		} catch {
			if (authCode) {
				return getNewToken(oauth2Client, authCode);
			} else {
				return oauth2Client;
			}
		}
	} catch (error) {
		logger.error(`getOAuth2Client :: ${error}`);
	}
}

async function getNewToken(oauth2Client: OAuth2Client, authCode: string) {
	const { tokens } = await oauth2Client.getToken(authCode);
	oauth2Client.setCredentials(tokens);
	fsPromises.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));

	return oauth2Client;
}

// async function getAuthUrl(oauth2Client: OAuth2Client) {
// 	const authUrl = oauth2Client.generateAuthUrl({
// 		access_type: "offline",
// 		scope: "https://www.googleapis.com/auth/youtube.upload",
// 	});

// 	logger.info(`Authorization URL: ${authUrl}`);
// }
