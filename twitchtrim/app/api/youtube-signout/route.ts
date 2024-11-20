import { cookies } from "next/headers";
import logger from "@/lib/logger";

export async function POST() {
	try {
		const cookieStore = cookies();
		(await cookieStore).delete("youtube_tokens");

		logger.info("youtube-signout :: User signed out successfully");
		return new Response(null, { status: 200 });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logger.error(`youtube-signout :: ${errorMessage}`);
		return new Response(JSON.stringify({ error: "Failed to sign out" }), {
			status: 500,
		});
	}
}
