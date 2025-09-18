"use client";

import { Link } from '@/components/ui/link';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import Script from "next/script";

export default function BlogNotFound() {
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		// Track blog 404 in analytics
		if (typeof window !== 'undefined' && window.gtag) {
			const blogSlug = window.location.pathname.split('/').pop();
			window.gtag('event', 'page_view', {
				page_type: 'blog_404',
				page_location: window.location.href,
				blog_slug: blogSlug,
				error_type: 'blog_not_found'
			});
		}
	}, []);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
		}
	};

	// Generate structured data for blog 404
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		"name": "Blog Post Not Found - Zugzology",
		"description": "The requested blog post could not be found. Browse our available articles about mushroom cultivation and growing techniques.",
		"url": typeof window !== 'undefined' ? window.location.href : '',
		"mainEntity": {
			"@type": "ErrorPage",
			"description": "HTTP 404 - Blog Post Not Found"
		},
		"breadcrumb": {
			"@type": "BreadcrumbList",
			"itemListElement": [
				{
					"@type": "ListItem",
					"position": 1,
					"name": "Home",
					"item": typeof window !== 'undefined' ? window.location.origin : ''
				},
				{
					"@type": "ListItem",
					"position": 2,
					"name": "Blog",
					"item": typeof window !== 'undefined' ? `${window.location.origin}/blogs` : ''
				},
				{
					"@type": "ListItem",
					"position": 3,
					"name": "Blog Post Not Found",
					"item": typeof window !== 'undefined' ? window.location.href : ''
				}
			]
		}
	};

	const popularTopics = [
		{ href: "/blogs/mushroom-guides", label: "Mushroom Growing Guides" },
		{ href: "/blogs/cultivation-tips", label: "Cultivation Tips" },
		{ href: "/blogs/substrate-guides", label: "Substrate Preparation" },
		{ href: "/blogs/troubleshooting", label: "Troubleshooting" },
	];

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(structuredData),
				}}
			/>
			
			{/* Google Analytics for Blog 404 */}
			<Script id="blog-notfound-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'blog_not_found',
						'page_location': window.location.href,
						'error_type': 'blog_404'
					});
				`}
			</Script>
			
			<div className="container mx-auto px-4 py-16">
				{/* Breadcrumb Navigation */}
				<nav className="mb-8" aria-label="Breadcrumb">
					<ol className="flex items-center space-x-2 text-sm text-gray-600">
						<li>
							<Link href="/" className="hover:text-gray-900">Home</Link>
						</li>
						<li className="text-gray-400">/</li>
						<li>
							<Link href="/blogs" className="hover:text-gray-900">Blog</Link>
						</li>
						<li className="text-gray-400">/</li>
						<li className="text-gray-900 font-medium">Blog Post Not Found</li>
					</ol>
				</nav>

				<div className="flex flex-col items-center justify-center min-h-[400px] text-center">
					<div className="mb-8">
						<BookOpen className="h-16 w-16 text-purple-600 mx-auto mb-4" />
						<h1 className="text-4xl font-bold mb-4">Blog Post Not Found</h1>
						<h2 className="text-xl text-neutral-600 dark:text-neutral-400 mb-8">
							The blog post you&apos;re looking for doesn&apos;t exist or has been moved.
						</h2>
					</div>

					{/* Search Section */}
					<div className="max-w-xl mx-auto mb-8 w-full">
						<form onSubmit={handleSearch} className="flex gap-2">
							<Input 
								type="search" 
								placeholder="Search blog posts..." 
								value={searchQuery} 
								onChange={(e) => setSearchQuery(e.target.value)} 
								className="flex-1" 
							/>
							<Button type="submit">
								<Search className="h-4 w-4 mr-2" />
								Search
							</Button>
						</form>
					</div>

					{/* Popular Topics */}
					<div className="mb-8">
						<h3 className="text-lg font-semibold mb-4">Popular Topics</h3>
						<div className="flex flex-wrap justify-center gap-2">
							{popularTopics.map((topic) => (
								<Button key={topic.href} asChild variant="outline" size="sm">
									<Link href={topic.href}>
										{topic.label}
									</Link>
								</Button>
							))}
						</div>
					</div>

					{/* Quick Actions */}
					<div className="flex flex-wrap justify-center gap-4">
						<Button asChild variant="default">
							<Link href="/blogs">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to Blog
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/products">
								Browse Products
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/help">
								Contact Support
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
