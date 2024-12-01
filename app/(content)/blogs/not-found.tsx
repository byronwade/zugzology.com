import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[400px]">
			<h2 className="text-2xl font-bold mb-4">Blog Not Found</h2>
			<p className="text-neutral-600 dark:text-neutral-400 mb-8">The blog post you're looking for doesn't exist.</p>
			<Link prefetch={true} href="/blogs" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium">
				← Back to Blog
			</Link>
		</div>
	);
}
