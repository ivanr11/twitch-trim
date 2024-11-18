"use client";

import { getYouTubeAuthUrl } from "@/lib/youtube-auth";
// import { useState } from "react";

export default function YouTubeAuthButton() {
	// const [authUrl, setAuthUrl] = useState("");

	async function handleAuth() {
		const url = await getYouTubeAuthUrl();
		window.location.href = url;
	}

	return <button onClick={handleAuth}>Authorize YouTube</button>;
}
