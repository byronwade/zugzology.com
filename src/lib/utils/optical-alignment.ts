/**
 * Optical Alignment Utilities
 *
 * Provides utilities for applying optical alignment adjustments to icons and text.
 * Optical alignment accounts for human perception to make elements appear visually
 * aligned, even when they're not mathematically centered.
 *
 * Key principles:
 * - Triangular shapes (arrows, carets) appear left-heavy → shift right
 * - Circular shapes appear high → shift down slightly
 * - Bottom-heavy shapes (heart) → shift up slightly
 * - Uppercase text appears larger → reduce size or increase spacing
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Icon shape categories for optical alignment
 */
export type IconShape =
	| "triangular" // Arrows, carets, play buttons - need right shift
	| "circular" // Circles, clocks, info - need down shift
	| "bottomHeavy" // Hearts, anchors - need up shift
	| "leftHeavy" // Trucks, some asymmetric icons - need right shift
	| "square" // Square icons - usually optically centered
	| "star"; // Stars - special case, need slight adjustments

/**
 * Map of common icon names to their shapes
 * This helps automatically determine optical alignment
 */
export const ICON_SHAPE_MAP: Record<string, IconShape> = {
	// Triangular icons (need right shift)
	ArrowRight: "triangular",
	ArrowLeft: "triangular",
	ArrowUp: "triangular",
	ArrowDown: "triangular",
	ChevronRight: "triangular",
	ChevronLeft: "triangular",
	ChevronUp: "triangular",
	ChevronDown: "triangular",
	Play: "triangular",
	Forward: "triangular",
	CaretRight: "triangular",
	CaretLeft: "triangular",

	// Circular icons (need down shift)
	Circle: "circular",
	CheckCircle: "circular",
	XCircle: "circular",
	Info: "circular",
	InfoCircle: "circular",
	Clock: "circular",
	Clock3: "circular",
	Users: "circular",
	User: "circular",
	Globe: "circular",

	// Bottom-heavy icons (need up shift)
	Heart: "bottomHeavy",
	HeartFilled: "bottomHeavy",
	Anchor: "bottomHeavy",

	// Left-heavy icons (need right adjustment)
	Truck: "leftHeavy",
	TruckDelivery: "leftHeavy",
	ShoppingCart: "leftHeavy",
	ShoppingBag: "leftHeavy",

	// Star icons (special case)
	Star: "star",
	StarFilled: "star",
	StarHalf: "star",

	// Square/symmetric icons (usually fine as-is)
	Package: "square",
	Box: "square",
	Square: "square",
	Shield: "square",
	ShieldCheck: "square",
	Award: "square",
	BookOpen: "square",
	Headphones: "square",
	RefreshCw: "square",
	Sprout: "square",
};

/**
 * Get optical alignment classes for an icon based on its shape
 */
export function getOpticalIconClasses(
	iconName: string,
	context: "button" | "inline" | "standalone" = "button"
): string {
	const shape = ICON_SHAPE_MAP[iconName] || "square";

	const alignmentClasses: Record<IconShape, Record<string, string>> = {
		triangular: {
			button: "translate-x-optical-icon-right",
			inline: "translate-x-[0.0625rem]", // 1px for inline text
			standalone: "translate-x-optical-icon-right",
		},
		circular: {
			button: "translate-y-optical-icon-down",
			inline: "translate-y-optical-icon-down",
			standalone: "",
		},
		bottomHeavy: {
			button: "translate-y-optical-icon-up",
			inline: "translate-y-optical-icon-up",
			standalone: "translate-y-optical-icon-up",
		},
		leftHeavy: {
			button: "translate-x-optical-icon-right",
			inline: "translate-x-[0.0625rem]",
			standalone: "translate-x-optical-icon-right",
		},
		star: {
			button: "translate-y-[0.03125rem]", // 0.5px down
			inline: "translate-y-[0.03125rem]",
			standalone: "",
		},
		square: {
			button: "",
			inline: "",
			standalone: "",
		},
	};

	return alignmentClasses[shape][context] || "";
}

/**
 * Get optical spacing classes for text elements
 */
