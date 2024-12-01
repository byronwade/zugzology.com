"use client";

export default function BlogError() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[400px]">
			<h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
			<p className="text-neutral-600 dark:text-neutral-400">Failed to load blog content. Please try again later.</p>
		</div>
	);
}
