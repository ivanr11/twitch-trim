import { google } from "googleapis";
import config from "../../config";
import path from "path";
import { readFile, writeFile } from "fs/promises";
import logger from "../../logger";
import { OAuth2Client } from "google-auth-library";

const TOKEN_PATH = path.join(process.cwd(), "token.json");

export default async function getOAuth2Client(code = null) {
	try {
		const oauth2client = new google.auth.OAuth2({
			clientId: config.YOUTUBE_CLIENT_ID,
			clientSecret: config.YOUTUBE_CLIENT_SECRET,
			redirectUri: config.REDIRECT_URL,
		});

		try {
			const tokenFile = (await readFile(TOKEN_PATH)).toString();
			const token = JSON.parse(tokenFile);
			oauth2client.setCredentials(token);
			return oauth2client;
		} catch {
			if (code) {
				return getNewToken(oauth2client, code);
			} else {
				return oauth2client;
			}
		}
	} catch (error) {
		logger.error(`getOAuth2Client :: ${error}`);
	}
}

async function getNewToken(
	oauth2client: OAuth2Client,
	authorizationCode: string,
) {
	const { tokens } = await oauth2client.getToken(authorizationCode);
	oauth2client.setCredentials(tokens);
	await writeFile(TOKEN_PATH, JSON.stringify(tokens));

	return oauth2client;
}
