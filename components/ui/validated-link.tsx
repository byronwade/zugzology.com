"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { validateLink } from "@/lib/utils/link-validator";

interface ValidatedLinkProps {
	href: string;
	children: React.ReactNode;
	className?: string;
	prefetch?: boolean;
	onClick?: () => void;
	title?: string;
	showWarning?: boolean;
	fallbackHref?: string;
	[key: string]: any;
}

export function ValidatedLink({
	href,
	children,
	className = "",
	prefetch,
	title,
	showWarning = false,
	fallbackHref,
	...props
}: ValidatedLinkProps) {
	const [validatedHref, setValidatedHref] = useState<string | null>(null);
	const [validatedTitle, setValidatedTitle] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isValid, setIsValid] = useState(false);

	// Only validate internal links (starting with / or not containing ://)
	const isInternalLink = href.startsWith("/") || !href.includes("://");

	useEffect(() => {
		async function validateAndSetLink() {
			if (!isInternalLink) {
				// External links are always considered valid
				setValidatedHref(href);
				setValidatedTitle(title || null);
				setIsValid(true);
				setIsLoading(false);
				return;
			}

			try {
				const result = await validateLink(href);
				if (result) {
					setValidatedHref(result.actualLink);
					setValidatedTitle(result.title || title || null);
					setIsValid(result.isValid);
				} else {
					setIsValid(false);
				}
			} catch (error) {
				console.error("Error validating link:", error);
				setIsValid(false);
			} finally {
				setIsLoading(false);
			}
		}

		setIsLoading(true);
		validateAndSetLink();
	}, [href, isInternalLink, title]);

	if (isLoading) {
		// Show a placeholder while validating
		return <span className={className}>{children}</span>;
	}

	if (!isValid) {
		if (!fallbackHref) {
			// If no fallback and link is invalid, show a disabled span
			return (
				<span className={`${className} cursor-not-allowed opacity-70`} title="This link is not available">
					{children}
				</span>
			);
		}

		// Use fallback if available
		return (
			<Link href={fallbackHref} className={className} prefetch={prefetch} {...props}>
				{children}
				{showWarning && <span className="ml-1 text-yellow-500 text-xs">(redirected)</span>}
			</Link>
		);
	}

	// Link is valid, render normally
	return (
		<Link
			href={validatedHref || href}
			className={className}
			prefetch={prefetch}
			title={validatedTitle || title}
			{...props}
		>
			{children}
		</Link>
	);
}

// Static version that doesn't validate links at runtime
export function StaticDynamicLink({ href, children, className = "", ...props }: ValidatedLinkProps) {
	return (
		<Link href={href} className={className} {...props}>
			{children}
		</Link>
	);
}