export function getOpticalTextClasses(
	textType: "uppercase" | "lowercase" | "mixed",
	size: "sm" | "md" | "lg" = "md"
): string {
	if (textType === "uppercase") {
		const sizeMap = {
			sm: "tracking-wider text-[0.95em]", // Slightly smaller, more spacing
			md: "tracking-wide text-[0.96em]",
			lg: "tracking-wide text-[0.97em]",
		};
		return sizeMap[size];
	}
	return "";
}

/**
 * Optical alignment for badge text
 */
export function getOpticalBadgeClasses(hasIcon = false): string {
	return clsx("inline-flex items-center justify-center", hasIcon && "gap-1");
}

/**
 * Optical spacing between icon and text
 */
export function getOpticalIconTextGap(iconPosition: "left" | "right", iconShape?: IconShape): string {
	const baseGap = "gap-2";

	// Adjust gap based on icon shape for better visual balance
	if (iconShape === "triangular") {
		return iconPosition === "left" ? "gap-[0.4375rem]" : "gap-[0.5625rem]"; // Slightly less on the pointed side
	}

	return baseGap;
}

/**
 * Helper to get optical padding for containers with different content types
 */
export function getOpticalContainerPadding(contentType: "text" | "icon" | "mixed"): string {
	const paddingMap = {
		text: "px-4 py-2",
		icon: "p-2",
		mixed: "px-3 py-2",
	};
	return paddingMap[contentType];
}

/**
 * Utility to merge Tailwind classes with optical alignment classes
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Get optical alignment for price displays
 * Currency symbols and decimals need special treatment
 */
export function getOpticalPriceClasses() {
	return {
		currency: "text-[0.875em] align-[0.125em]", // Smaller and raised
		decimal: "text-[0.8em] align-[0.0625em]", // Smaller decimals
		integer: "", // Base size
	};
}

/**
 * Get optical alignment for form elements
 */
export function getOpticalFormIconClasses(position: "left" | "right"): string {
	return clsx(
		"-translate-y-1/2 absolute top-1/2",
		position === "left" ? "left-3" : "right-3",
		// Add slight visual centering adjustment
		"translate-y-[calc(-50%-0.0625rem)]" // 1px up for optical centering
	);
}

/**
 * Optical alignment for loading spinners
 */
export function getOpticalSpinnerClasses(context: "button" | "page" = "button"): string {
	return clsx(
		"animate-spin",
		context === "button" && "translate-y-[0.0625rem]" // Slight down adjustment in buttons
	);
}

/**
 * Get optical adjustments for navigation items
 */
export function getOpticalNavClasses(hasIcon = false): string {
	return clsx(
		"flex items-center",
		hasIcon && "gap-2",
		// Slight padding adjustment for optical balance
		"px-3 py-2"
	);
}

/**
 * Detect icon shape from component name
 */
export function detectIconShape(iconName: string): IconShape {
	// Check exact match first
	if (ICON_SHAPE_MAP[iconName]) {
		return ICON_SHAPE_MAP[iconName];
	}

	// Check for partial matches (e.g., "ArrowRightIcon" contains "ArrowRight")
	for (const [name, shape] of Object.entries(ICON_SHAPE_MAP)) {
		if (iconName.includes(name)) {
			return shape;
		}
	}

	// Default to square (no adjustment needed)
	return "square";
}

/**
 * Comprehensive optical alignment utility
 * Use this for icon + text combinations in components
 */
export function getOpticalAlignment(config: {
	iconName?: string;
	iconPosition?: "left" | "right" | "top" | "bottom";
	context?: "button" | "inline" | "standalone" | "nav" | "card";
	textType?: "uppercase" | "lowercase" | "mixed";
	size?: "sm" | "md" | "lg";
}) {
	const { iconName, iconPosition = "left", context = "button", textType = "mixed", size = "md" } = config;

	const classes: string[] = [];

	// Add icon optical classes
	if (iconName) {
		const iconContext = context === "nav" || context === "card" ? "inline" : context;
		const iconShape = detectIconShape(iconName);
		const iconClasses = getOpticalIconClasses(iconName, iconContext);

		if (iconClasses) {
			classes.push(iconClasses);
		}

		// Add gap adjustment between icon and text
		if (iconPosition === "left" || iconPosition === "right") {
			classes.push(getOpticalIconTextGap(iconPosition, iconShape));
		}
	}

	// Add text optical classes
	if (textType === "uppercase") {
		classes.push(getOpticalTextClasses(textType, size));
	}

	return cn(...classes);
}
