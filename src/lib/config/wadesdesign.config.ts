/**
 * ============================================================================
 * WADESDESIGN STORE CONFIGURATION
 * ============================================================================
 *
 * This file centralizes ALL hardcoded content for the storefront.
 * Change your store's branding, copy, and settings in ONE place.
 *
 * To customize for a different store:
 * 1. Update the values below
 * 2. Replace images in /public folder
 * 3. That's it! No code changes needed.
 *
 * ============================================================================
 */

import type { LucideIcon } from "lucide-react";
import { BookOpen, HeadphonesIcon, RefreshCw, ShieldCheck, Sprout, Truck } from "lucide-react";

// ============================================================================
// SECTION 1: BRAND & IDENTITY
// ============================================================================

export const BRAND = {
	// Core brand information
	name: "Zugzology",
	legalName: "Zugzology LLC",
	tagline: "Premium Mushroom Cultivation Supplies",
	slogan: "From Spore to Harvest",

	// Domain configuration
	domain: "zugzology.com",
	url: "https://zugzology.com",

	// Visual identity
	logo: {
		path: "/logo.png",
		alt: "Zugzology Logo",
		width: 180,
		height: 60,
	},
	favicon: {
		path: "/favicon.ico",
	},

	// Brand colors
	colors: {
		primary: "#2A6592", // Psilocybin Blue
		secondary: "#C18A3C", // Golden Cap
		accent: "#EDEBE3", // Mycelium White
	},

	// Founder information
	founder: {
		name: "Byron Wade",
		title: "CEO & Founder",
	},

	// Company details
	foundingDate: "2020-01-01",
	foundingYear: "2020",
} as const;

// ============================================================================
// SECTION 2: BUSINESS INFORMATION
// ============================================================================

export const BUSINESS = {
	// Physical address
	address: {
		street: "123 Cultivation Lane",
		city: "San Francisco",
		state: "CA",
		stateCode: "CA",
		zip: "94102",
		country: "United States",
		countryCode: "US",
	},

	// Operating hours (for Schema.org)
	hours: {
		weekday: {
			days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
			opens: "09:00",
			closes: "17:00",
		},
		saturday: {
			days: ["Saturday"],
			opens: "10:00",
			closes: "16:00",
		},
		sunday: {
			days: ["Sunday"],
			opens: null, // Closed
			closes: null,
		},
	},

	// Business metrics (for Schema.org)
	metrics: {
		employeeRange: {
			min: 10,
			max: 50,
		},
		priceRange: "$$", // $ to $$$$
	},

	// Service areas
	serviceAreas: {
		countries: ["US", "CA"],
		languages: ["en", "es"],
	},
} as const;

// ============================================================================
// SECTION 3: CONTACT INFORMATION
// ============================================================================

export const CONTACT = {
	// Email addresses
	email: {
		support: "support@zugzology.com",
		sales: "sales@zugzology.com",
		general: "hello@zugzology.com",
		legal: "legal@zugzology.com",
	},

	// Phone numbers
	phone: {
		main: "1-800-ZUGZOLOGY",
		mainFormatted: "1-800-984-9656",
		international: "+1-415-555-0123",
		tollfree: true,
	},

	// Support options
	support: {
		hours: "Mon-Fri 9AM-5PM PST",
		responseTime: "24 hours",
		languages: ["English", "Spanish"],
		hearingImpaired: true,
	},
} as const;

// ============================================================================
// SECTION 4: SOCIAL MEDIA
// ============================================================================

export const SOCIAL = {
	facebook: "https://www.facebook.com/zugzology",
	instagram: "https://www.instagram.com/zugzology",
	twitter: "https://twitter.com/zugzology",
	youtube: "https://www.youtube.com/@zugzology",
	linkedin: "https://www.linkedin.com/company/zugzology",
	pinterest: "https://www.pinterest.com/zugzology",
	tiktok: "https://www.tiktok.com/@zugzology",

	// Social handles (without @)
	handles: {
		twitter: "zugzology",
		instagram: "zugzology",
		facebook: "zugzology",
	},
} as const;

// ============================================================================
// SECTION 5: STORE POLICIES
// ============================================================================

