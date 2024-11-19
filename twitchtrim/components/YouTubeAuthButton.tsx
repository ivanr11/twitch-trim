"use client";

import { getYouTubeAuthUrl } from "@/lib/youtube-auth";
// import { useState } from "react";

export default function YouTubeAuthButton() {
	// const [authUrl, setAuthUrl] = useState("");

	async function handleAuth() {
		const url = await getYouTubeAuthUrl();
		window.location.href = url;
	}

	return (
		<div className="flex justify-center">
			<button
				onClick={handleAuth}
				className="w-60 p-3 bg-[#ff0000] text-white rounded-lg font-medium
                     hover:bg-[#cc0000] transition duration-150 ease-in-out"
			>
				Sign in with YouTube
			</button>
		</div>
	);
}
