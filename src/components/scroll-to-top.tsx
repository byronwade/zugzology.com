"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			setIsVisible(window.scrollY > 300);
		};

		window.addEventListener("scroll", toggleVisibility);
		return () => window.removeEventListener("scroll", toggleVisibility);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	return (
		<Button
			aria-label="Scroll to top"
			className={cn(
				"fixed right-8 bottom-8 z-50 rounded-full shadow-lg transition-opacity",
				isVisible ? "opacity-100" : "pointer-events-none opacity-0"
			)}
			onClick={scrollToTop}
			size="icon"
			variant="outline"
		>
			<ArrowUp className="h-4 w-4" />
		</Button>
	);
}
