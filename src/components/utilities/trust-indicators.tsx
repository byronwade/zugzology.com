"use client";

import { Award, BadgeCheck, Calendar, Leaf, PackageCheck, ShieldCheck, ThumbsUp, Truck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type TrustIndicatorProps = {
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
};

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
		variant === "mini" && "grid-cols-2 gap-2 md:grid-cols-4",
		className
	);

	const itemClass = cn(
		"flex items-center gap-2",
		variant === "full" ? "rounded-md border p-4" : "p-2",
		variant === "mini" && "p-1 text-xs"
	);

	const iconClass = cn(variant === "full" ? "h-5 w-5" : "h-4 w-4", variant === "mini" && "h-3 w-3");

	const textClass = cn(
		"text-muted-foreground",
		variant === "full" ? "text-sm" : "text-xs",
		variant === "mini" && "text-xs"
	);

	return (
		<div className={wrapperClass}>
			{showTitle && variant === "full" && (
				<div className="col-span-full mb-2">
					<h3 className="text-center font-medium text-lg">Shop with Confidence</h3>
				</div>
			)}

			{/* Free Shipping */}
			<div className={itemClass}>
				<Truck aria-hidden="true" className={cn(iconClass, "text-green-600")} />
				<div>
					<p className={cn(textClass, "font-medium")}>Free Shipping</p>
					{variant === "full" && showAmount && <p className="text-muted-foreground text-xs">On orders over $75</p>}
				</div>
			</div>

			{/* Secure Checkout */}
			<div className={itemClass}>
				<ShieldCheck aria-hidden="true" className={cn(iconClass, "text-blue-600")} />
				<div>
					<p className={cn(textClass, "font-medium")}>Secure Checkout</p>
					{variant === "full" && <p className="text-muted-foreground text-xs">SSL encrypted payment</p>}
				</div>
			</div>

			{/* Satisfaction Guarantee */}
			{showReturns && (
				<div className={itemClass}>
					<Award aria-hidden="true" className={cn(iconClass, "text-primary")} />
					<div>
						<p className={cn(textClass, "font-medium")}>Satisfaction Guarantee</p>
						{variant === "full" && <p className="text-muted-foreground text-xs">30-day returns policy</p>}
					</div>
				</div>
			)}

			{/* Expert Support */}
			{showSupport && (
				<div className={itemClass}>
					<Users aria-hidden="true" className={cn(iconClass, "text-orange-600")} />
					<div>
						<p className={cn(textClass, "font-medium")}>Expert Support</p>
						{variant === "full" && <p className="text-muted-foreground text-xs">Mon-Fri, 9am-5pm EST</p>}
					</div>
				</div>
			)}

			{/* Fast Delivery */}
			{showQuickDelivery && (
				<div className={itemClass}>
					<PackageCheck aria-hidden="true" className={cn(iconClass, "text-amber-600")} />
					<div>
						<p className={cn(textClass, "font-medium")}>Quick Delivery</p>
						{variant === "full" && <p className="text-muted-foreground text-xs">Ships within 24 hours</p>}
					</div>
				</div>
			)}

			{/* Sustainable */}
			{showSustainable && (
				<div className={itemClass}>
					<Leaf aria-hidden="true" className={cn(iconClass, "text-green-600")} />
					<div>
						<p className={cn(textClass, "font-medium")}>Eco-Friendly</p>
						{variant === "full" && <p className="text-muted-foreground text-xs">Sustainable materials</p>}
					</div>
				</div>
			)}

			{/* Popular Choice */}
			{showPopular && (
				<div className={itemClass}>
					<ThumbsUp aria-hidden="true" className={cn(iconClass, "text-red-500")} />
					<div>
						<p className={cn(textClass, "font-medium")}>Popular Choice</p>
						{variant === "full" && <p className="text-muted-foreground text-xs">Customer favorite</p>}
					</div>
				</div>
			)}

			{/* Fresh Stock */}
			{showRichMedia && (
				<div className={itemClass}>
					<Calendar aria-hidden="true" className={cn(iconClass, "text-primary")} />
					<div>
						<p className={cn(textClass, "font-medium")}>Fresh Stock</p>
						{variant === "full" && <p className="text-muted-foreground text-xs">Recently restocked</p>}
					</div>
				</div>
			)}
		</div>
	);
}

