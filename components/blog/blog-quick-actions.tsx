"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Share2, Printer, Bookmark, Facebook, Twitter, Linkedin, Mail, Copy, Download, Eye, EyeOff, TextQuote, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface BlogQuickActionsProps {
	title: string;
	url: string;
}

type SharePlatform = "facebook" | "twitter" | "linkedin" | "email" | "native" | "whatsapp" | "telegram";

export function BlogQuickActions({ title, url }: BlogQuickActionsProps) {
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [readingMode, setReadingMode] = useState(false);

	const handlePrint = () => {
		window.print();
	};

	const handleDownloadPDF = async () => {
		// This is a placeholder - you would need to implement PDF generation
		toast.info("PDF download feature coming soon!");
	};

	const handleBookmark = () => {
		setIsBookmarked(!isBookmarked);
		if (!isBookmarked) {
			toast.success("Article bookmarked!");
		} else {
			toast.success("Bookmark removed");
		}
	};

	const handleReadingMode = () => {
		setReadingMode(!readingMode);
		document.body.classList.toggle("reading-mode");
		if (!readingMode) {
			toast.success("Reading mode enabled");
		} else {
			toast.success("Reading mode disabled");
		}
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(url);
			toast.success("Link copied to clipboard!");
		} catch (err) {
			toast.error("Failed to copy link");
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

	return (
		<>
			<Button onClick={handlePrint} variant="outline" className="flex items-center justify-center gap-2">
				<Printer className="w-4 h-4" />
				<span className="hidden sm:inline">Print</span>
			</Button>

			<Button onClick={handleDownloadPDF} variant="outline" className="flex items-center justify-center gap-2">
				<Download className="w-4 h-4" />
				<span className="hidden sm:inline">Save PDF</span>
			</Button>

			<Button onClick={handleReadingMode} variant="outline" className="flex items-center justify-center gap-2">
				{readingMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
				<span className="hidden sm:inline">Reading Mode</span>
			</Button>

			<Button onClick={handleCopyQuote} variant="outline" className="flex items-center justify-center gap-2">
				<TextQuote className="w-4 h-4" />
				<span className="hidden sm:inline">Quote</span>
			</Button>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="flex items-center justify-center gap-2">
						<Share2 className="w-4 h-4" />
						<span className="hidden sm:inline">Share</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel>Share this article</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{typeof navigator !== "undefined" && "share" in navigator && (
						<DropdownMenuItem onClick={() => handleShare("native")}>
							<Share2 className="w-4 h-4 mr-2" />
							Share natively
						</DropdownMenuItem>
					)}
					<DropdownMenuItem onClick={() => handleShare("facebook")}>
						<Facebook className="w-4 h-4 mr-2" />
						Facebook
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleShare("twitter")}>
						<Twitter className="w-4 h-4 mr-2" />
						Twitter
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleShare("linkedin")}>
						<Linkedin className="w-4 h-4 mr-2" />
						LinkedIn
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleShare("whatsapp")}>
						<MessageSquare className="w-4 h-4 mr-2" />
						WhatsApp
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleShare("telegram")}>
						<MessageSquare className="w-4 h-4 mr-2" />
						Telegram
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleShare("email")}>
						<Mail className="w-4 h-4 mr-2" />
						Email
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleCopyLink}>
						<Copy className="w-4 h-4 mr-2" />
						Copy link
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Button onClick={handleBookmark} variant={isBookmarked ? "default" : "outline"} className="flex items-center justify-center gap-2">
				<Bookmark className="w-4 h-4" />
				<span className="hidden sm:inline">Bookmark</span>
			</Button>
		</>
	);
}
