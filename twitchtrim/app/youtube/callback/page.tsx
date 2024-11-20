"use client";

import { handleYouTubeCallback } from "@/lib/youtube-auth";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function YouTubeCallback() {
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
