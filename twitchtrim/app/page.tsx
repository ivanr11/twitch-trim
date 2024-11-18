import VideoGenerator from "@/components/VideoGenerator";
import YouTubeAuthButton from "@/components/YouTubeAuthButton";

export default function Home() {
	return (
		<main className="p-6">
			<h1 className="text-2xl mb-4">TwitchTrim</h1>
			<YouTubeAuthButton />
			<VideoGenerator />
		</main>
	);
}
