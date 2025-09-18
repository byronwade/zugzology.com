"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, BookOpen } from "lucide-react";

interface BlogErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function BlogError({ error, reset }: BlogErrorProps) {
	useEffect(() => {
		// Log error to analytics
		if (typeof window !== 'undefined' && window.gtag) {
			window.gtag('event', 'exception', {
				description: `Blog Error: ${error.message}`,
				fatal: false,
				page_location: window.location.href,
				page_type: 'blog_error'
			});
		}
		
		// Log to console for debugging
		console.error('Blog Error:', error);
	}, [error]);

	return (
		<div className="flex flex-col items-center justify-center min-h-[400px] px-4">
			<div className="text-center max-w-md">
				<div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
					<BookOpen className="w-8 h-8 text-red-600 dark:text-red-400" />
				</div>
				
				<h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
					Something went wrong
				</h2>
				<p className="text-gray-600 dark:text-gray-400 mb-6">
					We encountered an error while loading the blog content. This might be a temporary issue.
				</p>
				
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<Button onClick={reset} variant="default" className="flex items-center gap-2">
						<RefreshCw className="w-4 h-4" />
						Try Again
					</Button>
					<Button asChild variant="outline" className="flex items-center gap-2">
						<Link href="/blogs">
							<BookOpen className="w-4 h-4" />
							Browse All Blogs
						</Link>
					</Button>
					<Button asChild variant="outline" className="flex items-center gap-2">
						<Link href="/">
							<Home className="w-4 h-4" />
							Go Home
						</Link>
					</Button>
				</div>
				
				{process.env.NODE_ENV === 'development' && error.digest && (
					<details className="mt-6 text-left">
						<summary className="text-sm text-gray-500 cursor-pointer">Error Details</summary>
						<pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto">
							{error.digest}
						</pre>
					</details>
				)}
			</div>
		</div>
	);
}

// Global type extension for Google Analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