export const POLICIES = {
	// Shipping policy
	shipping: {
		freeShippingThreshold: 75, // USD
		standardShipping: {
			processingTime: "1-2 business days",
			deliveryTime: "3-5 business days",
			cost: 5.99,
		},
		expressShipping: {
			processingTime: "Same day",
			deliveryTime: "1-2 business days",
			cost: 15.99,
		},
		international: {
			available: false,
			note: "Contact support for international orders",
		},
	},

	// Return policy
	returns: {
		windowDays: 30,
		conditions: "30-day satisfaction guarantee",
		freeReturns: true,
		restockingFee: 0,
		fullText:
			"We offer a 30-day satisfaction guarantee. If you're not completely satisfied with your purchase, contact us for a full refund or replacement.",
	},

	// Warranty
	warranty: {
		durationYears: 1,
		description: "1-year product warranty on equipment",
	},

	// Payment methods
	payment: {
		accepted: [
			"Cash",
			"Credit Card",
			"Debit Card",
			"PayPal",
			"Shop Pay",
			"Apple Pay",
			"Google Pay",
			"Venmo",
			"Cryptocurrency",
		],
		logos: [
			{ name: "Visa", path: "/images/payment/visa.svg" },
			{ name: "Mastercard", path: "/images/payment/mastercard.svg" },
			{ name: "American Express", path: "/images/payment/amex.svg" },
			{ name: "PayPal", path: "/images/payment/paypal.svg" },
		],
	},

	// Privacy & compliance
	privacy: {
		cookieConsent: true,
		gdprCompliant: true,
		ccpaCompliant: true,
	},
} as const;

// ============================================================================
// SECTION 6: STORE FEATURES
// ============================================================================

export type StoreFeature = {
	id: string;
	icon: LucideIcon;
	title: string;
	description: string;
	order: number;
};

export const STORE_FEATURES: StoreFeature[] = [
	{
		id: "free-shipping",
		icon: Truck,
		title: "Free Shipping",
		description: "Free shipping on all orders over $75",
		order: 1,
	},
	{
		id: "satisfaction-guarantee",
		icon: ShieldCheck,
		title: "Satisfaction Guarantee",
		description: "30-day money-back guarantee on all products",
		order: 2,
	},
	{
		id: "sustainable",
		icon: Sprout,
		title: "Sustainable Practices",
		description: "Eco-friendly packaging and growing methods",
		order: 3,
	},
	{
		id: "expert-resources",
		icon: BookOpen,
		title: "Expert Resources",
		description: "Free access to our cultivation guides and videos",
		order: 4,
	},
	{
		id: "customer-support",
		icon: HeadphonesIcon,
		title: "Customer Support",
		description: "Dedicated support from experienced growers",
		order: 5,
	},
	{
		id: "subscriptions",
		icon: RefreshCw,
		title: "Subscription Options",
		description: "Save with regular deliveries of your favorites",
		order: 6,
	},
];

// ============================================================================
// SECTION 7: INDUSTRY & PRODUCT CATEGORIES
// ============================================================================

export const INDUSTRY = {
	// Industry type
	type: "Mushroom Cultivation",
	category: "Agriculture & Horticulture",

	// Product categories (maps to Shopify collections)
	categories: [
		{ handle: "growing-kits", name: "Growing Kits", description: "Complete mushroom growing kits" },
		{ handle: "substrates", name: "Substrates", description: "Premium growing substrates" },
		{ handle: "equipment", name: "Equipment", description: "Cultivation equipment" },
		{ handle: "supplies", name: "Supplies", description: "Growing supplies" },
		{ handle: "spawn", name: "Spawn", description: "Mushroom spawn" },
		{ handle: "liquid-culture", name: "Liquid Culture", description: "Liquid cultures" },
		{ handle: "bulk", name: "Bulk Orders", description: "Bulk quantities" },
	],

	// Industry-specific terminology
	terminology: {
		mainProduct: "mushroom growing supplies",
		productPlural: "cultivation supplies",
		activity: "mushroom cultivation",
		practitioner: "cultivator",
		practitioners: "growers",
		expertise: "mycology",
	},
} as const;

// ============================================================================
// SECTION 8: SEO & METADATA
// ============================================================================

