import {
	Award,
	Box,
	Clock,
	CreditCard,
	HeartHandshake,
	Leaf,
	Package,
	Shield,
	ShieldCheck,
	Truck,
	Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type WhyChooseBentoV2Props = {
	brandName?: string;
	tagline?: string;
	className?: string;
};

export function WhyChooseBentoV2({
	brandName = "Zugzology",
	tagline = "Premium Mushroom Cultivation Supplies",
	className,
}: WhyChooseBentoV2Props) {
	return (
		<section className={cn("border-border/50 border-b bg-background", className)}>
			<div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
				{/* Header Section */}
				<div className="mb-10 text-center sm:mb-14">
					<h2 className="mb-3 font-bold text-2xl text-foreground tracking-tight sm:mb-4 sm:text-3xl lg:text-4xl">
						Why Choose {brandName}?
					</h2>
					<p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">{tagline}</p>
				</div>

				{/* Bento Grid - 4 columns on xl for wider screens */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{/* Featured Card - Community (spans 2 cols, 2 rows) */}
					<div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg sm:col-span-2 sm:row-span-2 sm:p-8">
						<div className="-translate-y-8 absolute top-0 right-0 h-32 w-32 translate-x-8 rounded-full bg-primary/5" />
						<div className="relative flex h-full flex-col">
							<div className="mb-4 inline-flex items-center gap-2 self-start rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
								<Users className="h-4 w-4 text-primary" />
								<span className="font-medium text-primary text-sm">Trusted Community</span>
							</div>
							<h3 className="mb-3 font-bold text-2xl text-foreground sm:text-3xl">Join 10,000+ Growers</h3>
							<p className="mb-6 max-w-lg text-muted-foreground leading-relaxed">
								Part of a thriving community of mycology enthusiasts sharing knowledge and success stories every day.
							</p>
							<div className="mt-auto flex flex-wrap items-center gap-4 sm:gap-6">
								<div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
									<div className="font-bold text-2xl text-primary sm:text-3xl">4.9★</div>
									<div className="text-muted-foreground text-xs">Avg Rating</div>
								</div>
								<div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
									<div className="font-bold text-2xl text-foreground sm:text-3xl">2.5k+</div>
									<div className="text-muted-foreground text-xs">Reviews</div>
								</div>
								<div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
									<div className="font-bold text-2xl text-foreground sm:text-3xl">25k+</div>
									<div className="text-muted-foreground text-xs">Orders Shipped</div>
								</div>
							</div>
						</div>
					</div>

					{/* Lab Tested Quality (spans 2 rows on lg+) */}
					<div className="group overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg lg:row-span-2">
						<div className="flex h-full flex-col">
							<div className="mb-4 inline-flex self-start rounded-xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
								<Award className="h-8 w-8" />
							</div>
							<h3 className="mb-2 font-bold text-foreground text-xl">Lab-Tested Quality</h3>
							<p className="mb-4 flex-grow text-muted-foreground text-sm leading-relaxed">
								Every product undergoes rigorous testing for contamination, viability, and genetic integrity.
							</p>
							<div className="inline-flex items-center gap-2 self-start rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5">
								<ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
								<span className="font-medium text-amber-700 text-xs dark:text-amber-400">ISO Certified</span>
							</div>
						</div>
					</div>

					{/* Expert Mycologists - visible on xl */}
					<div className="group hidden overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg xl:row-span-2 xl:block">
						<div className="flex h-full flex-col">
							<div className="mb-4 inline-flex self-start rounded-xl bg-primary/10 p-3 text-primary">
								<Leaf className="h-8 w-8" />
							</div>
							<h3 className="mb-2 font-bold text-foreground text-xl">Expert Mycologists</h3>
							<p className="mb-4 flex-grow text-muted-foreground text-sm leading-relaxed">
								Get answers from certified cultivation experts who have years of hands-on experience in mushroom
								growing.
							</p>
							<div className="mt-auto space-y-2">
								<div className="flex items-center gap-2 text-muted-foreground text-sm">
									<div className="h-1.5 w-1.5 rounded-full bg-primary" />
									<span>24/7 Knowledge Base</span>
								</div>
								<div className="flex items-center gap-2 text-muted-foreground text-sm">
									<div className="h-1.5 w-1.5 rounded-full bg-primary" />
									<span>Email Support</span>
								</div>
								<div className="flex items-center gap-2 text-muted-foreground text-sm">
									<div className="h-1.5 w-1.5 rounded-full bg-primary" />
									<span>Growing Guides</span>
								</div>
							</div>
						</div>
					</div>

					{/* Free Shipping */}
					<div className="group overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
						<div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
							<Truck className="h-8 w-8" />
						</div>
						<h3 className="mb-2 font-bold text-foreground text-xl">Free Shipping</h3>
						<p className="text-muted-foreground text-sm">On orders over $50 with fast delivery</p>
					</div>

					{/* 24/7 Support */}
					<div className="group overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg">
						<div className="mb-4 inline-flex rounded-xl bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400">
							<Clock className="h-8 w-8" />
						</div>
						<div className="mb-2 flex items-baseline gap-2">
							<span className="font-bold text-3xl text-foreground">24</span>
							<span className="text-muted-foreground text-xl">/</span>
							<span className="font-bold text-3xl text-foreground">7</span>
						</div>
						<p className="text-muted-foreground text-sm">Comprehensive support when you need it</p>
					</div>

					{/* Discreet Shipping */}
					<div className="group overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg">
						<div className="mb-4 inline-flex rounded-xl bg-purple-500/10 p-3 text-purple-600 dark:text-purple-400">
							<Box className="h-8 w-8" />
						</div>
						<h3 className="mb-2 font-bold text-foreground text-xl">100% Discreet</h3>
						<p className="text-muted-foreground text-sm">Plain packaging with complete privacy</p>
					</div>

					{/* 30-Day Guarantee */}
					<div className="group overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-rose-500/30 hover:shadow-lg">
						<div className="mb-4 inline-flex rounded-xl bg-rose-500/10 p-3 text-rose-600 dark:text-rose-400">
							<HeartHandshake className="h-8 w-8" />
						</div>
						<div className="mb-2 flex items-center gap-2">
							<h3 className="font-bold text-foreground text-xl">30-Day</h3>
							<span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 font-medium text-rose-600 text-xs dark:text-rose-400">
								Guarantee
							</span>
						</div>
						<p className="text-muted-foreground text-sm">100% money-back if not satisfied</p>
					</div>

					{/* Premium Selection - Wide Card */}
					<div className="group hidden overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg sm:col-span-2 sm:block xl:col-span-2">
						<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex-1">
								<div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
									<ShieldCheck className="h-8 w-8" />
								</div>
								<h3 className="mb-2 font-bold text-foreground text-xl sm:text-2xl">Premium Selection</h3>
								<p className="max-w-md text-muted-foreground text-sm leading-relaxed">
									Every product is carefully selected, tested, and verified for maximum cultivation success.
								</p>
							</div>
							<div className="flex flex-wrap gap-3">
								{["Lab Tested", "Quality Verified", "Contamination Free"].map((item) => (
									<div
										className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2"
										key={item}
									>
										<div className="h-2 w-2 rounded-full bg-primary" />
										<span className="font-medium text-foreground text-sm">{item}</span>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Ships in 24 Hours */}
					<div className="group hidden overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg sm:block">
						<div className="mb-4 inline-flex rounded-xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-400">
							<Package className="h-8 w-8" />
						</div>
						<h3 className="mb-2 font-bold text-foreground text-xl">Ships in 24 Hours</h3>
						<p className="mb-3 text-muted-foreground text-sm">Order today, ships tomorrow - guaranteed</p>
						<div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1">
							<Clock className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
							<span className="font-medium text-indigo-700 text-xs dark:text-indigo-400">24-hr Fulfillment</span>
						</div>
					</div>

					{/* Secure Checkout */}
					<div className="group hidden overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg sm:block">
						<div className="mb-4 inline-flex rounded-xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
							<Shield className="h-8 w-8" />
						</div>
						<h3 className="mb-2 font-bold text-foreground text-xl">Secure Checkout</h3>
						<p className="mb-3 text-muted-foreground text-sm">SSL encrypted with bank-level security</p>
						<div className="flex gap-2">
							{["SSL", "PCI-DSS", "256-bit"].map((item) => (
								<div
									className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 font-medium text-emerald-700 text-xs dark:text-emerald-400"
									key={item}
								>
									{item}
								</div>
							))}
						</div>
					</div>

					{/* Payment Methods - Full Width */}
					<div className="group hidden overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg sm:col-span-2 sm:block lg:col-span-3 xl:col-span-4">
						<div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
							<div className="flex items-center gap-4">
								<div className="inline-flex rounded-xl bg-primary/10 p-3 text-primary">
									<CreditCard className="h-8 w-8" />
								</div>
								<div>
									<h3 className="font-bold text-foreground text-xl">All Payment Methods Accepted</h3>
									<p className="text-muted-foreground text-sm">Credit cards, PayPal, Apple Pay, Shop Pay and more</p>
								</div>
							</div>
							<div className="flex flex-wrap justify-center gap-2 sm:justify-end">
								{["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "Shop Pay"].map((card) => (
									<div
										className="rounded-md border border-border bg-muted/50 px-3 py-1.5 font-medium text-foreground text-xs"
										key={card}
									>
										{card}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
