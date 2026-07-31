import {
	Award,
	Box,
	Clock,
	CreditCard,
	HeartHandshake,
	Leaf,
	type LucideIcon,
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

/**
 * Every tile is graded to one of two lights — the cool key or the warm flush.
 * Seven hues across a grid reads as decoration; two reads as a system.
 */
type Tone = "cool" | "warm";

const TONE_ICON: Record<Tone, string> = {
	cool: "border-primary/25 bg-primary/10 text-primary",
	warm: "border-flush/25 bg-flush/10 text-flush",
};

const TONE_CHIP: Record<Tone, string> = {
	cool: "border-primary/25 bg-primary/10 text-primary",
	warm: "border-flush/25 bg-flush/10 text-flush",
};

function Tile({
	children,
	className,
	icon: Icon,
	tone,
}: {
	children: React.ReactNode;
	className?: string;
	icon: LucideIcon;
	tone: Tone;
}): React.ReactElement {
	return (
		<div
			className={cn(
				"group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card p-6 transition-colors duration-300 hover:border-foreground/25",
				className
			)}
		>
			<div className={cn("mb-5 inline-flex shrink-0 self-start rounded-md border p-3", TONE_ICON[tone])}>
				<Icon className="h-6 w-6" />
			</div>
			<div className="flex min-h-0 flex-1 flex-col">{children}</div>
		</div>
	);
}

function Chip({ children, tone }: { children: React.ReactNode; tone: Tone }): React.ReactElement {
	return (
		<span className={cn("slate inline-flex items-center gap-1.5 rounded-sm border px-2 py-1", TONE_CHIP[tone])}>
			{children}
		</span>
	);
}

export function WhyChooseBentoV2({
	brandName = "Zugzology",
	tagline = "Premium Mushroom Cultivation Supplies",
	className,
}: WhyChooseBentoV2Props) {
	return (
		<section className={cn("lit border-border border-b bg-background", className)}>
			<div className="container mx-auto px-4 py-16 sm:py-20 lg:py-24">
				<div className="mb-12 text-center sm:mb-16">
					<div className="mb-4 flex items-center justify-center gap-3">
						<span className="h-px w-8 bg-flush" />
						<span className="slate text-flush">What you get</span>
					</div>
					<h2 className="display-wide font-display font-semibold text-[clamp(1.75rem,4.5vw,3rem)] text-foreground leading-[0.95] tracking-[-0.025em]">
						Why choose {brandName}?
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">{tagline}</p>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{/* Featured — community */}
					<Tile className="sm:col-span-2 sm:row-span-2 sm:p-8" icon={Users} tone="cool">
						<div className="relative flex h-full flex-col">
							<h3 className="display-wide mb-3 font-display font-semibold text-[clamp(1.5rem,3vw,2.25rem)] text-foreground leading-[0.98] tracking-[-0.025em]">
								Join 10,000+ growers
							</h3>
							<p className="mb-8 max-w-lg text-muted-foreground leading-relaxed">
								Part of a thriving community of mycology enthusiasts sharing knowledge and success stories every day.
							</p>
							<dl className="mt-auto grid grid-cols-3 divide-x divide-border border-border border-t pt-6">
								{[
									{ label: "Avg rating", value: "4.9" },
									{ label: "Reviews", value: "2.5k+" },
									{ label: "Orders shipped", value: "25k+" },
								].map((stat, index) => (
									<div className={cn("px-4", index === 0 && "pl-0")} key={stat.label}>
										<dd className="font-medium font-mono text-2xl text-foreground tabular-nums sm:text-3xl">
											{stat.value}
										</dd>
										<dt className="slate mt-2 text-muted-foreground">{stat.label}</dt>
									</div>
								))}
							</dl>
						</div>
					</Tile>

					{/* Lab tested */}
					<Tile className="lg:row-span-2" icon={Award} tone="warm">
						<div className="flex h-full flex-col">
							<h3 className="mb-2 font-display font-semibold text-foreground text-xl">Lab-tested quality</h3>
							<p className="mb-5 flex-grow text-muted-foreground text-sm leading-relaxed">
								Every product undergoes rigorous testing for contamination, viability, and genetic integrity.
							</p>
							<div className="self-start">
								<Chip tone="warm">
									<ShieldCheck className="h-3 w-3" />
									ISO certified
								</Chip>
							</div>
						</div>
					</Tile>

					{/* Expert mycologists */}
					<Tile className="hidden xl:row-span-2 xl:block" icon={Leaf} tone="cool">
						<div className="flex h-full flex-col">
							<h3 className="mb-2 font-display font-semibold text-foreground text-xl">Expert mycologists</h3>
							<p className="mb-5 flex-grow text-muted-foreground text-sm leading-relaxed">
								Get answers from certified cultivation experts who have years of hands-on experience in mushroom
								growing.
							</p>
							<ul className="mt-auto space-y-2.5 border-border border-t pt-5">
								{["24/7 knowledge base", "Email support", "Growing guides"].map((item) => (
									<li className="flex items-center gap-2.5 text-muted-foreground text-sm" key={item}>
										<span className="h-1 w-1 rounded-full bg-primary" />
										{item}
									</li>
								))}
							</ul>
						</div>
					</Tile>

					{/* Free shipping */}
					<Tile icon={Truck} tone="cool">
						<h3 className="mb-2 font-display font-semibold text-foreground text-xl">Free shipping</h3>
						<p className="text-muted-foreground text-sm">On orders over $50 with fast delivery</p>
					</Tile>

					{/* Support hours */}
					<Tile icon={Clock} tone="warm">
						<div className="mb-2 font-medium font-mono text-3xl text-foreground tabular-nums">24/7</div>
						<p className="text-muted-foreground text-sm">Comprehensive support when you need it</p>
					</Tile>

					{/* Discreet shipping */}
					<Tile icon={Box} tone="cool">
						<h3 className="mb-2 font-display font-semibold text-foreground text-xl">100% discreet</h3>
						<p className="text-muted-foreground text-sm">Plain packaging with complete privacy</p>
					</Tile>

					{/* Guarantee */}
					<Tile icon={HeartHandshake} tone="warm">
						<div className="mb-2 flex items-center gap-3">
							<h3 className="font-display font-semibold text-foreground text-xl">30-day</h3>
							<Chip tone="warm">Guarantee</Chip>
						</div>
						<p className="text-muted-foreground text-sm">100% money-back if not satisfied</p>
					</Tile>

					{/* Premium selection — wide */}
					<Tile className="hidden sm:col-span-2 sm:block xl:col-span-2" icon={ShieldCheck} tone="cool">
						<div className="flex h-full flex-col justify-between gap-6 xl:flex-row xl:items-end">
							<div className="max-w-md">
								<h3 className="mb-2 font-display font-semibold text-foreground text-xl sm:text-2xl">
									Premium selection
								</h3>
								<p className="max-w-md text-muted-foreground text-sm leading-relaxed">
									Every product is carefully selected, tested, and verified for maximum cultivation success.
								</p>
							</div>
							<div className="flex flex-wrap gap-2">
								{["Lab tested", "Quality verified", "Contamination free"].map((item) => (
									<Chip key={item} tone="cool">
										{item}
									</Chip>
								))}
							</div>
						</div>
					</Tile>

					{/* Fulfillment */}
					<Tile className="hidden sm:block" icon={Package} tone="warm">
						<h3 className="mb-2 font-display font-semibold text-foreground text-xl">Ships in 24 hours</h3>
						<p className="mb-4 text-muted-foreground text-sm">Order today, ships tomorrow — guaranteed</p>
						<Chip tone="warm">
							<Clock className="h-3 w-3" />
							24-hr fulfillment
						</Chip>
					</Tile>

					{/* Secure checkout */}
					<Tile className="hidden sm:block" icon={Shield} tone="cool">
						<h3 className="mb-2 font-display font-semibold text-foreground text-xl">Secure checkout</h3>
						<p className="mb-4 text-muted-foreground text-sm">SSL encrypted with bank-level security</p>
						<div className="flex flex-wrap gap-2">
							{["SSL", "PCI-DSS", "256-bit"].map((item) => (
								<Chip key={item} tone="cool">
									{item}
								</Chip>
							))}
						</div>
					</Tile>

					{/* Payment methods — full width */}
					<Tile className="hidden sm:col-span-2 sm:block lg:col-span-3 xl:col-span-4" icon={CreditCard} tone="cool">
						<div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
							<div>
								<h3 className="font-display font-semibold text-foreground text-xl">All payment methods accepted</h3>
								<p className="text-muted-foreground text-sm">Credit cards, PayPal, Apple Pay, Shop Pay and more</p>
							</div>
							<div className="flex flex-wrap justify-center gap-2 sm:justify-end">
								{["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay", "Shop Pay"].map((card) => (
									<span
										className="slate rounded-sm border border-border bg-foreground/[0.04] px-2 py-1 text-muted-foreground"
										key={card}
									>
										{card}
									</span>
								))}
							</div>
						</div>
					</Tile>
				</div>
			</div>
		</section>
	);
}
