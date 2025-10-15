"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { ShopifyProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProductFAQsProps = {
	product?: ShopifyProduct;
	productType?: string;
	additionalQuestions?: Array<{ question: string; answer: string }>;
};

// Function to get FAQs based on product type
const getProductTypeFAQs = (productType?: string) => {
	const lowercaseType = productType?.toLowerCase() || "";

	// Generic growing FAQs for all products
	const genericFAQs = [
		{
			question: "How do I store my mushroom cultivation supplies?",
			answer:
				"Most cultivation supplies should be stored in a cool, dry place away from direct sunlight. Substrates and spawn should remain sealed until use. Spores and cultures should be refrigerated unless specified otherwise.",
		},
		{
			question: "How long will my supplies last?",
			answer:
				"Unopened substrates typically last 3-6 months. Spawn and cultures have variable shelf lives depending on storage conditions, but generally 1-3 months refrigerated. Tools and equipment can last years with proper care and cleaning.",
		},
		{
			question: "Do you offer bulk discounts?",
			answer:
				"Yes! We offer volume discounts on many of our products. Orders over $75 qualify for free shipping, and orders over $150 receive a 5% discount automatically applied at checkout.",
		},
		{
			question: "What if I'm a complete beginner?",
			answer:
				"We recommend starting with one of our complete growing kits, which include everything you need to get started. We also offer free guides and videos on our blog, and our customer service team is always happy to help.",
		},
	];

	// Product-specific FAQs based on product type
	if (lowercaseType.includes("substrate") || lowercaseType.includes("growing medium")) {
		return [
			{
				question: "Is this substrate ready to use or does it need preparation?",
				answer:
					"Our substrates come fully pasteurized and ready to use. Simply open in a clean environment and proceed with inoculation according to the included instructions.",
			},
			{
				question: "What types of mushrooms work best with this substrate?",
				answer:
					"This substrate is optimized for a wide variety of gourmet and medicinal mushrooms including oyster, shiitake, lion's mane, and reishi varieties. See product description for specific compatibility details.",
			},
			{
				question: "How much substrate do I need?",
				answer:
					"For best results, use a spawn-to-substrate ratio of 1:2 to 1:5 depending on the mushroom variety. Our 5lb bags are sufficient for most home growing projects.",
			},
			...genericFAQs,
		];
	}

	if (lowercaseType.includes("spawn") || lowercaseType.includes("culture")) {
		return [
			{
				question: "How should I store the spawn/culture upon arrival?",
				answer:
					"Store spawn in a refrigerator (35-42°F/2-6°C) until ready to use. Cultures should be kept refrigerated but not frozen. Use within 3-4 weeks of receipt for best results.",
			},
			{
				question: "Can I create my own spawn from this product?",
				answer:
					"Yes, our spawn can be expanded to create more spawn using proper sterile techniques. We recommend doing grain-to-grain transfers in a still air box or flow hood.",
			},
			{
				question: "What's the expected colonization time?",
				answer:
					"Colonization typically takes 2-4 weeks depending on temperature, moisture, and mushroom variety. Optimal colonization temperature is typically 70-75°F (21-24°C).",
			},
			...genericFAQs,
		];
	}

	if (lowercaseType.includes("kit") || lowercaseType.includes("starter")) {
		return [
			{
				question: "How difficult is this kit for beginners?",
				answer:
					"Our kits are designed with beginners in mind and require minimal setup. Simply follow the included step-by-step instructions, maintain proper humidity, and harvest fresh mushrooms in as little as 10-14 days.",
			},
			{
				question: "How many harvests can I expect from this kit?",
				answer:
					"Most of our kits will produce 2-3 flushes (harvests) over a period of 6-8 weeks. With proper care, some customers report getting up to 4-5 flushes.",
			},
			{
				question: "What temperature and humidity are required?",
				answer:
					"Most mushroom varieties prefer temperatures between 65-75°F (18-24°C) and humidity levels of 80-95%. Your kit includes specific instructions for optimal conditions for your particular mushroom variety.",
			},
			{
				question: "How much yield can I expect?",
				answer:
					"Yields vary by mushroom variety and growing conditions, but most of our kits produce between 1-3 pounds of fresh mushrooms over multiple flushes. Each flush typically yields slightly less than the previous one.",
			},
			...genericFAQs,
		];
	}

	if (lowercaseType.includes("tool") || lowercaseType.includes("equipment")) {
		return [
			{
				question: "How should I clean and maintain this equipment?",
				answer:
					"Clean all equipment before and after use with 70% isopropyl alcohol. For more thorough sterilization, use a pressure cooker or autoclave for heat-resistant items. Store in a clean, dry place when not in use.",
			},
			{
				question: "Is this suitable for commercial use?",
				answer:
					"Our professional-grade tools are suitable for both home hobbyists and small commercial operations. For large-scale commercial needs, please contact us about our bulk equipment options.",
			},
			{
				question: "How long will this equipment last?",
				answer:
					"With proper care and maintenance, our tools and equipment are built to last for many years. All equipment comes with a minimum 1-year warranty against manufacturing defects.",
			},
			...genericFAQs,
		];
	}

	// Default to generic FAQs if no specific type is matched
	return genericFAQs;
};

