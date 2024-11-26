"use client";

import VideoGenerator from "@/components/VideoGenerator";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
	const [showWarning, setShowWarning] = useState(true);

	return (
		<main className="flex flex-col min-h-screen items-center justify-center bg-[#424549] py-8 px-4">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold text-white text-center mb-20">
					TwitchTrim
				</h1>
				<VideoGenerator />
			</div>
			<div className="mb-8 flex flex-col justify-center items-center">
				<div className="w-3/4 mb-8">
					<h2 className="text-2xl font-bold mb-4">About TwitchTrim</h2>
					<p>
						Discover a revolutionary way to create and share Twitch highlight
						videos with TwitchTrim. Our innovative web application seamlessly
						integrates with the Twitch API to fetch the most exciting and
						memorable moments from your favorite Twitch categories. Simply
						choose your desired category, select the number of clips you want to
						include, and let our intelligent algorithms do the rest. TwitchTrim
						carefully curates and edits the clips, crafting a polished and
						entertaining video that captures the essence of Twitch action,
						saving you valuable time and effort.
					</p>
				</div>

				<div className="w-3/4 mb-8">
					<p>
						TwitchTrim goes beyond just video generation. With our seamless
						YouTube integration, you can effortlessly upload your created
						highlight videos directly to your YouTube channel, sharing your
						Twitch experiences with the world and growing your online presence.
					</p>
				</div>

				<div className="w-3/4">
					<p>
						Experience the future of Twitch highlight videos with TwitchTrim.
					</p>
				</div>

				{showWarning && (
					<div className="w-3/4 bg-yellow-100 border-l-4 border-yellow-500 p-2 mt-4 text-sm text-yellow-700  relative">
						<p className="pr-4">
							<span className="font-bold">Note:</span> During the sign-in
							process, you may see a Google security warning as this app is
							currently pending verification. You can safely proceed by clicking
							&quot;Advanced&quot; and then &quot;Go to railway.app
							(unsafe)&quot;.
						</p>
						<button
							onClick={() => setShowWarning(false)}
							className="absolute top-1 right-1 hover:text-yellow-900 w-4 h-4"
						>
							×
						</button>
					</div>
				)}
			</div>
			<footer className="absolute bottom-0 left-0 right-0 w-full py-4 text-center text-gray-300 text-sm bg-[#424549]">
				<div className="max-w-4xl mx-auto">
					<Link href="/privacy-policy" className="hover:text-white">
						Privacy Policy
					</Link>
				</div>
			</footer>
		</main>
	);
}
