"use client";

import {
	Check,
	Copy,
	Download,
	Eye,
	EyeOff,
	Facebook,
	Linkedin,
	Mail,
	MessageSquare,
	MoreHorizontal,
	Printer,
	Share2,
	TextQuote,
	Twitter,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type BlogQuickActionsProps = {
	title: string;
	url: string;
	content?: React.ReactNode;
	image?: {
		url: string;
		altText?: string;
		width: number;
		height: number;
	};
};

type SharePlatform = "facebook" | "twitter" | "linkedin" | "email" | "native" | "whatsapp" | "telegram";

export function BlogQuickActions({ title, url, content, image }: BlogQuickActionsProps) {
	const [readingMode, setReadingMode] = useState(false);
	const [isCopied, setIsCopied] = useState(false);
	const [isPrinting, setIsPrinting] = useState(false);
	const _hiddenInputRef = useRef<HTMLInputElement>(null);
	const { isOpen: isCartOpen } = useCart();

	// Create hidden input once on mount
	useEffect(() => {
		const input = document.createElement("input");
		input.style.position = "fixed"; // Change to fixed positioning
		input.style.opacity = "0";
		input.style.pointerEvents = "none"; // Prevent interaction
		input.style.zIndex = "-1"; // Keep it behind other elements
		input.id = "copy-input";
		document.body.appendChild(input);

		return () => {
			document.body.removeChild(input);
		};
	}, []);

	// Close reading mode with Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && readingMode) {
				setReadingMode(false);
			}
		};

		if (readingMode) {
			document.body.style.overflow = "hidden";
			window.addEventListener("keydown", handleEscape);
		} else {
			document.body.style.overflow = "";
		}

		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", handleEscape);
		};
	}, [readingMode]);

	const handlePrint = () => {
		setIsPrinting(true);
		setTimeout(() => {
			window.print();
			setTimeout(() => setIsPrinting(false), 500);
		}, 100);
	};

	const handleDownloadPDF = async () => {
		toast.info("PDF download feature coming soon!");
	};

	const handleCopyLink = async (e: React.MouseEvent) => {
		// Prevent any default behavior
		e.preventDefault();
		e.stopPropagation();

		const showSuccess = () => {
			setIsCopied(true);
			toast.success("Link copied to clipboard!");
			setTimeout(() => setIsCopied(false), 2000);
		};

		const showError = () => {
			toast.error("Couldn't copy automatically. The URL has been selected - please copy manually.");
		};

		try {
			// Try the modern clipboard API first
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(url);
				showSuccess();
				return;
			}

			// Fallback for iOS and older browsers
			const input = document.getElementById("copy-input") as HTMLInputElement;
			if (input) {
				input.value = url;

				// Save current scroll position
				const scrollPos = window.scrollY;

				// Select and copy
				input.focus({ preventScroll: true }); // Prevent scroll on focus
				input.select();
				input.setSelectionRange(0, 99_999);

				// Try execCommand as fallback
				if (document.execCommand("copy")) {
					// Restore scroll position
					window.scrollTo(0, scrollPos);
					showSuccess();
					return;
				}
			}

			// If all else fails, show the URL and prompt manual copy
			showError();
		} catch (_err) {
			showError();
		} finally {
			// Ensure we remove focus from the hidden input
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		}
	};

	const handleCopyQuote = () => {
		const selection = window.getSelection();
		if (selection?.toString()) {
			const quote = `"${selection.toString()}" - From ${title}\n${url}`;
			navigator.clipboard.writeText(quote);
			toast.success("Quote copied with citation!");
		} else {
			toast.error("Please select text to quote");
		}
	};

	const handleShare = async (platform: SharePlatform) => {
		const shareData = {
			title,
			text: `Check out this article: ${title}`,
			url,
		};

		try {
			if (platform === "native" && typeof navigator.share !== "undefined") {
				await navigator.share(shareData);
				return;
			}

			const shareUrls: Record<Exclude<SharePlatform, "native">, string> = {
				facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
				twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareData.text)}`,
				linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
				email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareData.text} ${url}`)}`,
				whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${url}`)}`,
				telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareData.text)}`,
			};

			if (platform !== "native" && shareUrls[platform]) {
				window.open(shareUrls[platform], "_blank", "width=600,height=400");
			}
		} catch (_err) {
			toast.error("Failed to share");
		}
	};

	const handleReadingMode = () => {
		setReadingMode(!readingMode);
		if (readingMode) {
			toast.success("Reading mode disabled");
		} else {
			toast.success("Reading mode enabled", {
				description: "Press Escape or click the X to exit",
			});
		}
	};

	// Don't render the toolbar if cart is open
	if (isCartOpen) {
		return null;
	}

	return (
		<>
			{/* Quick Actions Bar */}
			<div className="-translate-x-1/2 fixed bottom-8 left-1/2 z-[101]" data-print-hidden="true">
				<div className="flex items-center gap-1.5 rounded-full border bg-card/80 p-1.5 shadow-lg backdrop-blur-md transition-all duration-200 hover:shadow-xl">
					{/* Primary Actions */}
					<div className="flex items-center gap-1.5">
						<Button
							className={cn(
								"h-9 rounded-full px-4 transition-all duration-200",
								"hover:scale-105 active:scale-95",
								isCopied && "bg-green-500 text-white shadow-green-500/20 shadow-md hover:bg-green-600"
							)}
							onClick={handleCopyLink}
							size="sm"
							variant={isCopied ? "default" : "ghost"}
						>
							{isCopied ? (
								<Check className="h-4 w-4 transition-all duration-200" />
							) : (
								<Copy className="h-4 w-4 transition-all duration-200" />
							)}
							<span className="ml-2 hidden sm:inline">{isCopied ? "Copied" : "Copy Link"}</span>
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									className="h-9 rounded-full px-4 transition-all duration-200 hover:scale-105 active:scale-95"
									size="sm"
									variant="ghost"
								>
									<Share2 className="h-4 w-4" />
									<span className="ml-2 hidden sm:inline">Share</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="w-56 rounded-xl border bg-card/80 p-2 shadow-xl backdrop-blur-md"
							>
								<DropdownMenuLabel className="px-2 py-1.5 font-medium text-sm">Share this article</DropdownMenuLabel>
								<DropdownMenuSeparator className="my-1" />
								{typeof navigator !== "undefined" && "share" in navigator && (
									<DropdownMenuItem
										className="cursor-pointer rounded-lg transition-colors hover:bg-muted"
										onClick={() => handleShare("native")}
									>
										<Share2 className="mr-2 h-4 w-4" />
										Share natively
									</DropdownMenuItem>
								)}
								<DropdownMenuItem
									className="cursor-pointer rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
									onClick={() => handleShare("facebook")}
								>
									<Facebook className="mr-2 h-4 w-4 text-blue-600" />
									Facebook
								</DropdownMenuItem>
								<DropdownMenuItem
									className="cursor-pointer rounded-lg transition-colors hover:bg-sky-50 dark:hover:bg-sky-900/20"
									onClick={() => handleShare("twitter")}
								>
									<Twitter className="mr-2 h-4 w-4 text-sky-500" />
									Twitter
								</DropdownMenuItem>
								<DropdownMenuItem
									className="cursor-pointer rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
									onClick={() => handleShare("linkedin")}
								>
									<Linkedin className="mr-2 h-4 w-4 text-blue-700" />
									LinkedIn
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<div className="mx-0.5 h-5 w-px bg-muted" />

					{/* Secondary Actions */}
					<div className="flex items-center gap-1.5">
						<Button
							className={cn(
								"h-9 rounded-full px-4 transition-all duration-200",
								"hover:scale-105 active:scale-95",
								readingMode && "bg-muted shadow-sm"
							)}
							onClick={handleReadingMode}
							size="sm"
							variant="ghost"
						>
							{readingMode ? (
								<EyeOff className="h-4 w-4 transition-all duration-200" />
							) : (
								<Eye className="h-4 w-4 transition-all duration-200" />
							)}
							<span className="ml-2 hidden sm:inline">{readingMode ? "Exit" : "Reader"}</span>
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									className="h-9 rounded-full px-4 transition-all duration-200 hover:scale-105 active:scale-95"
									size="sm"
									variant="ghost"
								>
									<MoreHorizontal className="h-4 w-4" />
									<span className="ml-2 hidden sm:inline">More</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="w-56 rounded-xl border bg-card/80 p-2 shadow-xl backdrop-blur-md"
							>
								<DropdownMenuItem
									className="cursor-pointer rounded-lg transition-colors hover:bg-muted"
									onClick={handlePrint}
								>
									<Printer className="mr-2 h-4 w-4" />
									Print article
								</DropdownMenuItem>
								<DropdownMenuItem
									className="cursor-pointer rounded-lg transition-colors hover:bg-muted"
									onClick={handleDownloadPDF}
								>
									<Download className="mr-2 h-4 w-4" />
									Save as PDF
								</DropdownMenuItem>
								<DropdownMenuItem
									className="cursor-pointer rounded-lg transition-colors hover:bg-muted"
									onClick={handleCopyQuote}
								>
									<TextQuote className="mr-2 h-4 w-4" />
									Copy quote
								</DropdownMenuItem>
								<DropdownMenuSeparator className="my-1" />
								<DropdownMenuItem
									className="cursor-pointer rounded-lg transition-colors hover:bg-green-50 dark:hover:bg-green-900/20"
									onClick={() => handleShare("whatsapp")}
								>
									<MessageSquare className="mr-2 h-4 w-4 text-green-600" />
									Share on WhatsApp
								</DropdownMenuItem>
								<DropdownMenuItem
									className="cursor-pointer rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
									onClick={() => handleShare("telegram")}
								>
									<MessageSquare className="mr-2 h-4 w-4 text-blue-500" />
									Share on Telegram
								</DropdownMenuItem>
								<DropdownMenuItem
									className="cursor-pointer rounded-lg transition-colors hover:bg-muted"
									onClick={() => handleShare("email")}
								>
									<Mail className="mr-2 h-4 w-4" />
									Share via Email
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			{/* Reading Mode Overlay */}
			{readingMode && (
				<div
					className="reading-overlay fixed inset-0 z-[100] overflow-y-auto bg-white dark:bg-background"
					data-print-hidden="true"
				>
					<div className="relative mx-auto max-w-3xl px-4 py-16">
						<button
							aria-label="Close reading mode"
							className="fixed top-4 right-4 rounded-full bg-muted p-2 transition-colors hover:bg-muted"
							onClick={() => setReadingMode(false)}
						>
							<X className="h-5 w-5" />
						</button>
						<article className="prose dark:prose-invert prose-lg prose-gray mx-auto pb-24">
							<h1 className="mb-8 font-black text-5xl text-foreground sm:text-5xl">{title}</h1>
							{image && (
								<div className="not-prose mb-8">
									<div className="relative aspect-[16/9] overflow-hidden rounded-lg">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											alt={image.altText || title}
											className="w-full rounded-lg object-cover"
											height={image.height}
											src={image.url}
											width={image.width}
										/>
									</div>
								</div>
							)}
							{typeof content === "string" ? <div dangerouslySetInnerHTML={{ __html: content }} /> : content}
						</article>
					</div>
				</div>
			)}

			{/* Print-specific version */}
			{isPrinting && (
				<div className="print:!visible hidden print:block print:w-full">
					<article className="print-article">
						<h1 className="print-title">{title}</h1>
						{image && (
							<div className="print-image">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									alt={image.altText || title}
									src={image.url}
									style={{ maxWidth: "100%", width: "100%", height: "auto" }}
								/>
							</div>
						)}
						<div className="print-content">
							{typeof content === "string" ? <div dangerouslySetInnerHTML={{ __html: content }} /> : content}
						</div>
						<footer className="print-footer">
							<p className="print-source">Originally published at: {url}</p>
						</footer>
					</article>
				</div>
			)}
		</>
	);
}
