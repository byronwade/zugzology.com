"use client";

import Link from "next/link";
import { Tag } from "lucide-react";

interface TagCardProps {
	tag: string;
	count: number;
}

export function TagCard({ tag, count }: TagCardProps) {
	return (
		<Link href={`/tags/${tag}` as `/tags/${string}`} className="group block">
			<div className="border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 p-4">
				<div className="flex items-center gap-2">
					<Tag className="w-5 h-5 text-blue-500" />
					<h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">{tag}</h2>
				</div>
				<p className="mt-2 text-sm text-gray-600">
					{count} {count === 1 ? "product" : "products"}
				</p>
			</div>
		</Link>
	);
}
