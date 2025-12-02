"use client";

import { Check, Facebook, Link2, Linkedin, Mail, Share2, Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type BlogShareToolbarProps = {
	title: string;
	url: string;
	description?: string;
};

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
		} catch (_err) {
			toast.error("Failed to copy link");
		}
	};

	if (!isMounted) {
		return null;
	}

	return (
		<>
			{/* Desktop fixed toolbar */}
			<div className="fixed top-1/3 left-4 z-50 hidden flex-col items-center space-y-3 md:flex">
				<div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-3 shadow-lg">
					<span className="mb-1 font-medium text-muted-foreground text-xs">Share</span>

					<Button
						aria-label="Share on Facebook"
						className="rounded-full transition-colors hover:bg-muted"
						onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank")}
						size="icon"
						variant="ghost"
					>
						<Facebook className="h-5 w-5 text-blue-600" />
					</Button>

					<Button
						aria-label="Share on Twitter"
						className="rounded-full transition-colors hover:bg-muted"
						onClick={() =>
							window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank")
						}
						size="icon"
						variant="ghost"
					>
						<Twitter className="h-5 w-5 text-sky-500" />
					</Button>

					<Button
						aria-label="Share on LinkedIn"
						className="rounded-full transition-colors hover:bg-muted"
						onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank")}
						size="icon"
						variant="ghost"
					>
						<Linkedin className="h-5 w-5 text-blue-700" />
					</Button>

					<Button
						aria-label="Share via Email"
						className="rounded-full transition-colors hover:bg-muted"
						onClick={() =>
							window.open(`mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`, "_blank")
						}
						size="icon"
						variant="ghost"
					>
						<Mail className="h-5 w-5 text-muted-foreground" />
					</Button>

					<div className="my-1 h-px w-full bg-border" />

					<Button
						aria-label="Copy Link"
						className="rounded-full transition-colors hover:bg-muted"
						onClick={handleCopyLink}
						size="icon"
						variant="ghost"
					>
						{copied ? (
							<Check className="h-5 w-5 text-green-500" />
						) : (
							<Link2 className="h-5 w-5 text-muted-foreground" />
						)}
					</Button>
				</div>
			</div>

			{/* Mobile floating share button */}
			<div className="fixed right-6 bottom-6 z-50 md:hidden">
				<Button
					aria-label="Share Options"
					className="h-12 w-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90"
					onClick={() => setShowMobileShare(!showMobileShare)}
					size="icon"
					variant="default"
				>
					<Share2 className="h-5 w-5" />
				</Button>

				{/* Mobile share menu */}
				{showMobileShare && (
					<div className="absolute right-0 bottom-16 w-64 rounded-lg border bg-card p-4 shadow-lg">
						<h3 className="mb-3 font-medium text-foreground text-sm">Share this article</h3>
						<div className="grid grid-cols-3 gap-3">
							<Button
								className="flex h-16 flex-col items-center justify-center rounded-lg hover:bg-muted"
								onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank")}
								size="icon"
								variant="ghost"
							>
								<Facebook className="mb-1 h-6 w-6 text-blue-600" />
								<span className="text-muted-foreground text-xs">Facebook</span>
							</Button>

							<Button
								className="flex h-16 flex-col items-center justify-center rounded-lg hover:bg-muted"
								onClick={() =>
									window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank")
								}
								size="icon"
								variant="ghost"
							>
								<Twitter className="mb-1 h-6 w-6 text-sky-500" />
								<span className="text-muted-foreground text-xs">Twitter</span>
							</Button>

							<Button
								className="flex h-16 flex-col items-center justify-center rounded-lg hover:bg-muted"
								onClick={() =>
									window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank")
								}
								size="icon"
								variant="ghost"
							>
								<Linkedin className="mb-1 h-6 w-6 text-blue-700" />
								<span className="text-muted-foreground text-xs">LinkedIn</span>
							</Button>

							<Button
								className="flex h-16 flex-col items-center justify-center rounded-lg hover:bg-muted"
								onClick={() =>
									window.open(`mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`, "_blank")
								}
								size="icon"
								variant="ghost"
							>
								<Mail className="mb-1 h-6 w-6 text-muted-foreground" />
								<span className="text-muted-foreground text-xs">Email</span>
							</Button>

							<Button
								className="flex h-16 flex-col items-center justify-center rounded-lg hover:bg-muted"
								onClick={handleCopyLink}
								size="icon"
								variant="ghost"
							>
								{copied ? (
									<>
										<Check className="mb-1 h-6 w-6 text-green-500" />
										<span className="text-green-500 text-xs">Copied</span>
									</>
								) : (
									<>
										<Link2 className="mb-1 h-6 w-6 text-muted-foreground" />
										<span className="text-muted-foreground text-xs">Copy Link</span>
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
