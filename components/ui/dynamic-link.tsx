"use client";

import React, { useState, useEffect } from "react";
import { Link } from '@/components/ui/link';
import { validateLink } from "@/lib/utils/link-validator";

interface DynamicLinkProps {
	href: string;
	children: React.ReactNode;
	className?: string;
	prefetch?: boolean;
	onClick?: () => void;
	title?: string;
	showWarning?: boolean;
	fallbackHref?: string;
	[key: string]: any; // For any other props
}

interface LinkValidationResult {
	isValid: boolean;
	actualLink: string;
	title: string;
}

export function DynamicLink({
	href,
	children,
	className = "",
	prefetch,
	onClick,
	title,
	showWarning = false,
	fallbackHref,
	...props
}: DynamicLinkProps) {
	const [linkInfo, setLinkInfo] = useState<LinkValidationResult | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function checkLink() {
			try {
				// Only validate links that are internal and start with /
				if (href && (href.startsWith("/") || !href.includes("://"))) {
					const info = await validateLink(href);
					setLinkInfo(info);
				} else {
					// External links are always considered valid
					setLinkInfo({
						isValid: true,
						actualLink: href,
						title: title || "",
					});
				}
			} catch (error) {
				console.error("Error validating link:", error);
				// Fallback to the original link
				setLinkInfo({
					isValid: false,
					actualLink: fallbackHref || href,
					title: title || "",
				});
			} finally {
				setIsLoading(false);
			}
		}

		checkLink();
	}, [href, title, fallbackHref]);

	// While validating, render a placeholder or the original link
	if (isLoading) {
		return (
			<span className={`${className} opacity-70`} {...props}>
				{children}
			</span>
		);
	}

	// If link validation failed or link doesn't exist and no fallback is provided
	if (!linkInfo) {
		return (
			<span className={`${className} cursor-not-allowed opacity-50`} {...props}>
				{children}
			</span>
		);
	}

	// If the link doesn't exist but we have an alternative
	if (!linkInfo.isValid && showWarning) {
		return (
			<Link
				href={linkInfo.actualLink}
				className={`${className} relative group`}
				prefetch={prefetch}
				onClick={onClick}
				title={linkInfo.title || title}
				{...props}
			>
				{children}
				<span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
					Original link not found, redirected
				</span>
			</Link>
		);
	}

	// Normal link with validated href
	return (
		<Link
			href={linkInfo.actualLink}
			className={className}
			prefetch={prefetch}
			onClick={onClick}
			title={linkInfo.title || title}
			{...props}
		>
			{children}
		</Link>
	);
}

// Server component version that doesn't validate links at runtime
// but still provides the correct typing and props forwarding
export function StaticDynamicLink({
	href,
	children,
	className = "",
	prefetch,
	onClick,
	title,
	...props
}: DynamicLinkProps) {
	return (
		<Link href={href} className={className} prefetch={prefetch} onClick={onClick} title={title} {...props}>
			{children}
		</Link>
	);
}
