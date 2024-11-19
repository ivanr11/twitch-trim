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
		<div className="">
			<form onSubmit={handleGenerate} className="">
				<div>
					<input
						type="text"
						value={gameName}
						onChange={(e) => setGameName(e.target.value)}
						placeholder="Enter Twitch category (e.g., 'League of Legends')"
						className=""
						required
					/>
				</div>

				<div>
					<select
						value={period}
						onChange={(e) => setPeriod(e.target.value as TimePeriod)}
						className=""
					>
						<option value="24h">Top 24H</option>
						<option value="7d">Top 7D</option>
						<option value="30d">Top 30D</option>
					</select>
				</div>

				<button type="submit" disabled={isProcessing || !gameName} className="">
					{isProcessing ? "Generating..." : "Generate Video"}
				</button>
			</form>

			{videoUrl && (
				<div className="mt-4">
					<video controls src={videoUrl} className="w-full rounded" />
					<a href={videoUrl} download className="">
						Download Video
					</a>
				</div>
			)}
		</div>
	);
}
