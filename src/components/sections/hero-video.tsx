"use client";

import { useEffect, useState } from "react";

type NetworkInformation = {
	saveData?: boolean;
	effectiveType?: string;
};

/**
 * Mounts the hero video only where it is worth its cost.
 *
 * Autoplaying the 1.1 MB clip was measured at ~2,980 ms of main-thread blocking
 * on Lighthouse's throttled mobile profile — 87% of the page's total blocking
 * time (3,420 ms with the video, 440 ms without). Decode competes directly with
 * hydration on a slow CPU.
 *
 * The poster is rendered unconditionally by the server as the LCP image, so
 * small screens, data-saver users, slow connections and anyone who has asked to
 * reduce motion get a still frame and none of that cost. Everyone else gets the
 * video once the main thread is idle. Because the poster is frame 1 of this
 * exact clip, the handover is invisible.
 */
export function HeroVideo(): React.ReactElement | null {
	const [enabled, setEnabled] = useState(false);

	useEffect(() => {
		if (!window.matchMedia("(min-width: 768px)").matches) {
			return;
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}

		const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
		if (connection?.saveData === true) {
			return;
		}
		if (connection?.effectiveType && /(^|-)(2g|slow-2g)$/.test(connection.effectiveType)) {
			return;
		}

		const start = () => setEnabled(true);
		if (typeof window.requestIdleCallback === "function") {
			const id = window.requestIdleCallback(start, { timeout: 2500 });
			return () => window.cancelIdleCallback(id);
		}
		const id = window.setTimeout(start, 1500);
		return () => window.clearTimeout(id);
	}, []);

	if (!enabled) {
		return null;
	}

	return (
		<video
			aria-hidden="true"
			autoPlay
			className="video-hero absolute inset-0 h-full w-full object-cover"
			disablePictureInPicture
			disableRemotePlayback
			loop
			muted
			playsInline
			preload="auto"
			tabIndex={-1}
		>
			<source src="/videos/mushroom-hero.mp4" type="video/mp4" />
		</video>
	);
}