export const SEO = {
	// Site-wide defaults
	site: {
		titleTemplate: "%s | Zugzology",
		defaultTitle: "Zugzology - Premium Mushroom Cultivation Supplies",
		titleSeparator: " | ",
	},

	// Default keywords (industry-specific)
	defaultKeywords: [
		"mushroom cultivation",
		"mushroom growing supplies",
		"mushroom growing kits",
		"mushroom substrate",
		"mushroom spawn",
		"mushroom cultivation equipment",
		"mycology supplies",
		"mushroom farming",
		"grow mushrooms at home",
		"mushroom growing bags",
		"sterilized substrate",
		"liquid culture",
		"mushroom spores",
		"oyster mushroom kits",
		"shiitake growing kits",
	],

	// Page-specific metadata
	pages: {
		home: {
			title: "Zugzology - Premium Mushroom Cultivation Supplies | Expert Support & Free Shipping",
			description:
				"Shop curated mushroom cultivation supplies from Zugzology. ✓ Free Shipping Over $75 ✓ Expert Growing Guides ✓ 30-Day Returns ✓ Trusted by 10,000+ Growers.",
			keywords: ["mushroom cultivation", "mushroom growing supplies", "mushroom growing kits"],
		},
		products: {
			title: "All Products - Mushroom Growing Supplies",
			description:
				"Discover our complete collection of premium mushroom growing supplies. ✓ 500+ Products ✓ Expert Support ✓ Free Shipping Over $75 ✓ 30-Day Returns.",
			keywords: ["mushroom growing supplies", "mushroom cultivation equipment", "mushroom substrate"],
		},
		collections: {
			titleSuffix: "Collection - Premium Mushroom Growing Supplies",
			descriptionTemplate:
				"Discover our premium {collection} collection. High-quality mushroom growing supplies and equipment with fast shipping and expert support.",
		},
		productDetail: {
			titleSuffix: "| Zugzology",
			notFoundTitle: "Product Not Found | Zugzology",
			notFoundDescription:
				"The requested product could not be found. Browse our collection of premium mushroom cultivation supplies.",
		},
		blog: {
			title: "Mushroom Cultivation Blog - Growing Guides & Tips",
			description:
				"Expert guides, tips, and insights for successful mushroom cultivation. Learn from experienced growers.",
		},
		account: {
			title: "My Account",
			description: "Manage your orders, account settings, and preferences.",
		},
		cart: {
			title: "Shopping Cart",
			description: "Review your items and checkout securely.",
		},
		search: {
			title: "Search Results",
			descriptionTemplate: 'Find premium mushroom cultivation supplies matching "{query}".',
		},
	},

	// Social/OG defaults
	og: {
		type: "website",
		siteName: "Zugzology",
		image: "/og-image.jpg",
		imageWidth: 1200,
		imageHeight: 630,
	},

	// Twitter card
	twitter: {
		card: "summary_large_image",
		site: "@zugzology",
		creator: "@zugzology",
	},
} as const;

// ============================================================================
// SECTION 9: MARKETING & PROMOTIONS
// ============================================================================

export const PROMOTIONS = {
	// Active promotions
	banners: {
		enabled: true,
		messages: ["Free shipping on orders over $75", "New products added weekly", "Expert growing support included"],
		rotationInterval: 5000, // milliseconds
	},

	// Discount tiers
	discounts: {
		volumeDiscounts: [
			{ threshold: 150, percentage: 5, message: "5% off orders over $150" },
			{ threshold: 300, percentage: 10, message: "10% off orders over $300" },
			{ threshold: 500, percentage: 15, message: "15% off orders over $500" },
		],
	},

	// Trust indicators
	trustBadges: {
		customerCount: "10,000+",
		reviewCount: "2,500+",
		averageRating: "4.8/5",
		successRate: "98%",
	},
} as const;

// ============================================================================
// SECTION 10: CONTENT & COPY
// ============================================================================

