import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "TwitchTrim",
	description: "Compile and upload Twitch clips",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<meta
				name="google-site-verification"
				content="zqPDqQEoGyeL372vuyzdIgS7VnH2GKbMVXOTVT8kohs"
			/>
			<body className={inter.className}>{children}</body>
		</html>
	);
}
