import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { Readable } from "stream";
import logger from "@/lib/logger";

export async function GET(
	request: NextRequest,
	props: { params: Promise<{ filename: string }> },
) {
	const params = await props.params;
	const filename = params.filename;
	const videoPath = path.join(
		process.cwd(),
		"public",
		"clips",
		"output",
		filename,
	);

	try {
		const stats = await stat(videoPath);
		const stream = createReadStream(videoPath);

		const headers = new Headers();
		headers.set("content-length", stats.size.toString());
		headers.set("content-type", "video/mp4");
		headers.set("accept-ranges", "bytes");

		return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
			status: 200,
			headers,
		});
	} catch (error) {
		logger.error(`video/[filename] :: ${error}`);
		return NextResponse.json({ error: "Video not found" }, { status: 404 });
	}
}
