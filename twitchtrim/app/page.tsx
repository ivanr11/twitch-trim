import VideoGenerator from "@/components/VideoGenerator";

export default function Home() {
	return (
		<main className="flex flex-col min-h-screen items-center justify-center bg-[#424549] py-8 px-4">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold text-white text-center mb-20">
					TwitchTrim
				</h1>
				<VideoGenerator />
			</div>

			<div className="w-3/4 mb-8">
				<h2 className="text-2xl font-bold mb-4">About TwitchTrim</h2>
				<p>
					Discover a revolutionary way to create and share Twitch highlight
					videos with TwitchTrim. Our innovative web application seamlessly
					integrates with the Twitch API to fetch the most exciting and
					memorable moments from your favorite Twitch categories. Simply choose
					your desired category, select the number of clips you want to include,
					and let our intelligent algorithms do the rest. TwitchTrim carefully
					curates and edits the clips, crafting a polished and entertaining
					video that captures the essence of Twitch action, saving you valuable
					time and effort.
				</p>
			</div>

			<div className="w-3/4 mb-8">
				<p>
					TwitchTrim goes beyond just video generation. With our seamless
					YouTube integration, you can effortlessly upload your created
					highlight videos directly to your YouTube channel, sharing your Twitch
					experiences with the world and growing your online presence.
				</p>
			</div>

			<div className="w-3/4">
				<p>Experience the future of Twitch highlight videos with TwitchTrim.</p>
			</div>
		</main>
	);
}
