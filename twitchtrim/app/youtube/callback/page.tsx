"use client";

import { handleYouTubeCallback } from "@/lib/youtube-auth";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function CallbackHandler() {
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const code = searchParams.get("code");
		if (code) {
			handleYouTubeCallback(code).then(() => router.push("/"));
		}
	}, [searchParams]);

	return <div>Processing YouTube Authorization...</div>;
}

export default function YouTubeCallback() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CallbackHandler />
		</Suspense>
	);
}
