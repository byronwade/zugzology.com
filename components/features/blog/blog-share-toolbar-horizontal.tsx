"use client";

import { useState, useEffect } from "react";
import { Facebook, Twitter, Linkedin, Link2, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BlogShareToolbarHorizontalProps {
	title: string;
	url: string;
	description?: string;
}

export function BlogShareToolbarHorizontal({ title, url, description }: BlogShareToolbarHorizontalProps) {
	const [isMounted, setIsMounted] = useState(false);
	const [copied, setCopied] = useState(false);

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
		<div className="w-full py-6 border-t border-b border-[#e6e6e6] dark:border-[#2f2f2f] my-8 bg-[#f9f9f9] dark:bg-[#1a1a1a] rounded-lg p-4">
			<div className="flex flex-col space-y-4">
				<h3 className="text-base font-medium text-[#242424] dark:text-[#e6e6e6]">Share this article</h3>

				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						size="sm"
						className="rounded-full border-[#e6e6e6] dark:border-[#2f2f2f] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] text-[#242424] dark:text-[#e6e6e6] shadow-sm"
						onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank")}
					>
						<Facebook className="h-4 w-4 text-[#1877F2] mr-2" />
						Facebook
					</Button>

					<Button
						variant="outline"
						size="sm"
						className="rounded-full border-[#e6e6e6] dark:border-[#2f2f2f] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] text-[#242424] dark:text-[#e6e6e6] shadow-sm"
						onClick={() =>
							window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank")
						}
					>
						<Twitter className="h-4 w-4 text-[#1DA1F2] mr-2" />
						Twitter
					</Button>

					<Button
						variant="outline"
						size="sm"
						className="rounded-full border-[#e6e6e6] dark:border-[#2f2f2f] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] text-[#242424] dark:text-[#e6e6e6] shadow-sm"
						onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank")}
					>
						<Linkedin className="h-4 w-4 text-[#0A66C2] mr-2" />
						LinkedIn
					</Button>

					<Button
						variant="outline"
						size="sm"
						className="rounded-full border-[#e6e6e6] dark:border-[#2f2f2f] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] text-[#242424] dark:text-[#e6e6e6] shadow-sm"
						onClick={() =>
							window.open(`mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`, "_blank")
						}
					>
						<Mail className="h-4 w-4 mr-2" />
						Email
					</Button>

					<Button
						variant="outline"
						size="sm"
						className="rounded-full border-[#e6e6e6] dark:border-[#2f2f2f] hover:bg-[#f0f0f0] dark:hover:bg-[#2f2f2f] text-[#242424] dark:text-[#e6e6e6] shadow-sm"
						onClick={handleCopyLink}
					>
						{copied ? (
							<>
								<Check className="h-4 w-4 text-green-500 mr-2" />
								Copied!
							</>
						) : (
							<>
								<Link2 className="h-4 w-4 mr-2" />
								Copy Link
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
