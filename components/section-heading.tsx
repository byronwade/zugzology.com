"use client";

import { ArrowRight } from "lucide-react";
import { ValidatedLink } from "@/components/ui/validated-link";

interface SectionHeadingProps {
	title: string;
	description?: string;
	linkText?: string;
	linkHref?: string;
}

export function SectionHeading({ title, description, linkText, linkHref }: SectionHeadingProps) {
	return (
		<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
			<div>
				<h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
				{description && <p className="text-gray-600 max-w-2xl">{description}</p>}
			</div>
			{linkText && linkHref && (
				<ValidatedLink
					href={linkHref}
					className="text-primary flex items-center mt-2 sm:mt-0 text-sm md:text-base font-medium hover:underline"
				>
					{linkText} <ArrowRight className="ml-1 h-4 w-4" />
				</ValidatedLink>
			)}
		</div>
	);
}
