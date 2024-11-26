"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BlogLayoutProps {
	children: React.ReactNode;
	header?: {
		title: string;
		description?: string;
	};
	className?: string;
}

export function BlogLayout({ children, header, className }: BlogLayoutProps) {
	return (
		<div className={cn("min-h-screen w-full bg-background", className)}>
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-7xl mx-auto">
					{header && (
						<div className="mb-8">
							<h1 className="text-4xl font-bold">{header.title}</h1>
							{header.description && <p className="mt-2 text-lg text-muted-foreground">{header.description}</p>}
						</div>
					)}
					{children}
				</div>
			</div>
		</div>
	);
}