export const CONTENT = {
	// Homepage
	home: {
		hero: {
			defaultTitle: "Premium Mushroom Growing Supplies",
			defaultSubtitle: "Everything you need for successful mushroom cultivation, from spawn to harvest.",
			ctaPrimary: "Shop Now",
			ctaSecondary: "Browse Products",
			trustBadge: "Free shipping on orders over $50",
		},
		sections: {
			featured: {
				title: "Trending Kits & Supplies",
				subtitle: "Hand-selected items customers are loving right now",
				ctaLabel: "Shop all products",
			},
			bestSellers: {
				title: "Customer Favorites",
				subtitle: "Top-rated essentials backed by real purchase data",
				ctaLabel: "Browse best sellers",
			},
			newProducts: {
				title: "Latest Products",
				subtitle: "Check out our newest additions",
				ctaLabel: "View all new",
			},
			collections: {
				title: "Shop by Category",
				subtitle: "Explore our curated collections of premium cultivation supplies",
			},
		},
	},

	// Product pages
	product: {
		defaultFallback: "Premium mushroom growing supplies for serious cultivators.",
		stockStatus: {
			inStock: "In stock • Ships within 24 hours",
			lowStock: "Only {count} left in stock",
			outOfStock: "Out of stock",
			preOrder: "Available for pre-order",
		},
		trustBadges: ["30-day money-back guarantee", "Free shipping on orders over $75", "Expert support included"],
		sections: {
			description: "Product Details",
			specifications: "Specifications",
			reviews: "Customer Reviews",
			faq: "Frequently Asked Questions",
			related: "You May Also Like",
			recentlyViewed: "Recently Viewed",
		},
	},

	// Collection pages
	collection: {
		allProducts: {
			title: "All Products",
			description: "Browse our complete collection of premium mushroom growing supplies and equipment.",
		},
		fallbackDescription: "Browse our {collection} collection of premium mushroom growing supplies.",
		defaultSuffix: "Premium Mushroom Growing Supplies",
	},

	// Error pages
	errors: {
		notFound: {
			title: "Page Not Found",
			message: "The page you're looking for doesn't exist.",
			cta: "Return to Home",
		},
		productNotFound: {
			title: "Product Not Found",
			message:
				"The requested product could not be found. Browse our available mushroom cultivation supplies or search for something specific.",
			cta: "Browse Products",
		},
		collectionNotFound: {
			title: "Collection Not Found",
			message: "The requested collection could not be found.",
			cta: "View All Collections",
		},
		general: {
			title: "Something went wrong",
			message: "An unexpected error occurred. Please try again.",
			cta: "Try Again",
		},
	},

	// Authentication pages
	auth: {
		login: {
			title: "Sign In to Your Account",
			subtitle: "Access your orders, wishlist, and account settings.",
			cta: "Sign In",
			alternateAction: "Don't have an account? Sign up",
		},
		register: {
			title: "Create Your Account",
			subtitle: "Join thousands of successful mushroom cultivators.",
			cta: "Create Account",
			alternateAction: "Already have an account? Sign in",
		},
	},

	// Cart
	cart: {
		empty: {
			title: "Your cart is empty",
			message: "Start shopping to add items to your cart.",
			cta: "Continue Shopping",
		},
		summary: {
			subtotal: "Subtotal",
			shipping: "Shipping",
			tax: "Tax",
			total: "Total",
			freeShippingMessage: "Free shipping on all orders",
			checkoutButton: "Proceed to Checkout",
		},
	},

	// Header/Navigation UI strings
	navigation: {
		search: {
			placeholder: "Search...",
			placeholderLong: "Search Products and Articles...",
		},
		buttons: {
			learnAndGrow: "Learn & Grow",
			moreOptions: "More options",
			account: "Account",
			accountDashboard: "Account Dashboard",
			wishlist: "Wishlist",
			cart: "Cart",
			helpCenter: "Help Center",
			keyboardShortcuts: "Keyboard Shortcuts",
			orders: "Orders",
			home: "Home",
			menu: "Menu",
		},
		actions: {
			signIn: "Log in",
			signUp: "Sign up",
			createAccount: "Create account",
			signOut: "Sign out",
		},
	},

	// Promo banner messages
	promoBanner: {
		default: `Welcome to ${BRAND.name}! ${PROMOTIONS.banners.messages[0]}`,
	},
} as const;

// ============================================================================
// SECTION 11: FAQ TEMPLATES
// ============================================================================

