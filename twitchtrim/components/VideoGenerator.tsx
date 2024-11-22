"use client";

import { useState, useEffect } from "react";
import { getClips } from "@/lib/twitch-api";
import { createVideo } from "@/lib/video-processing";
import { uploadVideo } from "@/lib/youtube-upload";
import { getYouTubeAuthUrl } from "@/lib/youtube-auth";
import CategorySearch from "./CategorySearch";

type TimePeriod = "24h" | "7d" | "30d" | "6m" | "1y";
type ProcessingState = "idle" | "generating" | "uploading" | "loading-video";

const ERROR_MESSAGES = {
	VIDEO_NOT_FOUND: "Unable to load the video. Please try again.",
	VIDEO_GENERATION: "Unable to generate the video. Please try again later.",
	YOUTUBE_UPLOAD: "Failed to upload to YouTube. Please try again.",
	YOUTUBE_AUTH:
		"Unable to verify YouTube authentication. Please try signing in again.",
	YOUTUBE_SIGNOUT: "Unable to sign out. Please try again.",
	DEFAULT: "Something went wrong. Please try again later.",
};

export default function VideoGenerator() {
	const [gameName, setGameName] = useState("");
	const [period, setPeriod] = useState<TimePeriod>("24h");
	const [clipCount, setClipCount] = useState(2);
	const [videoId, setVideoId] = useState("");
	const [videoUrl, setVideoUrl] = useState("");
	const [youtubeVideoUrl, setYoutubeVideoUrl] = useState("");
	const [processingState, setProcessingState] =
		useState<ProcessingState>("idle");
	const [uploadToYouTube, setUploadToYouTube] = useState(false);
	const [isYouTubeAuthenticated, setIsYouTubeAuthenticated] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		async function checkVideo() {
			if (!videoId) return;

			setProcessingState((prev) =>
				prev === "uploading" ? prev : "loading-video",
			);
			try {
				const response = await fetch(`/api/video/${videoId}`, {
					method: "GET",
				});
				if (response.ok) {
					setVideoUrl(`/api/video/${videoId}`);
				} else {
					throw new Error("VIDEO_NOT_FOUND");
				}
			} catch (error) {
				setError(ERROR_MESSAGES.VIDEO_NOT_FOUND);
				console.error("Failed to load video:", error);
			} finally {
				setProcessingState((prev) => (prev === "uploading" ? prev : "idle"));
			}
		}

		checkVideo();
	}, [videoId]);

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
		try {
			const authUrl = await getYouTubeAuthUrl();
			window.location.href = authUrl;
		} catch (error) {
			console.error("YouTube auth error:", error);
			setError(ERROR_MESSAGES.YOUTUBE_AUTH);
		}
	}

	async function handleSignOut() {
		try {
			await fetch("/api/youtube-signout", { method: "POST" });
			setIsYouTubeAuthenticated(false);
			setUploadToYouTube(false);
		} catch (error) {
			console.error("Sign out error:", error);
			setError(ERROR_MESSAGES.YOUTUBE_SIGNOUT);
		}
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
			case "6m":
				now.setMonth(now.getMonth() - 6);
				break;
			case "1y":
				now.setFullYear(now.getFullYear() - 1);
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
			case "loading-video":
				return "Loading video...";
			default:
				return "Generate Video";
		}
	}

	async function handleGenerate(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setVideoUrl("");
		setVideoId("");
		setYoutubeVideoUrl("");
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
				setVideoId(`output-${date}.mp4`);

				if (uploadToYouTube) {
					setProcessingState("uploading");
					const uploadResult = await uploadVideo(date);
					if (uploadResult.success && uploadResult.videoUrl) {
						setYoutubeVideoUrl(uploadResult.videoUrl);
						setProcessingState("idle");
					} else {
						throw new Error("YOUTUBE_UPLOAD");
					}
				} else {
					setProcessingState("idle");
				}
			} else {
				throw new Error("VIDEO_GENERATION");
			}
		} catch (error) {
			console.error("Generation error:", error);
			const errorType = error instanceof Error ? error.message : "DEFAULT";
			setError(
				ERROR_MESSAGES[errorType as keyof typeof ERROR_MESSAGES] ||
					ERROR_MESSAGES.DEFAULT,
			);
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
					<a
						href={videoUrl}
						download={videoId}
						className="text-blue-400 hover:text-blue-300"
					>
						Download Video
					</a>
				</div>
			)}

			{youtubeVideoUrl && (
				<div className="relative text-green-400 text-center p-4 bg-green-900/20 rounded-lg mt-4">
					<button
						onClick={() => setYoutubeVideoUrl("")}
						className="absolute top-2 right-2 text-gray-400 hover:text-gray-300"
						aria-label="Close message"
					>
						×
					</button>
					Video successfully uploaded to YouTube!
					<a
						href={youtubeVideoUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="block mt-2 text-blue-400 hover:text-blue-300"
					>
						View on YouTube
					</a>
				</div>
			)}

			{processingState === "loading-video" && (
				<div className="text-center text-gray-400">Loading video...</div>
			)}

			<form onSubmit={handleGenerate} className="space-y-4">
				<div className="flex gap-2 justify-center items-end">
					<div className="flex flex-col gap-2">
						<label htmlFor="game-name" className="text-white text-sm">
							Category
						</label>
						<CategorySearch value={gameName} onChange={setGameName} required />
					</div>

					<div className="flex flex-col gap-2">
						<label htmlFor="time-period" className="text-white text-sm">
							Time Period
						</label>
						<select
							id="time-period"
							value={period}
							onChange={(e) => setPeriod(e.target.value as TimePeriod)}
							className="w-max p-3 rounded-lg bg-[#18181b] border border-[#2d2d2d] 
                                 text-white focus:outline-none focus:ring-2 
                                 focus:ring-[#9147ff] focus:border-transparent"
						>
							<option value="24h">Top 24H</option>
							<option value="7d">Top 7D</option>
							<option value="30d">Top 30D</option>
							<option value="6m">Top 6M</option>
							<option value="1y">Top 1Y</option>
						</select>
					</div>

					<div className="flex flex-col gap-2">
						<label htmlFor="clip-count" className="text-white text-sm">
							Number of Clips
						</label>
						<input
							id="clip-count"
							type="number"
							value={clipCount}
							onChange={(e) =>
								setClipCount(
									Math.max(1, Math.min(5, parseInt(e.target.value) || 1)),
								)
							}
							min="1"
							max="5"
							className="w-24 p-2.5 rounded-lg bg-[#18181b] border border-[#2d2d2d] 
                                 text-white focus:outline-none focus:ring-2 
                                 focus:ring-[#9147ff] focus:border-transparent"
							title="Number of clips (1-5)"
						/>
					</div>
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
					{!isYouTubeAuthenticated ? (
						<button
							type="button"
							onClick={handleYouTubeAuth}
							className="ml-2 text-sm text-[#ff0000] hover:text-[#cc0000]"
						>
							Sign in with YouTube
						</button>
					) : (
						<button
							type="button"
							onClick={handleSignOut}
							className="ml-2 text-sm text-gray-400 hover:text-gray-300"
						>
							Sign out
						</button>
					)}
				</div>

				{error && (
					<div className="relative text-red-400 text-sm p-4 bg-red-900/20 rounded-lg">
						<button
							onClick={() => setError("")}
							className="absolute top-0 right-1 text-gray-400 hover:text-gray-300"
							aria-label="Close error"
						>
							×
						</button>
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
