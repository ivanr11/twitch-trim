import { NextResponse } from "next/server";
import { searchCategories } from "@/lib/twitch-api";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get("query");

	if (!query) {
		return NextResponse.json([]);
	}

	try {
		const categories = await searchCategories(query);
		return NextResponse.json(categories);
	} catch (error) {
		console.error("Failed to search categories:", error);
		return NextResponse.json(
			{ error: "Failed to search categories" },
			{ status: 500 },
		);
	}
}
