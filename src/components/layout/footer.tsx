import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import Image from "next/image";
import { connection } from "next/server";
import { WhyChooseBentoV2 } from "@/components/sections/why-choose-bento-v2";
import { Link } from "@/components/ui/link";
import { transformShopifyUrl } from "@/components/utils/transform-shopify-url";
import { getAllCollections, getMenu, getPages } from "@/lib/api/shopify/actions";
import { getStoreConfigSafe } from "@/lib/config/store-config";
import { BRAND, BUSINESS, CONTACT, SOCIAL } from "@/lib/config/wadesdesign.config";
import type { ShopifyCollection, ShopifyMenuItem, ShopifyPage } from "@/lib/types";

type FooterLink = {
	title: string;
	href: string;
};

const mapMenuLinks = (items: ShopifyMenuItem[] = [], limit = 6): FooterLink[] =>
	items.slice(0, limit).map((item) => ({
		title: item.title,
		href: transformShopifyUrl(item.url),
	}));

const buildPageLinks = (pages: ShopifyPage[] = [], limit = 6): FooterLink[] =>
	pages.slice(0, limit).map((page) => ({
		href: `/pages/${page.handle}`, // Direct link to dynamic pages route (don't transform)
		title: page.title,
	}));

const buildCollectionLinks = (collections: ShopifyCollection[] = [], limit = 6): FooterLink[] =>
	collections.slice(0, limit).map((collection) => ({
		href: `/collections/${collection.handle}`,
		title: collection.title,
	}));

const _FALLBACK_SOCIAL_LINKS: FooterLink[] = [
	{ href: SOCIAL.instagram, title: "Instagram" },
	{ href: SOCIAL.twitter, title: "Twitter" },
	{ href: SOCIAL.youtube, title: "YouTube" },
	{ href: SOCIAL.linkedin, title: "LinkedIn" },
	{ href: SOCIAL.facebook, title: "Facebook" },
];

