"use client";

import { Check, Facebook, Link2, Linkedin, Mail, Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type BlogShareToolbarHorizontalProps = {
	title: string;
	url: string;
	description?: string;
};

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
		} catch (_err) {
			toast.error("Failed to copy link");
		}
	};

	if (!isMounted) {
		return null;
	}

	return (
		<div className="my-8 w-full rounded-lg border-border border-t border-b bg-muted/50 p-4 py-6">
			<div className="flex flex-col space-y-4">
				<h3 className="font-medium text-base text-foreground">Share this article</h3>

				<div className="flex flex-wrap gap-2">
					<Button
						className="rounded-full shadow-sm hover:bg-muted"
						onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank")}
						size="sm"
						variant="outline"
					>
						<Facebook className="mr-2 h-4 w-4 text-blue-600" />
						Facebook
					</Button>

					<Button
						className="rounded-full shadow-sm hover:bg-muted"
						onClick={() =>
							window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank")
						}
						size="sm"
						variant="outline"
					>
						<Twitter className="mr-2 h-4 w-4 text-sky-500" />
						Twitter
					</Button>

					<Button
						className="rounded-full shadow-sm hover:bg-muted"
						onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank")}
						size="sm"
						variant="outline"
					>
						<Linkedin className="mr-2 h-4 w-4 text-blue-700" />
						LinkedIn
					</Button>

					<Button
						className="rounded-full shadow-sm hover:bg-muted"
						onClick={() =>
							window.open(`mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`, "_blank")
						}
						size="sm"
						variant="outline"
					>
						<Mail className="mr-2 h-4 w-4" />
						Email
					</Button>

					<Button
						className="rounded-full shadow-sm hover:bg-muted"
						onClick={handleCopyLink}
						size="sm"
						variant="outline"
					>
						{copied ? (
							<>
								<Check className="mr-2 h-4 w-4 text-green-500" />
								Copied!
							</>
						) : (
							<>
								<Link2 className="mr-2 h-4 w-4" />
								Copy Link
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}
