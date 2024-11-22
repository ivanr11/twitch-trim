"use server";

import { google } from "googleapis";
import { cookies } from "next/headers";
import { config } from "./config";

const oauth2Client = new google.auth.OAuth2(
	config.youtube.clientId,
	config.youtube.clientSecret,
	config.youtube.redirectUrl,
);

export async function getYouTubeAuthUrl() {
	const scopes = ["https://www.googleapis.com/auth/youtube.upload"];

	const authUrl = oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: scopes,
		prompt: "consent",
	});

	return authUrl;
}

export async function handleYouTubeCallback(code: string) {
	const { tokens } = await oauth2Client.getToken(code);

	(await cookies()).set("youtube_tokens", JSON.stringify(tokens), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: tokens.expiry_date ? tokens.expiry_date - Date.now() : undefined,
	});

	return { success: true };
}

export async function refreshYouTubeToken() {
	const tokenCookie = (await cookies()).get("youtube_tokens");
	if (!tokenCookie) throw new Error("No stored tokens");

	const tokens = JSON.parse(tokenCookie.value);

	oauth2Client.setCredentials(tokens);
	const { credentials } = await oauth2Client.refreshAccessToken();

	(await cookies()).set("youtube_tokens", JSON.stringify(credentials), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: credentials.expiry_date
			? credentials.expiry_date - Date.now()
			: undefined,
	});

	return oauth2Client;
}
