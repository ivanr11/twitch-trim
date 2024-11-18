"use client";

import { useState } from "react";
import { getClips } from "@/lib/twitch-api";
import { createVideo } from "@/lib/video-processing";

type TimePeriod = "24h" | "7d" | "30d" | "all";

export default function VideoGenerator() {
	const [gameId, setGameId] = useState("");
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
			case "all":
				return "";
		}
		return now.toISOString();
	}

	async function handleGenerate(e: React.FormEvent) {
		e.preventDefault();
		setIsProcessing(true);
		try {
			const clips = await getClips({
				game_id: gameId,
				started_at: getStartDate(period),
				first: 2,
			});
			const date = Date.now().toString();
			// await setupDirectories(date);
			await createVideo(clips, date);
			setVideoUrl(`/videos/output-${date}.mp4`);
		} catch (error) {
			console.error(error);
		}
		setIsProcessing(false);
	}

	return (
		<div>
			<form onSubmit={handleGenerate} className="space-y-4">
				<input
					type="text"
					value={gameId}
					onChange={(e) => setGameId(e.target.value)}
					placeholder="Category/Game ID"
					className="block w-full p-2 border rounded"
				/>
				<select
					value={period}
					onChange={(e) => setPeriod(e.target.value as TimePeriod)}
					className="block w-full p-2 border rounded"
				>
					<option value="24h">Top 24H</option>
					<option value="7d">Top 7D</option>
					<option value="30d">Top 30D</option>
					<option value="all">Top All Time</option>
				</select>
				<button
					type="submit"
					disabled={isProcessing}
					className="w-full p-2 bg-blue-500 text-white rounded"
				>
					{isProcessing ? "Generating..." : "Generate Video"}
				</button>
			</form>

			{videoUrl && (
				<div className="mt-4">
					<video controls src={videoUrl} className="w-full" />
					<a
						href={videoUrl}
						download
						className="block mt-2 text-center text-blue-500"
					>
						Download Video
					</a>
				</div>
			)}
		</div>
	);
}