// Dynamic FAQ component with expandable sections
export function ProductFAQs({ product, productType, additionalQuestions = [] }: ProductFAQsProps) {
	// Use product type from props or extract from product
	const type = productType || product?.productType || "";

	// Get default FAQs based on product type
	const defaultFAQs = getProductTypeFAQs(type);

	// Combine with any additional questions
	const allQuestions = [...additionalQuestions, ...defaultFAQs];

	// State to track which questions are expanded
	const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

	// Toggle question expansion
	const toggleQuestion = (index: number) => {
		setExpandedIndex(expandedIndex === index ? null : index);
	};

	if (!allQuestions.length) {
		return null;
	}

	return (
		<section className="my-16" id="faqs" itemScope itemType="https://schema.org/FAQPage">
			{/* Header Section */}
			<div className="mb-8 text-center">
				<h2 className="mb-3 font-bold text-3xl tracking-tight">Frequently Asked Questions</h2>
				<p className="mx-auto max-w-2xl text-muted-foreground">
					Find answers to common questions about our products and services
				</p>
			</div>

			{/* FAQ Items */}
			<div className="mx-auto max-w-3xl space-y-3">
				{allQuestions.map((faq, index) => (
					<div
						className={cn(
							"group rounded-lg border border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-sm",
							expandedIndex === index && "border-primary shadow-sm"
						)}
						itemProp="mainEntity"
						itemScope
						itemType="https://schema.org/Question"
						key={index}
					>
						<button
							aria-controls={`faq-answer-${index}`}
							aria-expanded={expandedIndex === index}
							className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors"
							onClick={() => toggleQuestion(index)}
						>
							<h3 className={cn("font-semibold text-base leading-tight transition-colors", expandedIndex === index ? "text-primary" : "text-foreground group-hover:text-primary")} itemProp="name">
								{faq.question}
							</h3>
							<span className={cn("flex-shrink-0 rounded-full p-1 transition-all", expandedIndex === index ? "bg-primary/10 rotate-180" : "bg-transparent")}>
								<ChevronDown className={cn("h-5 w-5 transition-colors", expandedIndex === index ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
							</span>
						</button>

						<div
							className={cn("grid overflow-hidden transition-all duration-300 ease-in-out", expandedIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
							id={`faq-answer-${index}`}
							itemProp="acceptedAnswer"
							itemScope
							itemType="https://schema.org/Answer"
						>
							<div className="overflow-hidden">
								<div className="border-t border-border bg-muted/30 px-5 pb-5 pt-4">
									<p className="text-sm leading-relaxed text-muted-foreground" itemProp="text">
										{faq.answer}
									</p>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Call to Action Card */}
			<div className="mx-auto mt-10 max-w-3xl rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
				<h3 className="mb-2 font-semibold text-foreground text-lg">Still have questions?</h3>
				<p className="mb-4 text-muted-foreground text-sm">
					Our expert team is here to help you with any questions or concerns
				</p>
				<a
					className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground text-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
					href="/help"
				>
					Contact Our Expert Team
					<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</a>
			</div>
		</section>
	);
}

// Helper function to extract FAQ data for SEO
export function getProductFAQsForSchema(product?: ShopifyProduct): Array<{ question: string; answer: string }> {
	const productType = product?.productType || "";
	return getProductTypeFAQs(productType);
}