export const FAQ_TEMPLATES = {
	// Homepage FAQs
	homepage: [
		{
			question: "What types of mushroom growing supplies do you offer?",
			answer:
				"We offer a complete range of mushroom cultivation supplies including growing kits, sterilized substrates, liquid cultures, spawn, cultivation equipment, and educational resources for both beginners and commercial growers.",
		},
		{
			question: "Do you offer free shipping?",
			answer:
				"Yes! We offer free shipping on all orders over $75 within the United States. Orders are typically processed within 1-2 business days.",
		},
		{
			question: "What's your return policy?",
			answer:
				"We offer a 30-day satisfaction guarantee on all products. If you're not completely satisfied with your purchase, contact our support team for a full refund or replacement.",
		},
		{
			question: "How do I get started with mushroom cultivation?",
			answer:
				"We recommend starting with one of our beginner-friendly growing kits that include everything you need. We also provide free growing guides and expert support to help ensure your success.",
		},
		{
			question: "Do you ship internationally?",
			answer:
				"Currently we ship within the United States. For international orders, please contact our support team for special arrangements.",
		},
	],

	// Product page FAQs (generic)
	product: [
		{
			question: "What is included with this product?",
			answer:
				"This product includes everything you need for successful mushroom cultivation. Check the product details for specific contents.",
		},
		{
			question: "How long does shipping take?",
			answer:
				"Orders typically ship within 1-2 business days. Standard shipping takes 3-5 business days. We offer free shipping on orders over $75.",
		},
		{
			question: "What is your return policy?",
			answer:
				"We offer a 30-day satisfaction guarantee. If you're not completely satisfied with your purchase, contact us for a full refund or replacement.",
		},
		{
			question: "Is this product suitable for beginners?",
			answer:
				"Yes! All our products come with detailed instructions and we provide free expert support to help ensure your success.",
		},
	],

	// Collection-specific FAQs
	collections: {
		substrate: [
			{
				question: "What kind of mushrooms can I grow with this substrate?",
				answer:
					"Our substrates are formulated to support a wide variety of gourmet and medicinal mushrooms, including oyster, shiitake, lion's mane, and reishi varieties. Check each product description for specific compatibility details.",
			},
			{
				question: "How should I store the substrate before use?",
				answer:
					"Store your substrate in a cool, dry place away from direct sunlight. Unopened substrate bags can typically be stored for 3-6 months when kept in proper conditions.",
			},
			{
				question: "Do I need to pasteurize or sterilize the substrate before use?",
				answer:
					"Our substrates come fully pasteurized and ready to use. Simply open in a clean environment and proceed with inoculation according to the included instructions.",
			},
		],
		kit: [
			{
				question: "Are your growing kits suitable for beginners?",
				answer:
					"Yes! Our kits are designed with beginners in mind and include detailed step-by-step instructions. They require minimal setup and maintenance, making them perfect for first-time growers.",
			},
			{
				question: "How long until I see mushrooms with a growing kit?",
				answer:
					"Most of our kits will produce their first flush of mushrooms within 10-14 days after setting up, depending on environmental conditions and the mushroom variety.",
			},
			{
				question: "What temperature and humidity levels are required?",
				answer:
					"Most mushroom varieties prefer temperatures between 65-75°F (18-24°C) and humidity levels of 80-95%. Each kit includes specific instructions for the particular mushroom variety.",
			},
		],
		equipment: [
			{
				question: "What equipment is essential for mushroom cultivation?",
				answer:
					"Essential equipment includes grow bags or containers, a spray bottle for misting, thermometer/hygrometer for monitoring conditions, and proper lighting. Advanced growers may also use pressure cookers, flow hoods, and humidity controllers.",
			},
			{
				question: "Is this equipment suitable for commercial growing?",
				answer:
					"Yes! Our equipment is suitable for both home hobbyists and commercial operations. We offer bulk pricing on larger orders - contact our sales team for volume discounts.",
			},
			{
				question: "What warranty or guarantee comes with the equipment?",
				answer:
					"All equipment comes with our standard 1-year warranty against manufacturing defects. We also offer a 30-day satisfaction guarantee on all purchases.",
			},
		],
		spawn: [
			{
				question: "How long does spawn stay viable?",
				answer:
					"When stored properly in a refrigerator (35-40°F), our spawn remains viable for 3-6 months. For best results, use spawn as soon as possible after receiving.",
			},
			{
				question: "What is the inoculation rate for spawn?",
				answer:
					"We recommend a 5-10% spawn-to-substrate ratio by weight for optimal colonization. Higher rates lead to faster colonization but use more spawn.",
			},
			{
				question: "Can I use this spawn with any substrate?",
				answer:
					"Our spawn works with a variety of substrates including hardwood sawdust, straw, and supplemented blends. Check the product description for specific substrate compatibility.",
			},
		],
		supplies: [
			{
				question: "Are these supplies food-safe and non-toxic?",
				answer:
					"Yes! All our growing supplies are food-safe and specifically formulated for edible mushroom cultivation. They contain no harmful chemicals or additives.",
			},
			{
				question: "Do you offer bulk pricing on supplies?",
				answer:
					"Absolutely! Orders over $150 receive automatic volume discounts, and we offer special wholesale pricing for commercial operations. Contact us for custom quotes on large orders.",
			},
			{
				question: "What's the shelf life of your supplies?",
				answer:
					"When stored properly in a cool, dry location, most supplies remain effective for 6-12 months. Specific shelf life varies by product - check individual product pages for details.",
			},
		],
	},

	// General product FAQs
	general: {
		bulkOrders: {
			question: "Do you offer bulk pricing or volume discounts?",
			answer:
				"Yes! We offer volume discounts on many of our products. Orders over $75 qualify for free shipping, and orders over $150 receive a 5% discount automatically applied at checkout.",
		},
	},
} as const;

// ============================================================================
// SECTION 12: IMAGES & ASSETS
// ============================================================================

export const ASSETS = {
	// Logo & branding
	logo: "/logo.png",
	logoInverted: "/logo.png", // Same file, inverted via CSS
	favicon: "/favicon.ico",

	// Hero/Banner images
	banners: {
		hero1: "/banner.png",
		hero2: "/banner2.png",
		hero3: "/banner3.png",
		default: "/mycelium-roots.png",
	},

	// Background/decorative images
	backgrounds: {
		mycelium1: "/mycelium.png",
		mycelium2: "/mycelium1.png",
		mycelium3: "/mycelium2.png",
		mycelium4: "/mycelium3.png",
		mycelium5: "/mycelium4.png",
		mycelium6: "/mycelium5.png",
		mycelium7: "/mycelium6.png",
		myceliumRoots: "/mycelium-roots.png",
		myceliumRoots1: "/mycelium-roots1.png",
	},

	// Category images
	categories: {
		food: "/categories/food.png",
		liquidCulture: "/categories/liquid-culture.png",
		spawn: "/categories/spawn.png",
		substrate: "/categories/substrate.png",
		supplements: "/categories/suppliments.png",
		subscriptionBox: "/categories/subscription-box.png",
		tea: "/categories/tea.png",
		tinctures: "/categories/tinchers.png",
	},

	// Fallback/placeholder images
	placeholders: {
		product: "/placeholder-product.png",
		general: "/placeholder.svg",
		collection: "/mycelium-roots.png",
	},

	// Icons & misc
	misc: {
		usaFlag: "/usa.png",
	},

	// OG/Social images
	social: {
		ogImageDefault: "/og-image.jpg",
		twitterImageDefault: "/twitter-image.jpg",
	},
} as const;

