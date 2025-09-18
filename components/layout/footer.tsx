import { Link } from '@/components/ui/link';
import StoreFeatures from "../store/store-features";
import { getStoreConfigSafe } from "@/lib/config/store-config";
import { getAllCollections, getMenu, getPages } from "@/lib/api/shopify/actions";
import type { ShopifyMenuItem, ShopifyPage, ShopifyCollection } from "@/lib/types";
import { transformShopifyUrl } from "@/components/utils/transform-shopify-url";
import { cache } from "react";
import { connection } from "next/server";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

interface FooterLink {
	title: string;
	href: string;
}

const mapMenuLinks = (items: ShopifyMenuItem[] = [], limit = 6): FooterLink[] => {
	return items.slice(0, limit).map((item) => ({
		title: item.title,
		href: transformShopifyUrl(item.url),
	}));
};

const buildPageLinks = (pages: ShopifyPage[] = [], limit = 6): FooterLink[] => {
	return pages.slice(0, limit).map((page) => ({
		href: transformShopifyUrl(page.onlineStoreUrl || `/pages/${page.handle}`),
		title: page.title,
	}));
};

const buildCollectionLinks = (collections: ShopifyCollection[] = [], limit = 6): FooterLink[] => {
	return collections.slice(0, limit).map((collection) => ({
		href: `/collections/${collection.handle}`,
		title: collection.title,
	}));
};

const FALLBACK_SOCIAL_LINKS: FooterLink[] = [
	{ href: "https://www.instagram.com/zugzology", title: "Instagram" },
	{ href: "https://twitter.com/zugzology", title: "Twitter" },
	{ href: "https://www.youtube.com/@zugzology", title: "YouTube" },
	{ href: "https://www.linkedin.com/company/zugzology", title: "LinkedIn" },
	{ href: "https://www.facebook.com/zugzology", title: "Facebook" },
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

	const socialLinks = (config.seo as any)?.socialMediaLinks || FALLBACK_SOCIAL_LINKS;

	return (
		<footer className="w-full border-t border-border bg-background">
			<StoreFeatures />

			<section className="border-y border-border/70 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10 py-10">
				<div className="container mx-auto flex flex-col gap-6 sm:items-center sm:text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
					<div className="space-y-3">
						<p className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
							Join the community
						</p>
						<h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
							Stay in the Loop with {config.storeName}
						</h2>
						<p className="max-w-xl text-sm text-muted-foreground sm:mx-auto lg:mx-0">
							Get cultivation tips, product launches, and exclusive offers delivered to your inbox. No spam—just the good stuff.
						</p>
					</div>
					<form action="/api/newsletter" method="post" className="w-full max-w-lg space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
						<label className="sr-only" htmlFor="footer-email">
							Email address
						</label>
						<input
							id="footer-email"
							name="email"
							type="email"
							required
							className="h-11 w-full flex-1 rounded-md border border-border/70 bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
							placeholder="you@example.com"
							autoComplete="email"
						/>
						<button type="submit" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
							Subscribe
						</button>
					</form>
				</div>
			</section>

			<div className="border-t border-border/70 bg-white/50 dark:bg-black/40">
				<div className="container mx-auto grid gap-12 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-foreground">{config.storeName}</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{config.storeDescription || "Premium cultivation supplies and resources for growers at every level."}
						</p>
						<div className="space-y-2 text-sm text-muted-foreground">
							<p className="flex items-center gap-2">
								<Mail className="h-4 w-4" />
								<a href="mailto:hello@zugzology.com" className="hover:text-foreground">
									hello@zugzology.com
								</a>
							</p>
							<p className="flex items-center gap-2">
								<Phone className="h-4 w-4" />
								<a href="tel:+18001234567" className="hover:text-foreground">
									(800) 123-4567
								</a>
							</p>
							<p className="flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								<span>California, USA</span>
							</p>
						</div>
					</div>

					<div>
						<h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Shop</h4>
						<ul className="mt-4 space-y-2 text-sm">
							{(shopLinks.length ? shopLinks : [
								{ href: "/collections/all", title: "All Products" },
								{ href: "/collections/new", title: "New Arrivals" },
								{ href: "/collections/best-sellers", title: "Best Sellers" },
							]).map((link) => (
								<li key={`shop-${link.href}`}>
									<Link href={link.href} className="text-muted-foreground transition hover:text-foreground">
										{link.title}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Collections</h4>
						<ul className="mt-4 space-y-2 text-sm">
							{(collectionLinks.length ? collectionLinks : [
								{ href: "/collections/grow-bags", title: "Grow Bags" },
								{ href: "/collections/substrates", title: "Substrates" },
							]).map((link) => (
								<li key={`collections-${link.href}`}>
									<Link href={link.href} className="text-muted-foreground transition hover:text-foreground">
										{link.title}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resources</h4>
						<ul className="mt-4 space-y-2 text-sm">
							{[...pageLinks, ...supportLinks].slice(0, 6).map((link) => (
								<li key={`resources-${link.href}`}>
									<Link href={link.href} className="text-muted-foreground transition hover:text-foreground">
										{link.title}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			<div className="border-t border-border/70 bg-muted/40">
				<div className="container mx-auto flex flex-col gap-5 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
					<p>&copy; {new Date().getFullYear()} {config.storeName}. All rights reserved.</p>
					<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
						<Link href="/privacy" className="hover:text-foreground">
							Privacy Policy
						</Link>
						<Link href="/terms" className="hover:text-foreground">
							Terms of Service
						</Link>
						<Link href="/accessibility" className="hover:text-foreground">
							Accessibility
						</Link>
					</div>
					<ul className="flex items-center gap-4">
						{socialLinks.map((social) => {
							const Icon =
								social.title.toLowerCase().includes("instagram") ? Instagram :
								social.title.toLowerCase().includes("linkedin") ? Linkedin :
								social.title.toLowerCase().includes("youtube") ? Youtube :
								social.title.toLowerCase().includes("twitter") ? Twitter :
								Facebook;

							return (
								<li key={`social-${social.href}`}>
									<a
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition hover:border-primary hover:text-primary"
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
