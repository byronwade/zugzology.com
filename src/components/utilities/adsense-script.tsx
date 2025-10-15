"use client";

import { useEffect } from "react";

export function AdSenseScript() {
	useEffect(() => {
		try {
			if (typeof window !== "undefined") {
				(window.adsbygoogle = window.adsbygoogle || []).push({});
			}
		} catch (_err) {}
	}, []);

	return null;
}