// ============================================================================
// SECTION 13: NAVIGATION STRUCTURE
// ============================================================================

export const NAVIGATION = {
	// Shopify menu handles
	shopifyMenus: {
		main: "main-menu",
		footer: "footer",
		mobile: "mobile-menu",
	},

	// Footer navigation sections
	footer: {
		sections: [
			{
				id: "main",
				title: "Zugzology",
				links: [
					{ label: "About Us", href: "/about" },
					{ label: "Careers", href: "/careers" },
					{ label: "Wholesale Program", href: "/wholesale" },
					{ label: "News & Updates", href: "/blogs/news" },
					{ label: "Partner Program", href: "/partners" },
					{ label: "Affiliate Program", href: "/affiliate" },
					{ label: "Legal", href: "/legal" },
					{ label: "Service Status", href: "/status" },
				],
			},
			{
				id: "support",
				title: "Support",
				links: [
					{ label: "Customer Support", href: "/help/support" },
					{ label: "Help Center", href: "/help/center" },
					{ label: "Shipping Information", href: "/shipping" },
					{ label: "Returns & Exchanges", href: "/returns" },
					{ label: "FAQ", href: "/faq" },
				],
			},
			{
				id: "resources",
				title: "Resources",
				links: [
					{ label: "Growing Guides", href: "/guides" },
					{ label: "Blog", href: "/blog" },
					{ label: "Video Tutorials", href: "/videos" },
				],
			},
			{
				id: "products",
				title: "Products",
				links: [
					{ label: "All Products", href: "/collections/all" },
					{ label: "Grow Bags", href: "/collections/grow-bags" },
					{ label: "Substrates", href: "/collections/substrates" },
					{ label: "Equipment", href: "/collections/equipment" },
					{ label: "Supplies", href: "/collections/supplies" },
					{ label: "Bulk Orders", href: "/collections/bulk" },
				],
			},
			{
				id: "solutions",
				title: "Solutions",
				links: [
					{ label: "Wholesale Program", href: "/wholesale" },
					{ label: "Custom Orders", href: "/custom" },
					{ label: "Business Solutions", href: "/business" },
				],
			},
		],
		legal: [
			{ label: "Terms of Service", href: "/terms" },
			{ label: "Privacy Policy", href: "/privacy" },
			{ label: "Sitemap", href: "/sitemap" },
			{ label: "Cookie Preferences", href: "/cookies" },
		],
		region: {
			default: "USA",
			icon: "/usa.png",
		},
	},
} as const;

// ============================================================================
// SECTION 14: SCHEMA.ORG STRUCTURED DATA DEFAULTS
// ============================================================================

export const SCHEMA_DEFAULTS = {
	// Organization schema
	organization: {
		type: "Organization" as const,
		priceRange: "$$",
		areaServed: ["US", "CA"],
		availableLanguages: ["en", "es"],
		makesOfferText: "Free Shipping",
		makesOfferDescription: "Free shipping on orders over $75",
	},

	// Store/LocalBusiness schema
	store: {
		types: ["Store", "LocalBusiness"] as const,
		paymentMethods: ["Cash", "Credit Card", "PayPal", "Shop Pay", "Apple Pay", "Google Pay", "Cryptocurrency"],
		currenciesAccepted: "USD",
		priceRange: "$$",
	},

	// Product schema defaults
	product: {
		condition: "https://schema.org/NewCondition",
		availability: {
			inStock: "https://schema.org/InStock",
			outOfStock: "https://schema.org/OutOfStock",
			preOrder: "https://schema.org/PreOrder",
		},
		returnPolicy: {
			category: "https://schema.org/MerchantReturnFiniteReturnWindow",
			merchantReturnDays: 30,
			returnMethod: "https://schema.org/ReturnByMail",
			returnFees: "https://schema.org/FreeReturn",
		},
		shipping: {
			handlingTime: { min: 0, max: 1, unit: "DAY" },
			transitTime: { min: 2, max: 5, unit: "DAY" },
			freeShipping: true,
		},
		warrantyDuration: { value: 1, unit: "ANN" },
	},

	// Catalog schema (for Store schema)
	catalog: {
		name: "Product Catalog",
		categories: [
			{ name: "Mushroom Growing Kits", category: "Growing Kits" },
			{ name: "Cultivation Supplies", category: "Supplies" },
			{ name: "Substrates & Media", category: "Substrates" },
			{ name: "Equipment & Tools", category: "Equipment" },
		],
	},

	// Review defaults (when no reviews exist)
	reviews: {
		defaultRating: 4.8,
		defaultCount: 75,
		bestRating: 5,
		worstRating: 1,
	},
} as const;

