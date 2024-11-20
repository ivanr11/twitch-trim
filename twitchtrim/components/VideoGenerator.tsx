"use client";

import { useState, useEffect } from "react";
import { getClips } from "@/lib/twitch-api";
import { createVideo } from "@/lib/video-processing";
import { uploadVideo } from "@/lib/youtube-upload";
import { getYouTubeAuthUrl } from "@/lib/youtube-auth";

type TimePeriod = "24h" | "7d" | "30d";
type ProcessingState = "idle" | "generating" | "uploading";

export default function VideoGenerator() {
	const [gameName, setGameName] = useState("");
	const [period, setPeriod] = useState<TimePeriod>("24h");
	const [clipCount, setClipCount] = useState(2);
	const [videoUrl, setVideoUrl] = useState("");
	const [processingState, setProcessingState] =
		useState<ProcessingState>("idle");
	const [uploadToYouTube, setUploadToYouTube] = useState(false);
	const [isYouTubeAuthenticated, setIsYouTubeAuthenticated] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		checkYouTubeAuth();
	}, []);

	async function checkYouTubeAuth() {
		try {
			const response = await fetch("/api/check-youtube-auth");
			const { isAuthenticated } = await response.json();
			setIsYouTubeAuthenticated(isAuthenticated);
		} catch (error) {
			console.error("Failed to check YouTube auth status:", error);
			setIsYouTubeAuthenticated(false);
		}
	}

	async function handleYouTubeAuth() {
		const authUrl = await getYouTubeAuthUrl();
		window.location.href = authUrl;
	}

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

	function getProcessingMessage() {
		switch (processingState) {
			case "generating":
				return "Generating video...";
			case "uploading":
				return "Uploading to YouTube...";
			default:
				return "Generate Video";
		}
	}

	async function handleGenerate(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setProcessingState("generating");

		try {
			const clips = await getClips({
				game_name: gameName,
				started_at: getStartDate(period),
				first: clipCount,
			});

			const date = Date.now().toString();
			const videoResult = await createVideo(clips, date);

			if (videoResult.success) {
				setVideoUrl(`/clips/output/output-${date}.mp4`);

				if (uploadToYouTube) {
					setProcessingState("uploading");
					const uploadResult = await uploadVideo(date);

					if (!uploadResult.success) {
						throw new Error(
							`Failed to upload to YouTube: ${uploadResult.message}`,
						);
					}
				}
			} else {
				throw new Error("Failed to create video");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			setError(errorMessage);
			console.error(errorMessage);
		} finally {
			setProcessingState("idle");
		}
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
					<input
						type="number"
						value={clipCount}
						onChange={(e) =>
							setClipCount(
								Math.max(1, Math.min(20, parseInt(e.target.value) || 1)),
							)
						}
						min="1"
						max="20"
						className="w-24 p-2.5 rounded-lg bg-[#18181b] border border-[#2d2d2d] 
                                 text-white focus:outline-none focus:ring-2 
                                 focus:ring-[#9147ff] focus:border-transparent"
						title="Number of clips (1-20)"
					/>
				</div>

				<div className="flex justify-center items-center gap-2 text-white">
					<input
						type="checkbox"
						id="youtube-upload"
						checked={uploadToYouTube}
						onChange={(e) => setUploadToYouTube(e.target.checked)}
						className="w-4 h-4 rounded bg-[#18181b] border-[#2d2d2d]
                                 focus:ring-2 focus:ring-[#9147ff] focus:border-transparent"
						disabled={!isYouTubeAuthenticated}
					/>
					<label
						htmlFor="youtube-upload"
						className={!isYouTubeAuthenticated ? "opacity-50" : ""}
					>
						Upload to YouTube
					</label>
					{!isYouTubeAuthenticated && (
						<button
							type="button"
							onClick={handleYouTubeAuth}
							className="ml-2 text-sm text-[#ff0000] hover:text-[#cc0000]"
						>
							Sign in with YouTube
						</button>
					)}
				</div>

				{error && (
					<div className="text-red-400 text-sm p-3 bg-red-900/20 rounded-lg">
						{error}
					</div>
				)}

				<div className="flex justify-center">
					<button
						type="submit"
						disabled={processingState !== "idle" || !gameName}
						className="w-60 p-3 mb-2 bg-[#9147ff] text-white rounded-lg font-medium
                             hover:bg-[#772ce8] disabled:bg-[#9147ff]/50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
					>
						{getProcessingMessage()}
					</button>
				</div>
			</form>
		</div>
	);
}
