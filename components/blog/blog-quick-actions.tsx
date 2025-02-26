"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Share2, Printer, Bookmark, Facebook, Twitter, Linkedin, Mail, Copy, Download, Eye, EyeOff, TextQuote, MessageSquare, MoreHorizontal, BookmarkCheck, X, Check } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface BlogQuickActionsProps {
	title: string;
	url: string;
	content?: React.ReactNode;
	image?: {
		url: string;
		altText?: string;
		width: number;
		height: number;
	};
}

type SharePlatform = "facebook" | "twitter" | "linkedin" | "email" | "native" | "whatsapp" | "telegram";

export function BlogQuickActions({ title, url, content, image }: BlogQuickActionsProps) {
	const [readingMode, setReadingMode] = useState(false);
	const [isCopied, setIsCopied] = useState(false);
	const [isPrinting, setIsPrinting] = useState(false);
	const hiddenInputRef = useRef<HTMLInputElement>(null);

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
				input.setSelectionRange(0, 99999);

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
		} catch (err) {
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
		if (selection && selection.toString()) {
			const quote = `"${selection.toString()}" - From ${title}\n${url}`;
			navigator.clipboard.writeText(quote);
			toast.success("Quote copied with citation!");
		} else {
			toast.error("Please select text to quote");
		}
	};

	const handleShare = async (platform: SharePlatform) => {
		const shareData = {
			title: title,
			text: `Check out this article: ${title}`,
			url: url,
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
		} catch (err) {
			toast.error("Failed to share");
		}
	};

	const handleReadingMode = () => {
		setReadingMode(!readingMode);
		if (!readingMode) {
			toast.success("Reading mode enabled", {
				description: "Press Escape or click the X to exit",
			});
		} else {
			toast.success("Reading mode disabled");
		}
	};

	return (
		<>
			{/* Quick Actions Bar */}
			<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[101]" data-print-hidden="true">
				<div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border shadow-lg transition-all duration-200 hover:shadow-xl">
					{/* Primary Actions */}
					<div className="flex items-center gap-1.5">
						<Button onClick={handleCopyLink} variant={isCopied ? "default" : "ghost"} size="sm" className={cn("rounded-full h-9 px-4 transition-all duration-200", "hover:scale-105 active:scale-95", isCopied && "bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-500/20")}>
							{isCopied ? <Check className="w-4 h-4 transition-all duration-200" /> : <Copy className="w-4 h-4 transition-all duration-200" />}
							<span className="hidden sm:inline ml-2">{isCopied ? "Copied" : "Copy Link"}</span>
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="rounded-full h-9 px-4 transition-all duration-200 hover:scale-105 active:scale-95">
									<Share2 className="w-4 h-4" />
									<span className="hidden sm:inline ml-2">Share</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56 rounded-xl p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border shadow-xl">
								<DropdownMenuLabel className="text-sm font-medium px-2 py-1.5">Share this article</DropdownMenuLabel>
								<DropdownMenuSeparator className="my-1" />
								{typeof navigator !== "undefined" && "share" in navigator && (
									<DropdownMenuItem onClick={() => handleShare("native")} className="cursor-pointer rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
										<Share2 className="w-4 h-4 mr-2" />
										Share natively
									</DropdownMenuItem>
								)}
								<DropdownMenuItem onClick={() => handleShare("facebook")} className="cursor-pointer rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20">
									<Facebook className="w-4 h-4 mr-2 text-blue-600" />
									Facebook
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleShare("twitter")} className="cursor-pointer rounded-lg transition-colors hover:bg-sky-50 dark:hover:bg-sky-900/20">
									<Twitter className="w-4 h-4 mr-2 text-sky-500" />
									Twitter
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleShare("linkedin")} className="cursor-pointer rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20">
									<Linkedin className="w-4 h-4 mr-2 text-blue-700" />
									LinkedIn
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					<div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />

					{/* Secondary Actions */}
					<div className="flex items-center gap-1.5">
						<Button onClick={handleReadingMode} variant="ghost" size="sm" className={cn("rounded-full h-9 px-4 transition-all duration-200", "hover:scale-105 active:scale-95", readingMode && "bg-gray-100 dark:bg-gray-800 shadow-sm")}>
							{readingMode ? <EyeOff className="w-4 h-4 transition-all duration-200" /> : <Eye className="w-4 h-4 transition-all duration-200" />}
							<span className="hidden sm:inline ml-2">{readingMode ? "Exit" : "Reader"}</span>
						</Button>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="rounded-full h-9 px-4 transition-all duration-200 hover:scale-105 active:scale-95">
									<MoreHorizontal className="w-4 h-4" />
									<span className="hidden sm:inline ml-2">More</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-56 rounded-xl p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border shadow-xl">
								<DropdownMenuItem onClick={handlePrint} className="cursor-pointer rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
									<Printer className="w-4 h-4 mr-2" />
									Print article
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleDownloadPDF} className="cursor-pointer rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
									<Download className="w-4 h-4 mr-2" />
									Save as PDF
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleCopyQuote} className="cursor-pointer rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
									<TextQuote className="w-4 h-4 mr-2" />
									Copy quote
								</DropdownMenuItem>
								<DropdownMenuSeparator className="my-1" />
								<DropdownMenuItem onClick={() => handleShare("whatsapp")} className="cursor-pointer rounded-lg transition-colors hover:bg-green-50 dark:hover:bg-green-900/20">
									<MessageSquare className="w-4 h-4 mr-2 text-green-600" />
									Share on WhatsApp
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleShare("telegram")} className="cursor-pointer rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20">
									<MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
									Share on Telegram
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => handleShare("email")} className="cursor-pointer rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
									<Mail className="w-4 h-4 mr-2" />
									Share via Email
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			{/* Reading Mode Overlay */}
			{readingMode && (
				<div className="fixed inset-0 bg-white dark:bg-gray-950 z-[100] overflow-y-auto reading-overlay" data-print-hidden="true">
					<div className="relative max-w-3xl mx-auto px-4 py-16">
						<button onClick={() => setReadingMode(false)} className="fixed top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Close reading mode">
							<X className="w-5 h-5" />
						</button>
						<article className="prose dark:prose-invert prose-lg prose-gray mx-auto pb-24">
							<h1 className="text-5xl font-black text-gray-900 dark:text-gray-100 sm:text-5xl mb-8">{title}</h1>
							{image && (
								<div className="not-prose mb-8">
									<div className="aspect-[16/9] relative overflow-hidden rounded-lg">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img src={image.url} alt={image.altText || title} width={image.width} height={image.height} className="object-cover rounded-lg w-full" />
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
				<div className="hidden print:block print:!visible print:w-full">
					<article className="print-article">
						<h1 className="print-title">{title}</h1>
						{image && (
							<div className="print-image">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={image.url} alt={image.altText || title} style={{ maxWidth: "100%", width: "100%", height: "auto" }} />
							</div>
						)}
						<div className="print-content">{typeof content === "string" ? <div dangerouslySetInnerHTML={{ __html: content }} /> : content}</div>
						<footer className="print-footer">
							<p className="print-source">Originally published at: {url}</p>
						</footer>
					</article>
				</div>
			)}
		</>
	);
}
