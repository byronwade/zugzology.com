"use client";

import { Suspense } from "react";
import Link from "next/link";

function NotFoundContent() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
			<h1 className="text-4xl font-bold mb-4">404</h1>
			<h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
			<p className="text-neutral-600 dark:text-neutral-400 text-center mb-8">The page you're looking for doesn't exist or has been moved.</p>
			<Link href="/" className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors">
				Return Home
			</Link>
		</div>
	);
}

export default function NotFound() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<NotFoundContent />
		</Suspense>
	);
}