// ============================================================================
// SECTION 15: UI/UX SETTINGS
// ============================================================================

export const UI_SETTINGS = {
	// Product grid settings
	productGrid: {
		itemsPerPage: 24,
		itemsPerPageOptions: [12, 24, 48, 96],
		defaultView: "grid" as "grid" | "list",
		defaultSort: "featured" as const,
	},

	// Price ranges for filters
	priceRanges: [
		{ label: "Under $25", min: 0, max: 25 },
		{ label: "$25 to $50", min: 25, max: 50 },
		{ label: "$50 to $100", min: 50, max: 100 },
		{ label: "$100 to $200", min: 100, max: 200 },
		{ label: "Over $200", min: 200, max: 999_999 },
	],

	// Pagination
	pagination: {
		postsPerPage: 12,
		productsPerPage: 24,
		maxPaginationButtons: 5,
	},

	// Image sizes (for Next.js Image component)
	imageSizes: {
		thumbnail: "(max-width: 768px) 100px, 150px",
		productCard: "(max-width: 768px) 100vw, 400px",
		productDetail: "(max-width: 768px) 100vw, 50vw",
		hero: "(max-width: 768px) 100vw, 40vw",
		collection: "(max-width: 768px) 100vw, 800px",
	},

	// Animation settings
	animations: {
		pageTransition: 300,
		hoverScale: 1.05,
		fadeInDuration: 200,
	},
} as const;

// ============================================================================
// SECTION 16: ANALYTICS & TRACKING
// ============================================================================

export const ANALYTICS = {
	// Google Analytics
	ga: {
		measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
		enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
	},

	// Google Tag Manager
	gtm: {
		containerId: process.env.NEXT_PUBLIC_GTM_ID,
		enabled: !!process.env.NEXT_PUBLIC_GTM_ID,
	},

	// Facebook Pixel
	facebook: {
		pixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
		enabled: !!process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
	},

	// Event tracking
	events: {
		trackPageViews: true,
		trackProductViews: true,
		trackAddToCart: true,
		trackPurchases: true,
		trackSearches: true,
	},
} as const;

// ============================================================================
// SECTION 17: OPTICAL ALIGNMENT CONFIGURATION
// ============================================================================

/**
 * Optical alignment settings for UI elements
 * These values ensure visual balance based on human perception
 * rather than pure mathematical alignment
 */