// Independent components for specific trust indicators
export function FreeShippingIndicator({ amount = 75, className }: { amount?: number; className?: string }) {
	return (
		<div className={cn("flex items-center gap-1.5 text-green-700 text-sm", className)}>
			<Truck className="h-4 w-4" />
			<span>Free shipping on orders over ${amount}</span>
		</div>
	);
}

export function GuaranteeIndicator({ days = 30, className }: { days?: number; className?: string }) {
	return (
		<div className={cn("flex items-center gap-1.5 text-primary text-sm", className)}>
			<BadgeCheck className="h-4 w-4" />
			<span>{days}-day satisfaction guarantee</span>
		</div>
	);
}

export function SecureCheckoutIndicator({ className }: { className?: string }) {
	return (
		<div className={cn("flex items-center gap-1.5 text-blue-700 text-sm", className)}>
			<ShieldCheck className="h-4 w-4" />
			<span>Secure encrypted checkout</span>
		</div>
	);
}

// Trust badges for checkout page
export function TrustBadges({ className }: { className?: string }) {
	return (
		<div className={cn("flex flex-col gap-4 py-4", className)}>
			<h3 className="font-medium text-muted-foreground text-sm">Trusted By Mushroom Growers Everywhere</h3>
			<div className="flex flex-wrap justify-center gap-4">
				{/* Placeholder for payment badges - in production use actual SVG logos */}
				<div className="flex h-6 w-12 items-center justify-center rounded bg-muted text-[8px] text-muted-foreground">
					VISA
				</div>
				<div className="flex h-6 w-12 items-center justify-center rounded bg-muted text-[8px] text-muted-foreground">
					MC
				</div>
				<div className="flex h-6 w-12 items-center justify-center rounded bg-muted text-[8px] text-muted-foreground">
					AMEX
				</div>
				<div className="flex h-6 w-12 items-center justify-center rounded bg-muted text-[8px] text-muted-foreground">
					PayPal
				</div>
				<div className="flex h-6 w-12 items-center justify-center rounded bg-muted text-[8px] text-muted-foreground">
					ShopPay
				</div>
				<div className="flex h-6 w-12 items-center justify-center rounded bg-muted text-[8px] text-muted-foreground">
					Apple
				</div>
			</div>
			<div className="flex flex-wrap justify-center gap-2">
				<div className="flex items-center gap-1 text-muted-foreground text-xs">
					<ShieldCheck className="h-3 w-3" />
					<span>SSL Secure</span>
				</div>
				<div className="flex items-center gap-1 text-muted-foreground text-xs">
					<BadgeCheck className="h-3 w-3" />
					<span>Satisfaction Guarantee</span>
				</div>
				<div className="flex items-center gap-1 text-muted-foreground text-xs">
					<Truck className="h-3 w-3" />
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
		<div className={cn("rounded-lg border bg-muted/50 p-4", className)}>
			<div className="mb-2 flex gap-0.5">
				{Array.from({ length: 5 }).map((_, i) => (
					<svg
						className={cn("h-4 w-4", i < rating ? "text-yellow-400" : "text-muted-foreground")}
						fill={i < rating ? "currentColor" : "none"}
						key={i}
						stroke={i < rating ? "none" : "currentColor"}
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							clipRule="evenodd"
							d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
							fillRule="evenodd"
						/>
					</svg>
				))}
			</div>
			<p className="mb-2 text-muted-foreground text-sm italic">&ldquo;{quote}&rdquo;</p>
			<p className="font-medium text-muted-foreground text-xs">{author}</p>
		</div>
	);
}
