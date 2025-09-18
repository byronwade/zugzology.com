import { Suspense } from "react";
import { Metadata } from "next";
import { Mail, Phone, ShoppingBag, Truck, CreditCard, RotateCcw, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";
import { getEnhancedBreadcrumbSchema, getEnhancedFAQSchema, getEnhancedOrganizationSchema } from "@/lib/seo/enhanced-jsonld";
import Script from "next/script";
import { Link } from '@/components/ui/link';

export const metadata: Metadata = generateSEOMetadata({
	title: "Help Center - Customer Support & FAQ",
	description: "Get expert help with your mushroom cultivation orders, shipping, returns, and growing questions. Find answers to FAQs or contact our dedicated support team for personalized assistance.",
	keywords: [
		"customer support",
		"help center",
		"FAQ",
		"order tracking",
		"shipping information",
		"returns policy",
		"contact support",
		"mushroom growing help",
		"cultivation support",
		"order assistance"
	],
	url: "/help",
	openGraph: {
		type: "website",
	},
});

function HelpContent() {
	// FAQ data for structured data
	const faqData = [
		{
			question: "How can I track my order?",
			answer: "You can track your order by logging into your account and visiting the 'My Orders' section. There, you'll find real-time updates on your package's location and estimated delivery date.",
		},
		{
			question: "What is your return policy?",
			answer: "We offer a 30-day return policy for most items. Products must be in their original condition with tags attached. Please visit our Returns page for more detailed information and to initiate a return.",
		},
		{
			question: "How do I change or cancel my order?",
			answer: "You can modify or cancel your order within 1 hour of placing it. Go to 'My Orders' in your account and select the order you wish to change. If it's been over an hour, please contact our customer service team for assistance.",
		},
		{
			question: "What payment methods do you accept?",
			answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay. For certain regions, we also offer payment options like Klarna and Afterpay.",
		},
		{
			question: "Do you ship internationally?",
			answer: "Yes, we ship to over 100 countries worldwide. Shipping costs and delivery times vary depending on the destination. You can see exact shipping costs at checkout after entering your address.",
		},
		{
			question: "How can I contact customer service?",
			answer: "Our customer service team is available via email, phone, or live chat. You can find our contact information at the bottom of this page. Our hours of operation are Monday to Friday, 9am to 6pm EST.",
		},
		{
			question: "What should I do if I receive a damaged item?",
			answer: "If you receive a damaged item, please contact our customer service team immediately. Take photos of the damaged product and packaging, and we'll guide you through the return and replacement process.",
		},
		{
			question: "How do I apply a coupon code to my order?",
			answer: "You can apply a coupon code during the checkout process. Look for the 'Promo Code' or 'Coupon Code' field, enter your code, and click 'Apply'. The discount will be reflected in your order total.",
		},
	];

	// Generate structured data
	const breadcrumbs = [
		{ name: "Home", url: "/" },
		{ name: "Help Center", url: "/help" },
	];
	
	const breadcrumbSchema = getEnhancedBreadcrumbSchema(breadcrumbs);
	const faqSchema = getEnhancedFAQSchema(faqData);
	const organizationSchema = getEnhancedOrganizationSchema();

	return (
		<>
			{/* JSON-LD Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(faqSchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
			/>
			
			{/* Google Analytics for Help Page */}
			<Script id="help-analytics" strategy="afterInteractive">
				{`
					window.dataLayer = window.dataLayer || [];
					window.dataLayer.push({
						'event': 'page_view',
						'page_type': 'help_center',
						'page_location': window.location.href,
						'content_category': 'customer_support'
					});
				`}
			</Script>
			
			<div className="min-h-screen bg-background">
				<main className="container mx-auto px-4 py-16 space-y-16">
					{/* Breadcrumb Navigation */}
					<nav className="mb-8" aria-label="Breadcrumb">
						<ol className="flex items-center space-x-2 text-sm text-gray-600">
							<li>
								<Link href="/" className="hover:text-gray-900">Home</Link>
							</li>
							<li className="text-gray-400">/</li>
							<li className="text-gray-900 font-medium">Help & Support</li>
						</ol>
					</nav>
				{/* Hero Section */}
				<section className="text-center space-y-8 max-w-3xl mx-auto">
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">How can we help you today?</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">Find answers to common questions, track your orders, or get in touch with our support team.</p>
				</section>

				{/* Quick Actions */}
				<section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
					{[
						{ icon: ShoppingBag, title: "Orders", description: "Track or manage your orders", href: "/account/orders" },
						{ icon: Truck, title: "Shipping", description: "Delivery options and tracking", href: "/shipping" },
						{ icon: CreditCard, title: "Payment", description: "Payment methods and issues", href: "/payment" },
						{ icon: RotateCcw, title: "Returns", description: "Return policy and process", href: "/returns" },
					].map((item, index) => (
						<Card key={index} className="group relative overflow-hidden border border-foreground/10 hover:border-foreground/20 transition-all duration-300 hover:shadow-lg">
							<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							<CardHeader className="text-center relative">
								<div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
									<item.icon className="w-6 h-6 text-primary" />
								</div>
								<CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{item.title}</CardTitle>
							</CardHeader>
							<CardContent className="text-center">
								<CardDescription className="text-sm">{item.description}</CardDescription>
							</CardContent>
							<CardFooter className="justify-center pb-6">
								<Button variant="ghost" className="group-hover:text-primary group-hover:translate-x-1 transition-all duration-300">
									Learn More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
								</Button>
							</CardFooter>
						</Card>
					))}
				</section>

				<div className="grid gap-12 lg:grid-cols-2 max-w-7xl mx-auto">
					{/* FAQ Section */}
					<section className="space-y-6">
						<div className="space-y-2">
							<h2 className="text-3xl font-semibold">Frequently Asked Questions</h2>
							<p className="text-muted-foreground">Find quick answers to common questions about our services.</p>
						</div>
						<Accordion type="single" collapsible className="w-full">
							{faqData.map((faq, index) => (
								<AccordionItem value={`item-${index}`} key={index}>
									<AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
									<AccordionContent>{faq.answer}</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</section>

					{/* Contact Section */}
					<section className="lg:sticky lg:top-8 lg:self-start space-y-6">
						<div className="space-y-2">
							<h2 className="text-3xl font-semibold">Contact Us</h2>
								<p className="text-muted-foreground">Can&apos;t find what you&apos;re looking for? Get in touch with our team.</p>
						</div>
						<Card className="border border-foreground/10 shadow-lg">
							<CardHeader className="space-y-1 pb-4">
								<CardTitle className="text-2xl">Get in Touch</CardTitle>
								<CardDescription>We typically respond within 1-2 business days</CardDescription>
							</CardHeader>
							<CardContent className="space-y-8">
								{/* Contact Info */}
								<div className="grid gap-4 p-4 bg-muted/50 rounded-lg">
									<div className="flex items-center gap-3 text-sm">
										<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
											<Mail className="w-4 h-4 text-primary" />
										</div>
										<span>support@zugzology.com</span>
									</div>
									<div className="flex items-center gap-3 text-sm">
										<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
											<Phone className="w-4 h-4 text-primary" />
										</div>
										<span>+1 (800) 123-4567</span>
									</div>
									<div className="flex items-center gap-3 text-sm">
										<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
											<MessageSquare className="w-4 h-4 text-primary" />
										</div>
										<span>Live Chat (9am - 6pm EST)</span>
									</div>
								</div>

								{/* Contact Form */}
								<form className="space-y-4">
									<div className="grid gap-4 sm:grid-cols-2">
										<Input placeholder="First Name" className="bg-muted/50" />
										<Input placeholder="Last Name" className="bg-muted/50" />
									</div>
									<Input type="email" placeholder="Your Email" className="bg-muted/50" />
									<Input placeholder="Order Number (if applicable)" className="bg-muted/50" />
									<select className="w-full p-2 rounded-md border border-input bg-muted/50 focus:ring-1 focus:ring-primary">
										<option>Select a topic</option>
										<option>Order Status</option>
										<option>Returns & Exchanges</option>
										<option>Payment Issues</option>
										<option>Product Information</option>
										<option>Other</option>
									</select>
									<Textarea placeholder="Your Message" className="min-h-[150px] bg-muted/50" />
									<Button type="submit" className="w-full">
										Send Message
									</Button>
								</form>
							</CardContent>
						</Card>
					</section>
				</div>
			</main>
		</div>
		</>
	);
}

export default function HelpPage() {
	return (
		<Suspense
			fallback={
				<div className="max-w-2xl mx-auto p-4">
					<div className="animate-pulse space-y-6">
						<div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
						<div className="space-y-4">
							<div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded" />
							<div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
							<div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
						</div>
					</div>
				</div>
			}
		>
			<HelpContent />
		</Suspense>
	);
}
