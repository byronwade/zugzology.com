"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export type BreadcrumbConfig = {
	name: string;
	url: string;
};

type UniversalBreadcrumbProps = {
	items: BreadcrumbConfig[];
	className?: string;
	showHome?: boolean;
};

export function UniversalBreadcrumb({ items }: UniversalBreadcrumbProps) {
	if (!items || items.length === 0) {
		return null;
	}

	return (
		<div className="hidden w-full border-b border-border bg-muted/30 md:block">
			<div className="container mx-auto px-4 py-2">
				<nav aria-label="Breadcrumb" className="flex items-center text-sm">
					{items.map((item, index) => {
						const isLast = index === items.length - 1;
						const baseKey = item.url || `breadcrumb-${index}`;

						return (
							<React.Fragment key={baseKey}>
								{index > 0 && (
									<ChevronRight className="mx-2 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/50" />
								)}
								{isLast ? (
									<span className="font-medium text-foreground">{item.name}</span>
								) : (
									<Link className="text-muted-foreground transition-colors hover:text-foreground" href={item.url}>
										{item.name}
									</Link>
								)}
							</React.Fragment>
						);
					})}
				</nav>
			</div>
		</div>
	);
}
