import { ArrowRight, CreditCard, Mail, MessageSquare, Phone, RotateCcw, ShoppingBag, Truck } from "lucide-react";
import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { UniversalBreadcrumb } from "@/components/layout/universal-breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	getEnhancedBreadcrumbSchema,
	getEnhancedFAQSchema,
	getEnhancedOrganizationSchema,
} from "@/lib/seo/enhanced-jsonld";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/seo-utils";

export const metadata: Metadata = generateSEOMetadata({
	title: "Help Center - Customer Support & FAQ",
	description:
		"Get expert help with your mushroom cultivation orders, shipping, returns, and growing questions. Find answers to FAQs or contact our dedicated support team for personalized assistance.",
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
		"order assistance",
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
			answer:
				"You can track your order by logging into your account and visiting the 'My Orders' section. There, you'll find real-time updates on your package's location and estimated delivery date.",
		},
		{
			question: "What is your return policy?",
			answer:
				"We offer a 30-day return policy for most items. Products must be in their original condition with tags attached. Please visit our Returns page for more detailed information and to initiate a return.",
		},
		{
			question: "How do I change or cancel my order?",
			answer:
				"You can modify or cancel your order within 1 hour of placing it. Go to 'My Orders' in your account and select the order you wish to change. If it's been over an hour, please contact our customer service team for assistance.",
		},
		{
			question: "What payment methods do you accept?",
			answer:
				"We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay. For certain regions, we also offer payment options like Klarna and Afterpay.",
		},
		{
			question: "Do you ship internationally?",
			answer:
				"Yes, we ship to over 100 countries worldwide. Shipping costs and delivery times vary depending on the destination. You can see exact shipping costs at checkout after entering your address.",
		},
		{
			question: "How can I contact customer service?",
			answer:
				"Our customer service team is available via email, phone, or live chat. You can find our contact information at the bottom of this page. Our hours of operation are Monday to Friday, 9am to 6pm EST.",
		},
		{
			question: "What should I do if I receive a damaged item?",
			answer:
				"If you receive a damaged item, please contact our customer service team immediately. Take photos of the damaged product and packaging, and we'll guide you through the return and replacement process.",
		},
		{
			question: "How do I apply a coupon code to my order?",
			answer:
				"You can apply a coupon code during the checkout process. Look for the 'Promo Code' or 'Coupon Code' field, enter your code, and click 'Apply'. The discount will be reflected in your order total.",
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
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema),
				}}
				type="application/ld+json"
			/>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(faqSchema),
				}}
				type="application/ld+json"
			/>
			<script
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
				type="application/ld+json"
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
				{/* Breadcrumb Navigation */}
				<UniversalBreadcrumb items={breadcrumbs} />

				<main className="container mx-auto space-y-16 px-4 py-12">
					{/* Hero Section */}
					<section className="mx-auto max-w-3xl space-y-8 text-center">
						<h1 className="font-bold text-4xl tracking-tight sm:text-5xl md:text-6xl">How can we help you today?</h1>
						<p className="mx-auto max-w-2xl text-lg text-muted-foreground">
							Find answers to common questions, track your orders, or get in touch with our support team.
						</p>
					</section>

					{/* Quick Actions */}
					<section className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
						{[
							{
								icon: ShoppingBag,
								title: "Orders",
								description: "Track or manage your orders",
								href: "/account/orders",
							},
							{ icon: Truck, title: "Shipping", description: "Delivery options and tracking", href: "/shipping" },
							{ icon: CreditCard, title: "Payment", description: "Payment methods and issues", href: "/payment" },
							{ icon: RotateCcw, title: "Returns", description: "Return policy and process", href: "/returns" },
						].map((item, index) => (
							<Card
								className="group relative overflow-hidden border border-foreground/10 transition-all duration-300 hover:border-foreground/20 hover:shadow-lg"
								key={index}
							>
								<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
								<CardHeader className="relative text-center">
									<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-transform duration-300 group-hover:scale-110">
										<item.icon className="h-6 w-6 text-primary" />
									</div>
									<CardTitle className="text-xl transition-colors duration-300 group-hover:text-primary">
										{item.title}
									</CardTitle>
								</CardHeader>
								<CardContent className="text-center">
									<CardDescription className="text-sm">{item.description}</CardDescription>
								</CardContent>
								<CardFooter className="justify-center pb-6">
									<Button
										className="transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary"
										variant="ghost"
									>
										Learn More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
									</Button>
								</CardFooter>
							</Card>
						))}
					</section>

					<div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
						{/* FAQ Section */}
						<section className="space-y-6">
							<div className="space-y-2">
								<h2 className="font-semibold text-3xl">Frequently Asked Questions</h2>
								<p className="text-muted-foreground">Find quick answers to common questions about our services.</p>
							</div>
							<Accordion className="w-full" type="single">
								{faqData.map((faq, index) => (
									<AccordionItem key={index} value={`item-${index}`}>
										<AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
										<AccordionContent>{faq.answer}</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</section>

						{/* Contact Section */}
						<section className="space-y-6 lg:sticky lg:top-8 lg:self-start">
							<div className="space-y-2">
								<h2 className="font-semibold text-3xl">Contact Us</h2>
								<p className="text-muted-foreground">
									Can&apos;t find what you&apos;re looking for? Get in touch with our team.
								</p>
							</div>
							<Card className="border border-foreground/10 shadow-lg">
								<CardHeader className="space-y-1 pb-4">
									<CardTitle className="text-2xl">Get in Touch</CardTitle>
									<CardDescription>We typically respond within 1-2 business days</CardDescription>
								</CardHeader>
								<CardContent className="space-y-8">
									{/* Contact Info */}
									<div className="grid gap-4 rounded-lg bg-muted/50 p-4">
										<div className="flex items-center gap-3 text-sm">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
												<Mail className="h-4 w-4 text-primary" />
											</div>
											<span>support@zugzology.com</span>
										</div>
										<div className="flex items-center gap-3 text-sm">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
												<Phone className="h-4 w-4 text-primary" />
											</div>
											<span>+1 (800) 123-4567</span>
										</div>
										<div className="flex items-center gap-3 text-sm">
											<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
												<MessageSquare className="h-4 w-4 text-primary" />
											</div>
											<span>Live Chat (9am - 6pm EST)</span>
										</div>
									</div>

									{/* Contact Form */}
									<form className="space-y-4">
										<div className="grid gap-4 sm:grid-cols-2">
											<Input className="bg-muted/50" placeholder="First Name" />
											<Input className="bg-muted/50" placeholder="Last Name" />
										</div>
										<Input className="bg-muted/50" placeholder="Your Email" type="email" />
										<Input className="bg-muted/50" placeholder="Order Number (if applicable)" />
										<select className="w-full rounded-md border border-input bg-muted/50 p-2 focus:ring-1 focus:ring-primary">
											<option>Select a topic</option>
											<option>Order Status</option>
											<option>Returns & Exchanges</option>
											<option>Payment Issues</option>
											<option>Product Information</option>
											<option>Other</option>
										</select>
										<Textarea className="min-h-[150px] bg-muted/50" placeholder="Your Message" />
										<Button className="w-full" type="submit">
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
				<div className="mx-auto max-w-2xl p-4">
					<div className="animate-pulse space-y-6">
						<div className="h-8 w-48 rounded bg-muted" />
						<div className="space-y-4">
							<div className="h-10 rounded bg-muted" />
							<div className="h-32 rounded bg-muted" />
							<div className="h-10 w-32 rounded bg-muted" />
						</div>
					</div>
				</div>
			}
		>
			<HelpContent />
		</Suspense>
	);
}
