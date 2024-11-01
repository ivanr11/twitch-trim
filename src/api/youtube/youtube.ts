import { google } from "googleapis";
import config from "../../config";

const oauth2Client = new google.auth.OAuth2(
	config.YOUTUBE_CLIENT_ID,
	config.YOUTUBE_CLIENT_SECRET,
	config.REDIRECT_URL,
);

const url = oauth2Client.generateAuthUrl({
	access_type: "offline",
	scope: "https://www.googleapis.com/auth/youtube.upload",
});
