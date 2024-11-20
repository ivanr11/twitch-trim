// app/api/check-youtube-auth/route.ts
import { cookies } from "next/headers";
import logger from "@/lib/logger";

export async function GET() {
	try {
		const cookieStore = cookies();
		const youtubeTokens = (await cookieStore).get("youtube_tokens");

		return new Response(
			JSON.stringify({
				isAuthenticated: !!youtubeTokens,
			}),
			{ status: 200 },
		);
	} catch (error) {
		logger.error(`GET (route.ts):: ${error}`);
		return new Response(
			JSON.stringify({
				isAuthenticated: false,
				error: "Failed to check authentication status",
			}),
			{ status: 500 },
		);
	}
}
