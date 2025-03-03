"use client";

import { ReactNode } from "react";

interface MarqueeProps {
	className?: string;
	children?: ReactNode;
}

const phrases = [
	{ text: "GROW ", highlight: "BETTER" },
	{ text: "THINK ", highlight: "BIGGER" },
];

export function Marquee({ className, children }: MarqueeProps) {
	// If children are provided, use them instead of the default content
	if (children) {
		return (
			<div className={`marquee-container bg-black ${className || ""}`}>
				<div className="overflow-hidden py-4">{children}</div>
			</div>
		);
	}

	// Default marquee implementation
	const content = phrases.map((phrase, index) => (
		<span
			key={index}
			className="marquee-item marquee-text flex items-center"
			style={{ "--color": "#ffffff" } as React.CSSProperties}
		>
			<span className="opacity-75">{phrase.text}</span>
			<span
				className="text-highlight font-extrabold tracking-tight text-blue-400"
				style={
					{
						"--color": "#ffffff",
						textShadow: "0 0 20px rgba(96, 165, 250, 0.2)",
					} as React.CSSProperties
				}
			>
				{phrase.highlight}
			</span>
			<span className="mx-16 opacity-25">|</span>
		</span>
	));

	// Create copies for smooth infinite scrolling
	const copies = Array.from({ length: 12 }, (_, i) => (
		<span key={i} className="marquee-content" aria-hidden={i !== 0 ? "true" : undefined}>
			{content}
		</span>
	));

	return (
		<div className={`marquee-container bg-black ${className || ""}`}>
			<div
				className="marquee marquee--left font-sans marquee--animate py-4"
				style={
					{
						"--duration": "60s",
						"--space": "0px",
						"--text-size": "4rem",
						letterSpacing: "0.02em",
					} as React.CSSProperties
				}
				role="marquee"
			>
				{copies}
			</div>
		</div>
	);
}