export async function Footer() {
	// Await connection to allow use of new Date() with dynamicIO
	await connection();

	const config = getStoreConfigSafe();
	const mainMenuHandle = config.navigation?.mainMenu || "main-menu";
	const footerMenuHandle = config.navigation?.footerMenu || "footer";

	const [mainMenuItems, footerMenuItems, collections, pages] = await Promise.all([
		getMenu(mainMenuHandle).catch(() => []),
		getMenu(footerMenuHandle).catch(() => []),
		getAllCollections().catch(() => []),
		getPages().catch(() => []),
	]);

	const shopLinks = mapMenuLinks(mainMenuItems, 6);
	const supportLinks = footerMenuItems.length ? mapMenuLinks(footerMenuItems, 6) : [];
	const collectionLinks = buildCollectionLinks(collections || [], 6);
	const pageLinks = buildPageLinks(pages || [], 6);

	// Build social links from wadesdesign config
	const socialLinks: FooterLink[] = [
		...(SOCIAL.instagram ? [{ href: SOCIAL.instagram, title: "Instagram" }] : []),
		...(SOCIAL.twitter ? [{ href: SOCIAL.twitter, title: "Twitter" }] : []),
		...(SOCIAL.youtube ? [{ href: SOCIAL.youtube, title: "YouTube" }] : []),
		...(SOCIAL.linkedin ? [{ href: SOCIAL.linkedin, title: "LinkedIn" }] : []),
		...(SOCIAL.facebook ? [{ href: SOCIAL.facebook, title: "Facebook" }] : []),
	];

	return (
		<footer className="w-full border-border border-t bg-background">
			{/* Animated Bento Grid Why Choose Section - V2 with Rich Visuals */}
			<WhyChooseBentoV2
				brandName={BRAND.name}
				tagline={
					BRAND.tagline || "Premium mushroom cultivation supplies with the support and quality you need to succeed."
				}
			/>

			<section className="border-border/70 border-y bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
				<div className="container mx-auto flex flex-col gap-6 px-4 py-12 sm:items-center sm:text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
					<div className="space-y-3">
						<p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-semibold text-primary text-xs uppercase tracking-wide">
							Join the community
						</p>
						<h2 className="font-semibold text-2xl text-foreground tracking-tight sm:text-3xl">
							Stay in the Loop with {BRAND.name}
						</h2>
						<p className="max-w-xl text-muted-foreground text-sm sm:mx-auto lg:mx-0">
							Get cultivation tips, product launches, and exclusive offers delivered to your inbox. No spam—just the
							good stuff.
						</p>
					</div>
					<form
						action="/api/newsletter"
						className="w-full max-w-lg space-y-3 sm:flex sm:items-center sm:gap-3 sm:space-y-0"
						method="post"
					>
						<label className="sr-only" htmlFor="footer-email">
							Email address
						</label>
						<input
							autoComplete="email"
							className="h-12 w-full flex-1 rounded-md border border-border/70 bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:h-11"
							id="footer-email"
							name="email"
							placeholder="you@example.com"
							required
							type="email"
						/>
						<button
							className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-5 font-medium text-primary-foreground text-sm transition hover:bg-primary/90 sm:h-11"
							type="submit"
						>
							Subscribe
						</button>
					</form>
				</div>
			</section>

			<div className="border-border/70 border-t bg-card/50">
				<div className="container mx-auto grid gap-12 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
					<div className="space-y-4">
						<div className="flex items-center gap-3">
							<div className="relative h-8 w-8 flex-shrink-0">
								<Image
									alt={`${BRAND.name} Logo`}
									className="object-contain dark:invert"
									fill
									sizes="32px"
									src={config.branding?.logoUrl || "/logo.png"}
								/>
							</div>
							<h3 className="font-semibold text-foreground text-lg">{BRAND.name}</h3>
						</div>
						<p className="text-muted-foreground text-sm leading-relaxed">{BRAND.tagline}</p>
						<div className="space-y-2 text-muted-foreground text-sm">
							<p className="flex items-center gap-2">
								<Mail className="h-4 w-4" />
								<a className="hover:text-foreground" href={`mailto:${CONTACT.email.general}`}>
									{CONTACT.email.general}
								</a>
							</p>
							<p className="flex items-center gap-2">
								<Phone className="h-4 w-4" />
								<a className="hover:text-foreground" href={`tel:${CONTACT.phone.mainFormatted}`}>
									{CONTACT.phone.main}
								</a>
							</p>
							<p className="flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								<span>
									{BUSINESS.address.city}, {BUSINESS.address.state}
								</span>
							</p>
						</div>
					</div>

					<div>
						<h4 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">Shop</h4>
						<ul className="mt-4 space-y-2 text-sm">
							{(shopLinks.length
								? shopLinks
								: [
										{ href: "/collections/all", title: "All Products" },
										{ href: "/collections/sale", title: "Todays Sale" },
										{ href: "/collections/best-sellers", title: "Best Sellers" },
										{ href: "/collections/new-arrivals", title: "New Arrivals" },
										{ href: "/collections/culinary", title: "Culinary" },
										{ href: "/collections/grow-supplies", title: "Grow Supplies" },
									]
							).map((link) => (
								<li key={`shop-${link.href}`}>
									<Link className="text-muted-foreground transition hover:text-foreground" href={link.href}>
										{link.title}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">Collections</h4>
						<ul className="mt-4 space-y-2 text-sm">
							{(collectionLinks.length
								? collectionLinks
								: [
										{ href: "/collections/best-sellers", title: "Best Sellers" },
										{ href: "/collections/culinary", title: "Culinary" },
										{ href: "/collections/grow-supplies", title: "Grow Supplies" },
										{ href: "/collections/liquid-culture", title: "Liquid Culture" },
										{ href: "/collections/medicinal", title: "Medicinal" },
										{ href: "/collections/microscopy-use", title: "Microscopy Use" },
									]
							).map((link) => (
								<li key={`collections-${link.href}`}>
									<Link className="text-muted-foreground transition hover:text-foreground" href={link.href}>
										{link.title}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">Resources</h4>
						<ul className="mt-4 space-y-2 text-sm">
							{([...pageLinks, ...supportLinks].length
								? [...pageLinks, ...supportLinks].slice(0, 6)
								: [
										{ href: "/contact", title: "Contact" },
										{ href: "/creators", title: "Collabs" },
										{ href: "/seller-profile", title: "Seller Profile" },
										{ href: "/reviews", title: "Customer Reviews" },
										{ href: "/search", title: "Search" },
									]
							).map((link) => (
								<li key={`resources-${link.href}`}>
									<Link className="text-muted-foreground transition hover:text-foreground" href={link.href}>
										{link.title}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			<div className="border-border/70 border-t bg-muted/40">
				<div className="container mx-auto flex flex-col gap-5 px-4 py-6 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
					<p>
						&copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
					</p>
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
						<Link className="hover:text-foreground" href="/privacy">
							Privacy Policy
						</Link>
						<Link className="hover:text-foreground" href="/terms">
							Terms of Service
						</Link>
						<Link className="hover:text-foreground" href="/accessibility">
							Accessibility
						</Link>
					</div>
					<ul className="flex items-center gap-4">
						{socialLinks.map((social) => {
							const Icon = social.title.toLowerCase().includes("instagram")
								? Instagram
								: social.title.toLowerCase().includes("linkedin")
									? Linkedin
									: social.title.toLowerCase().includes("youtube")
										? Youtube
										: social.title.toLowerCase().includes("twitter")
											? Twitter
											: Facebook;

							return (
								<li key={`social-${social.href}`}>
									<a
										className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-all duration-200 hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
										href={social.href}
										rel="noopener noreferrer"
										target="_blank"
									>
										<Icon className="h-4 w-4" />
									</a>
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		</footer>
	);
}
