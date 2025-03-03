"use client";

import { useState, useEffect } from "react";
import { Facebook, Twitter, Linkedin, Link2, Mail, Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BlogShareToolbarProps {
	title: string;
	url: string;
	description?: string;
}

export function BlogShareToolbar({ title, url, description }: BlogShareToolbarProps) {
	const [isMounted, setIsMounted] = useState(false);
	const [copied, setCopied] = useState(false);
	const [showMobileShare, setShowMobileShare] = useState(false);

	// Encode for sharing
	const encodedTitle = encodeURIComponent(title);
	const encodedUrl = encodeURIComponent(url);
	const encodedDescription = encodeURIComponent(description || "");

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			toast.success("Link copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			toast.error("Failed to copy link");
		}
	};

	if (!isMounted) return null;

	return (
		<>
			{/* Desktop fixed toolbar */}
			<div className="hidden md:flex fixed left-4 top-1/3 flex-col items-center space-y-3 z-50">
				<div className="bg-white dark:bg-[#242424] rounded-lg shadow-lg p-3 flex flex-col items-center space-y-4 border border-[#e6e6e6] dark:border-[#2f2f2f]">
					<span className="text-xs font-medium text-[#6b6b6b] dark:text-[#a8a8a8] mb-1">Share</span>

					<Button
						variant="ghost"
						size="icon"
						className="rounded-full hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] transition-colors"
						onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank")}
						aria-label="Share on Facebook"
					>
						<Facebook className="h-5 w-5 text-[#1877F2]" />
					</Button>

					<Button
						variant="ghost"
						size="icon"
						className="rounded-full hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] transition-colors"
						onClick={() =>
							window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank")
						}
						aria-label="Share on Twitter"
					>
						<Twitter className="h-5 w-5 text-[#1DA1F2]" />
					</Button>

					<Button
						variant="ghost"
						size="icon"
						className="rounded-full hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] transition-colors"
						onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank")}
						aria-label="Share on LinkedIn"
					>
						<Linkedin className="h-5 w-5 text-[#0A66C2]" />
					</Button>

					<Button
						variant="ghost"
						size="icon"
						className="rounded-full hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] transition-colors"
						onClick={() =>
							window.open(`mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`, "_blank")
						}
						aria-label="Share via Email"
					>
						<Mail className="h-5 w-5 text-[#6b6b6b] dark:text-[#a8a8a8]" />
					</Button>

					<div className="w-full h-px bg-[#e6e6e6] dark:bg-[#2f2f2f] my-1" />

					<Button
						variant="ghost"
						size="icon"
						className="rounded-full hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] transition-colors"
						onClick={handleCopyLink}
						aria-label="Copy Link"
					>
						{copied ? (
							<Check className="h-5 w-5 text-green-500" />
						) : (
							<Link2 className="h-5 w-5 text-[#6b6b6b] dark:text-[#a8a8a8]" />
						)}
					</Button>
				</div>
			</div>

			{/* Mobile floating share button */}
			<div className="md:hidden fixed bottom-6 right-6 z-50">
				<Button
					variant="default"
					size="icon"
					className="h-12 w-12 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 text-white"
					onClick={() => setShowMobileShare(!showMobileShare)}
					aria-label="Share Options"
				>
					<Share2 className="h-5 w-5" />
				</Button>

				{/* Mobile share menu */}
				{showMobileShare && (
					<div className="absolute bottom-16 right-0 bg-white dark:bg-[#242424] rounded-lg shadow-lg p-4 w-64 border border-[#e6e6e6] dark:border-[#2f2f2f]">
						<h3 className="text-sm font-medium text-[#242424] dark:text-[#e6e6e6] mb-3">Share this article</h3>
						<div className="grid grid-cols-3 gap-3">
							<Button
								variant="ghost"
								size="icon"
								className="flex flex-col items-center justify-center h-16 rounded-lg hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f]"
								onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank")}
							>
								<Facebook className="h-6 w-6 text-[#1877F2] mb-1" />
								<span className="text-xs text-[#6b6b6b] dark:text-[#a8a8a8]">Facebook</span>
							</Button>

							<Button
								variant="ghost"
								size="icon"
								className="flex flex-col items-center justify-center h-16 rounded-lg hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f]"
								onClick={() =>
									window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank")
								}
							>
								<Twitter className="h-6 w-6 text-[#1DA1F2] mb-1" />
								<span className="text-xs text-[#6b6b6b] dark:text-[#a8a8a8]">Twitter</span>
							</Button>

							<Button
								variant="ghost"
								size="icon"
								className="flex flex-col items-center justify-center h-16 rounded-lg hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f]"
								onClick={() =>
									window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank")
								}
							>
								<Linkedin className="h-6 w-6 text-[#0A66C2] mb-1" />
								<span className="text-xs text-[#6b6b6b] dark:text-[#a8a8a8]">LinkedIn</span>
							</Button>

							<Button
								variant="ghost"
								size="icon"
								className="flex flex-col items-center justify-center h-16 rounded-lg hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f]"
								onClick={() =>
									window.open(`mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`, "_blank")
								}
							>
								<Mail className="h-6 w-6 text-[#6b6b6b] dark:text-[#a8a8a8] mb-1" />
								<span className="text-xs text-[#6b6b6b] dark:text-[#a8a8a8]">Email</span>
							</Button>

							<Button
								variant="ghost"
								size="icon"
								className="flex flex-col items-center justify-center h-16 rounded-lg hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f]"
								onClick={handleCopyLink}
							>
								{copied ? (
									<>
										<Check className="h-6 w-6 text-green-500 mb-1" />
										<span className="text-xs text-green-500">Copied</span>
									</>
								) : (
									<>
										<Link2 className="h-6 w-6 text-[#6b6b6b] dark:text-[#a8a8a8] mb-1" />
										<span className="text-xs text-[#6b6b6b] dark:text-[#a8a8a8]">Copy Link</span>
									</>
								)}
							</Button>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
