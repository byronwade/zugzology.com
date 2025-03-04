"use client";

import { Award, Box, Clock, HeartHandshake, Leaf, ShieldCheck, Truck, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function StoreFeatures() {
	// Track touch state for iOS-like feedback
	const [touchedItem, setTouchedItem] = useState<number | null>(null);

	// Detect iOS for specific optimizations
	const [isIOS, setIsIOS] = useState(false);

	useEffect(() => {
		// Check if user is on iOS
		const userAgent = window.navigator.userAgent.toLowerCase();
		setIsIOS(/iphone|ipad|ipod/.test(userAgent));
	}, []);

	// Define all features with a priority flag for mobile
	const features = [
		{
			icon: <Award className="h-6 w-6" />,
			title: "Quality Guaranteed",
			description: "All our supplies are lab-tested for optimal growth success.",
			priority: true, // Show on mobile
		},
		{
			icon: <Leaf className="h-6 w-6" />,
			title: "Expert Support",
			description: "Access our knowledge base for successful cultivation.",
			priority: false,
		},
		{
			icon: <Box className="h-6 w-6" />,
			title: "Discreet Shipping",
			description: "All orders shipped in plain, unmarked packaging.",
			priority: true, // Show on mobile
		},
		{
			icon: <Truck className="h-6 w-6" />,
			title: "Fast & Free Shipping",
			description: "Free shipping on orders over $50 with quick delivery.",
			priority: true, // Show on mobile
		},
		{
			icon: <ShieldCheck className="h-6 w-6" />,
			title: "Premium Products",
			description: "Carefully selected products for best cultivation results.",
			priority: false,
		},
		{
			icon: <Clock className="h-6 w-6" />,
			title: "24/7 Support",
			description: "Get help anytime with our knowledge base and forums.",
			priority: false,
		},
		{
			icon: <Users className="h-6 w-6" />,
			title: "Growing Community",
			description: "Join our community to share experiences and tips.",
			priority: false,
		},
		{
			icon: <HeartHandshake className="h-6 w-6" />,
			title: "Satisfaction Guarantee",
			description: "30-day money-back guarantee on all purchases.",
			priority: true, // Show on mobile
		},
	];

	return (
		<section className="w-full py-8 bg-background border-y border-border dark:border-border/20">
			<div className="w-full max-w-[1800px] mx-auto px-4 md:px-6">
				<div className="w-full grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
					{features.map((feature, index) => (
						<div
							key={index}
							className={`
								flex flex-col items-center text-center space-y-3 p-4 
								rounded-2xl transition-all duration-200
								${isIOS ? "active:scale-[0.97] active:bg-muted/80" : "hover:bg-muted/50"}
								${touchedItem === index ? "bg-muted/80" : "bg-background"}
								dark:hover:bg-muted/20 dark:active:bg-muted/30
								${isIOS ? "shadow-[0_0.5px_2px_rgba(0,0,0,0.05)]" : ""}
								dark:shadow-none
								${!feature.priority ? "hidden md:flex" : "flex"}
							`}
							onTouchStart={() => setTouchedItem(index)}
							onTouchEnd={() => setTouchedItem(null)}
							style={{
								WebkitTapHighlightColor: "transparent",
								fontFamily: isIOS
									? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
									: "inherit",
							}}
						>
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 shrink-0">
								<div className="text-primary dark:text-primary/90">{feature.icon}</div>
							</div>
							<div className="space-y-1.5">
								<h3 className="text-base font-semibold text-foreground dark:text-foreground/90">{feature.title}</h3>
								<p className="text-xs text-muted-foreground dark:text-muted-foreground/80 max-w-[180px]">
									{feature.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
