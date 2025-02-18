"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Tag, Clock, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
	const [showPromo, setShowPromo] = React.useState(true);

	if (!showPromo) return null;

	return (
		<div className="bg-purple-50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900">
			<div className="relative mx-auto px-4 py-2">
				<div className="flex items-center justify-between gap-4">
					<div className="flex flex-wrap items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
						<div className="flex items-center gap-2 min-w-fit">
							<Sparkles className="h-3.5 w-3.5" />
							<span className="font-medium whitespace-nowrap">Limited Time Offer</span>
						</div>
						<Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
							Save 20%
						</Badge>
						<span className="hidden xs:inline text-purple-400 dark:text-purple-600">|</span>
						<span className="hidden xs:flex items-center gap-1 text-purple-500 dark:text-purple-400 whitespace-nowrap">
							<Clock className="h-3.5 w-3.5" />
							Ends in 2 days
						</span>
					</div>
					<div className="flex items-center gap-3 min-w-fit">
						<Button variant="link" size="sm" className="h-auto p-0 text-xs text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 hover:no-underline" asChild>
							<a href="/sale" className="hidden xs:inline-flex items-center">
								View Deals
								<ArrowRight className="h-3 w-3 ml-1" />
							</a>
						</Button>
						<Button variant="outline" size="sm" className="h-7 hidden sm:inline-flex" asChild>
							<a href="/sale">
								<Tag className="h-3.5 w-3.5 mr-1" />
								Shop Now
							</a>
						</Button>
						<button onClick={() => setShowPromo(false)} className="text-purple-400 hover:text-purple-900 dark:hover:text-purple-100">
							<X className="h-3.5 w-3.5" />
							<span className="sr-only">Dismiss</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
