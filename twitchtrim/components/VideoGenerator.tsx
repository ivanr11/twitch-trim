"use client";

import { useState } from "react";
import { getClips } from "@/lib/twitch-api";
import { createVideo } from "@/lib/video-processing";

type TimePeriod = "24h" | "7d" | "30d";

export default function VideoGenerator() {
	const [gameName, setGameName] = useState("");
	const [period, setPeriod] = useState<TimePeriod>("24h");
	const [videoUrl, setVideoUrl] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);

	function getStartDate(period: TimePeriod) {
		const now = new Date();
		switch (period) {
			case "24h":
				now.setHours(now.getHours() - 24);
				break;
			case "7d":
				now.setDate(now.getDate() - 7);
				break;
			case "30d":
				now.setDate(now.getDate() - 30);
				break;
		}
		return now.toISOString();
	}

	async function handleGenerate(e: React.FormEvent) {
		e.preventDefault();
		setIsProcessing(true);

		try {
			const clips = await getClips({
				game_name: gameName,
				started_at: getStartDate(period),
				first: 2,
			});

			const date = Date.now().toString();
			await createVideo(clips, date);
			setVideoUrl(`/clips/output/output-${date}.mp4`);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error(errorMessage);
		}

		setIsProcessing(false);
	}

	return (
		<div className="space-y-6">
			{videoUrl && (
				<div className="mb-8">
					<video
						controls
						src={videoUrl}
						className="w-full rounded-lg bg-[#18181b] shadow-lg"
					/>
					<a href={videoUrl} download className="">
						Download Video
					</a>
				</div>
			)}

			<form onSubmit={handleGenerate} className="space-y-4">
				<div className="flex gap-1 justify-center">
					<input
						type="text"
						value={gameName}
						onChange={(e) => setGameName(e.target.value)}
						placeholder="Twitch Category"
						className="w-max p-2.5 rounded-lg bg-[#18181b] border border-[#2d2d2d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9147ff] focus:border-transparent"
						required
					/>
					<select
						value={period}
						onChange={(e) => setPeriod(e.target.value as TimePeriod)}
						className="w-max p-2.5 rounded-lg bg-[#18181b] border border-[#2d2d2d] 
                                 text-white focus:outline-none focus:ring-2 
                                 focus:ring-[#9147ff] focus:border-transparent"
					>
						<option value="24h">Top 24H</option>
						<option value="7d">Top 7D</option>
						<option value="30d">Top 30D</option>
					</select>
				</div>

				<div></div>
				<div className="flex justify-center">
					<button
						type="submit"
						disabled={isProcessing || !gameName}
						className="w-60 p-3 mb-2 bg-[#9147ff] text-white rounded-lg font-medium
                             hover:bg-[#772ce8] disabled:bg-[#9147ff]/50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
					>
						{isProcessing ? "Generating..." : "Generate Video"}
					</button>
				</div>
			</form>
		</div>
	);
}
