"use client";

import {
	Truck,
	ShieldCheck,
	Award,
	Users,
	ArrowUpRight,
	Leaf,
	BadgeCheck,
	Calendar,
	PackageCheck,
	ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustIndicatorProps {
	className?: string;
	variant?: "condensed" | "full" | "mini";
	showAmount?: boolean;
	showReturns?: boolean;
	showSupport?: boolean;
	showQuickDelivery?: boolean;
	showSustainable?: boolean;
	showPopular?: boolean;
	showRichMedia?: boolean;
	layout?: "grid" | "flex";
	showTitle?: boolean;
}

// Streamlined trust indicators for product pages
export function TrustIndicators({
	className,
	variant = "full",
	showAmount = true,
	showReturns = true,
	showSupport = true,
	showQuickDelivery = false,
	showSustainable = false,
	showPopular = false,
	showRichMedia = false,
	layout = "grid",
	showTitle = true,
}: TrustIndicatorProps) {
	const wrapperClass = cn(
		"w-full",
		layout === "grid" ? "grid gap-4" : "flex flex-wrap justify-center gap-4",
		variant === "full" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-2 md:grid-cols-4",
		variant === "mini" && "grid-cols-2 md:grid-cols-4 gap-2",
		className
	);

	const itemClass = cn(
		"flex items-center gap-2",
		variant === "full" ? "p-4 border rounded-md" : "p-2",
		variant === "mini" && "text-xs p-1"
	);

	const iconClass = cn(variant === "full" ? "w-5 h-5" : "w-4 h-4", variant === "mini" && "w-3 h-3");

	const textClass = cn("text-gray-700", variant === "full" ? "text-sm" : "text-xs", variant === "mini" && "text-xs");

	return (
		<div className={wrapperClass}>
			{showTitle && variant === "full" && (
				<div className="col-span-full mb-2">
					<h3 className="font-medium text-lg text-center">Shop with Confidence</h3>
				</div>
			)}

			{/* Free Shipping */}
			<div className={itemClass}>
				<Truck className={cn(iconClass, "text-green-600")} aria-hidden="true" />
				<div>
					<p className={cn(textClass, "font-medium")}>Free Shipping</p>
					{variant === "full" && showAmount && <p className="text-xs text-gray-500">On orders over $75</p>}
				</div>
			</div>

			{/* Secure Checkout */}
			<div className={itemClass}>
				<ShieldCheck className={cn(iconClass, "text-blue-600")} aria-hidden="true" />
				<div>
					<p className={cn(textClass, "font-medium")}>Secure Checkout</p>
					{variant === "full" && <p className="text-xs text-gray-500">SSL encrypted payment</p>}
				</div>
			</div>

			{/* Satisfaction Guarantee */}
			{showReturns && (
				<div className={itemClass}>
					<Award className={cn(iconClass, "text-purple-600")} aria-hidden="true" />
					<div>
						<p className={cn(textClass, "font-medium")}>Satisfaction Guarantee</p>
						{variant === "full" && <p className="text-xs text-gray-500">30-day returns policy</p>}
					</div>
				</div>
			)}

			{/* Expert Support */}
			{showSupport && (
				<div className={itemClass}>
					<Users className={cn(iconClass, "text-orange-600")} aria-hidden="true" />
					<div>
						<p className={cn(textClass, "font-medium")}>Expert Support</p>
						{variant === "full" && <p className="text-xs text-gray-500">Mon-Fri, 9am-5pm EST</p>}
					</div>
				</div>
			)}

			{/* Fast Delivery */}
			{showQuickDelivery && (
				<div className={itemClass}>
					<PackageCheck className={cn(iconClass, "text-amber-600")} aria-hidden="true" />
					<div>
						<p className={cn(textClass, "font-medium")}>Quick Delivery</p>
						{variant === "full" && <p className="text-xs text-gray-500">Ships within 24 hours</p>}
					</div>
				</div>
			)}

			{/* Sustainable */}
			{showSustainable && (
				<div className={itemClass}>
					<Leaf className={cn(iconClass, "text-green-600")} aria-hidden="true" />
					<div>
						<p className={cn(textClass, "font-medium")}>Eco-Friendly</p>
						{variant === "full" && <p className="text-xs text-gray-500">Sustainable materials</p>}
					</div>
				</div>
			)}

			{/* Popular Choice */}
			{showPopular && (
				<div className={itemClass}>
					<ThumbsUp className={cn(iconClass, "text-red-500")} aria-hidden="true" />
					<div>
						<p className={cn(textClass, "font-medium")}>Popular Choice</p>
						{variant === "full" && <p className="text-xs text-gray-500">Customer favorite</p>}
					</div>
				</div>
			)}

			{/* Fresh Stock */}
			{showRichMedia && (
				<div className={itemClass}>
					<Calendar className={cn(iconClass, "text-teal-600")} aria-hidden="true" />
					<div>
						<p className={cn(textClass, "font-medium")}>Fresh Stock</p>
						{variant === "full" && <p className="text-xs text-gray-500">Recently restocked</p>}
					</div>
				</div>
			)}
		</div>
	);
}

// Independent components for specific trust indicators
export function FreeShippingIndicator({ amount = 75, className }: { amount?: number; className?: string }) {
	return (
		<div className={cn("flex items-center gap-1.5 text-sm text-green-700", className)}>
			<Truck className="w-4 h-4" />
			<span>Free shipping on orders over ${amount}</span>
		</div>
	);
}

export function GuaranteeIndicator({ days = 30, className }: { days?: number; className?: string }) {
	return (
		<div className={cn("flex items-center gap-1.5 text-sm text-purple-700", className)}>
			<BadgeCheck className="w-4 h-4" />
			<span>{days}-day satisfaction guarantee</span>
		</div>
	);
}

export function SecureCheckoutIndicator({ className }: { className?: string }) {
	return (
		<div className={cn("flex items-center gap-1.5 text-sm text-blue-700", className)}>
			<ShieldCheck className="w-4 h-4" />
			<span>Secure encrypted checkout</span>
		</div>
	);
}

// Trust badges for checkout page
export function TrustBadges({ className }: { className?: string }) {
	return (
		<div className={cn("flex flex-col gap-4 py-4", className)}>
			<h3 className="text-sm font-medium text-gray-700">Trusted By Mushroom Growers Everywhere</h3>
			<div className="flex flex-wrap gap-4 justify-center">
				{/* Placeholder for payment badges - in production use actual SVG logos */}
				<div className="h-6 w-12 bg-gray-200 rounded flex items-center justify-center text-[8px] text-gray-600">
					VISA
				</div>
				<div className="h-6 w-12 bg-gray-200 rounded flex items-center justify-center text-[8px] text-gray-600">MC</div>
				<div className="h-6 w-12 bg-gray-200 rounded flex items-center justify-center text-[8px] text-gray-600">
					AMEX
				</div>
				<div className="h-6 w-12 bg-gray-200 rounded flex items-center justify-center text-[8px] text-gray-600">
					PayPal
				</div>
				<div className="h-6 w-12 bg-gray-200 rounded flex items-center justify-center text-[8px] text-gray-600">
					ShopPay
				</div>
				<div className="h-6 w-12 bg-gray-200 rounded flex items-center justify-center text-[8px] text-gray-600">
					Apple
				</div>
			</div>
			<div className="flex flex-wrap gap-2 justify-center">
				<div className="flex items-center gap-1 text-xs text-gray-600">
					<ShieldCheck className="w-3 h-3" />
					<span>SSL Secure</span>
				</div>
				<div className="flex items-center gap-1 text-xs text-gray-600">
					<BadgeCheck className="w-3 h-3" />
					<span>Satisfaction Guarantee</span>
				</div>
				<div className="flex items-center gap-1 text-xs text-gray-600">
					<Truck className="w-3 h-3" />
					<span>Fast Shipping</span>
				</div>
			</div>
		</div>
	);
}

// Testimonial component for trust building
export function CustomerTestimonial({
	quote,
	author,
	rating = 5,
	className,
}: {
	quote: string;
	author: string;
	rating?: number;
	className?: string;
}) {
	return (
		<div className={cn("p-4 border rounded-lg bg-gray-50", className)}>
			<div className="flex gap-0.5 mb-2">
				{Array.from({ length: 5 }).map((_, i) => (
					<svg
						key={i}
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill={i < rating ? "currentColor" : "none"}
						stroke={i < rating ? "none" : "currentColor"}
						className={cn("w-4 h-4", i < rating ? "text-yellow-400" : "text-gray-300")}
					>
						<path
							fillRule="evenodd"
							d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
							clipRule="evenodd"
						/>
					</svg>
				))}
			</div>
			<p className="text-sm text-gray-700 italic mb-2">&ldquo;{quote}&rdquo;</p>
			<p className="text-xs text-gray-500 font-medium">{author}</p>
		</div>
	);
}
