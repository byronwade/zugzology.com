"use client";

import { useEffect } from "react";

declare global {
	interface Window {
		adsbygoogle: any[];
	}
}

export function AdSenseScript() {
	useEffect(() => {
		try {
			if (typeof window !== "undefined") {
				(window.adsbygoogle = window.adsbygoogle || []).push({});
			}
		} catch (err) {
			console.error("AdSense error:", err);
		}
	}, []);

	return null;
}