export const OPTICAL_ALIGNMENT = {
	// Icon alignment adjustments by shape
	icons: {
		triangular: {
			// Arrows, carets, play buttons appear left-heavy
			translateX: "2px",
			translateY: "0px",
			description: "Right shift for triangular icons (arrows, carets)",
		},
		circular: {
			// Circles appear high in their containers
			translateX: "0px",
			translateY: "1px",
			description: "Down shift for circular icons (CheckCircle, Clock)",
		},
		bottomHeavy: {
			// Hearts, anchors appear bottom-heavy
			translateX: "0px",
			translateY: "-1px",
			description: "Up shift for bottom-heavy icons (Heart)",
		},
		leftHeavy: {
			// Trucks, some asymmetric icons
			translateX: "2px",
			translateY: "0px",
			description: "Right shift for left-heavy icons (Truck, ShoppingCart)",
		},
		star: {
			// Stars need special handling
			translateX: "0px",
			translateY: "0.5px",
			description: "Slight down shift for star icons",
		},
	},

	// Typography adjustments
	typography: {
		uppercase: {
			// Uppercase appears larger than lowercase at same size
			sizeMultiplier: 0.96, // Reduce to 96% of original
			letterSpacing: "0.05em", // Increase tracking
			description: "Optical size and spacing for uppercase text",
		},
		currency: {
			// Currency symbols should be smaller and raised
			sizeMultiplier: 0.875, // 87.5% of base
			verticalAlign: "0.125em",
			description: "Optical sizing for currency symbols",
		},
		decimals: {
			// Decimal values should be smaller
			sizeMultiplier: 0.8, // 80% of base
			verticalAlign: "0.0625em",
			description: "Optical sizing for price decimals",
		},
	},

	// Spacing adjustments
	spacing: {
		iconTextGap: {
			default: "0.5rem", // 8px
			triangular: "0.4375rem", // 7px on pointed side
			circular: "0.5rem",
			description: "Gap between icons and text for optical balance",
		},
		buttonPadding: {
			textOnly: { x: "1rem", y: "0.5rem" },
			withIcon: { x: "0.75rem", y: "0.5rem" },
			iconOnly: "0.5rem",
			description: "Optical padding for button contexts",
		},
		containerPadding: {
			text: { x: "1rem", y: "0.5rem" },
			icon: "0.5rem",
			mixed: { x: "0.75rem", y: "0.5rem" },
			description: "Optical padding for different content types",
		},
	},

	// Form element adjustments
	forms: {
		inputIconPosition: {
			// Icons in form inputs need slight visual centering
			verticalAdjustment: "-1px",
			horizontalPadding: "0.75rem",
			description: "Optical centering for form input icons",
		},
	},

	// Loading spinner adjustments
	loaders: {
		inButton: {
			translateY: "1px",
			description: "Optical centering for spinners in buttons",
		},
	},

	// Navigation adjustments
	navigation: {
		iconTextAlignment: {
			gap: "0.5rem",
			padding: { x: "0.75rem", y: "0.5rem" },
			description: "Optical spacing for nav items with icons",
		},
	},

	// Badge adjustments
	badges: {
		textPadding: { x: "0.5rem", y: "0.125rem" },
		iconBadgePadding: "0.25rem",
		minHeight: "1.25rem",
		description: "Optical padding for badge components",
	},

	// Card adjustments
	cards: {
		imagePaddingCompensation: "2px", // Rounded corners affect perceived size
		contentPadding: { x: "1rem", y: "0.75rem" },
		description: "Optical adjustments for card components",
	},

	// Enabled/disabled flags
	enabled: {
		icons: true,
		typography: true,
		spacing: true,
		forms: true,
		loaders: true,
		navigation: true,
		badges: true,
		cards: true,
	},
} as const;

/**
 * Get optical alignment value for a specific use case
 */
export function getOpticalAlignmentValue(
	category: keyof typeof OPTICAL_ALIGNMENT,
	subcategory: string,
	property: string
): string | number | undefined {
	const cat = OPTICAL_ALIGNMENT[category as keyof typeof OPTICAL_ALIGNMENT];
	if (cat && typeof cat === "object" && subcategory in cat) {
		const subcat = (cat as any)[subcategory];
		if (subcat && typeof subcat === "object" && property in subcat) {
			return (subcat as any)[property];
		}
	}
	return;
}

/**
 * Check if optical alignment is enabled for a category
 */
export function isOpticalAlignmentEnabled(category: keyof typeof OPTICAL_ALIGNMENT.enabled): boolean {
	return OPTICAL_ALIGNMENT.enabled[category];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the full configuration object
 */
export function getStoreConfig() {
	return {
		brand: BRAND,
		business: BUSINESS,
		contact: CONTACT,
		social: SOCIAL,
		policies: POLICIES,
		features: STORE_FEATURES,
		industry: INDUSTRY,
		seo: SEO,
		content: CONTENT,
		faqs: FAQ_TEMPLATES,
		assets: ASSETS,
		navigation: NAVIGATION,
		schema: SCHEMA_DEFAULTS,
		ui: UI_SETTINGS,
		promotions: PROMOTIONS,
		analytics: ANALYTICS,
		opticalAlignment: OPTICAL_ALIGNMENT,
	};
}

/**
 * Get a specific config value with type safety
 */
export function getConfigValue<T extends keyof ReturnType<typeof getStoreConfig>>(
	section: T
): ReturnType<typeof getStoreConfig>[T] {
	return getStoreConfig()[section];
}

/**
 * Get brand name (most commonly used)
 */
export function getBrandName(): string {
	return BRAND.name;
}

/**
 * Get site URL
 */
export function getSiteUrl(): string {
	return BRAND.url;
}

/**
 * Get domain
 */
export function getDomain(): string {
	return BRAND.domain;
}

/**
 * Replace template variables in text
 * Example: "Browse our {collection} collection" -> "Browse our Kits collection"
 */
export function replaceTemplateVars(text: string, vars: Record<string, string>): string {
	let result = text;
	for (const [key, value] of Object.entries(vars)) {
		result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
	}
	return result;
}

/**
 * Get industry-specific terminology
 */
export function getTerminology() {
	return INDUSTRY.terminology;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featureId: string): boolean {
	return STORE_FEATURES.some((f) => f.id === featureId);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type StoreConfig = ReturnType<typeof getStoreConfig>;
export type ConfigSection = keyof StoreConfig;

// Default export
export default getStoreConfig;
