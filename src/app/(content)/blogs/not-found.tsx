"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, BookOpen, Home } from "lucide-react";
import { Link } from "@/components/ui/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const blogNotFoundMessages = [
	"This article wandered off the path",
	"Can't find this spore in our library",
	"This post is still incubating",
	"Article not found in our cultivation",
];

export default function BlogNotFound() {
	const [searchQuery, setSearchQuery] = useState("");
	const [funnyMessage] = useState(() => blogNotFoundMessages[Math.floor(Math.random() * blogNotFoundMessages.length)]);

	useEffect(() => {
		if (typeof window !== "undefined" && window.gtag) {
			const blogSlug = window.location.pathname.split("/").pop();
			window.gtag("event", "page_view", {
				page_type: "blog_404",
				page_location: window.location.href,
				blog_slug: blogSlug,
				error_type: "blog_not_found",
			});
		}
	}, []);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
		}
	};

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
			{/* Full-screen Background Image */}
			<Image
				src="https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=1920&q=80"
				alt="Mushroom on wood"
				fill
				className="object-cover"
				priority
				quality={90}
			/>

			{/* Dark Gradient Overlay */}
			<div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90" />

			{/* Content */}
			<div className="relative z-10 mx-auto max-w-2xl px-6 py-16 text-center">
				<div className="mb-12 space-y-6">
					<h1 className="font-bold text-6xl text-white tracking-tight sm:text-7xl">
						Article Not Found
					</h1>

					<p className="text-2xl text-white/90 sm:text-3xl">
						{funnyMessage}
					</p>

					<p className="mx-auto max-w-md text-lg text-white/70">
						The blog post you're looking for might have been moved or is still being cultivated by our content team.
					</p>
				</div>

				{/* Search Bar */}
				<div className="mx-auto mb-8 max-w-xl">
					<form onSubmit={handleSearch} className="flex gap-3">
						<div className="relative flex-1">
							<Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/40" />
							<Input
								type="search"
								placeholder="Search our knowledge base..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="border-white/20 bg-white/10 py-6 pl-12 text-white placeholder:text-white/40 backdrop-blur-sm focus:border-white/30 focus:bg-white/15"
							/>
						</div>
						<Button
							type="submit"
							size="lg"
							className="bg-white px-8 text-black hover:bg-white/90"
						>
							Search
						</Button>
					</form>
				</div>

				{/* Quick Actions */}
				<div className="flex flex-wrap justify-center gap-4">
					<Button
						asChild
						size="lg"
						className="gap-2 bg-white text-black hover:bg-white/90"
					>
						<Link href="/blogs">
							<BookOpen className="h-5 w-5" />
							All Articles
						</Link>
					</Button>
					<Button
						asChild
						variant="outline"
						size="lg"
						className="gap-2 border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
					>
						<Link href="/products">
							Browse Products
						</Link>
					</Button>
					<Button
						asChild
						variant="ghost"
						size="lg"
						className="gap-2 text-white hover:bg-white/10"
					>
						<Link href="/">
							<Home className="h-5 w-5" />
							Go Home
						</Link>
					</Button>
				</div>
			</div>

			{/* Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Blog Post Not Found - Zugzology",
						description: "The requested blog post could not be found.",
						mainEntity: {
							"@type": "ErrorPage",
							description: "HTTP 404 - Blog Post Not Found",
						},
					}),
				}}
			/>
		</div>
	);
}
