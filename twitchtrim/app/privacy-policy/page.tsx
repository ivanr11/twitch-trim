export default function PrivacyPolicy() {
	return (
		<main className="flex flex-col min-h-screen items-center justify-center bg-[#424549] py-8 px-4">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold text-white text-center mb-12">
					Privacy Policy
				</h1>

				<div className="space-y-8 text-white">
					<section>
						<h2 className="text-2xl font-bold mb-4">Introduction</h2>
						<p>
							TwitchTrim is a web application that allows users to compile
							popular Twitch clips into YouTube videos. This privacy policy
							explains how we handle your data.
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-bold mb-4">Data We Collect</h2>
						<p>When you use TwitchTrim, we access:</p>
						<ul className="list-disc ml-6 mt-2">
							<li>Your YouTube account information to upload videos</li>
							<li>Basic Google profile information (email address and name)</li>
							<li>YouTube channel information necessary for video uploads</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-bold mb-4">How We Use Your Data</h2>
						<p>We only use your data to:</p>
						<ul className="list-disc ml-6 mt-2">
							<li>Authenticate you with YouTube</li>
							<li>Upload compiled videos to your YouTube channel</li>
							<li>Maintain basic user sessions</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-bold mb-4">Data Storage</h2>
						<ul className="list-disc ml-6">
							<li>We do not store any personal data permanently</li>
							<li>
								Authentication tokens are stored temporarily during your session
							</li>
							<li>Video content is stored after processing is complete</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-bold mb-4">Data Sharing</h2>
						<p>We do not share your data with any third parties.</p>
					</section>

					<section>
						<h2 className="text-2xl font-bold mb-4">Your Rights</h2>
						<p>You can:</p>
						<ul className="list-disc ml-6 mt-2">
							<li>Revoke access to your Google account at any time</li>
							<li>Request deletion of any temporary session data</li>
							<li>Contact us about your privacy concerns</li>
						</ul>
					</section>

					<section>
						<h2 className="text-2xl font-bold mb-4">Contact</h2>
						<p>
							For questions about this privacy policy, contact:
							ivan50303@gmail.com
						</p>
					</section>

					<section>
						<h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
						<p>
							We may update this policy as needed. Users will be notified of any
							significant changes.
						</p>
					</section>
				</div>
			</div>
		</main>
	);
}
