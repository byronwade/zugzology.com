"use client";

import { Link } from "@/components/ui/link";
import { Facebook, Twitter, Youtube, Instagram, Linkedin, Globe } from "lucide-react";
import Image from "next/image";

export function Footer() {
	return (
		<footer className="relative flex flex-col font-sans bg-black text-white" data-component-name="footer" data-viewable-component="true">
			<section className="container mx-auto flex flex-col gap-16 py-16 my-0 sm:justify-start sm:pb-16 md:flex-row md:flex-nowrap md:justify-between md:pb-20 md:py-20 md:gap-20 xl:w-full bg-black text-white" data-section-name="footer" data-section-index="1" data-component-name="footer" data-viewable-component="true">
				{/* Logo Section */}
				<div className="min-w-[100px] flex items-start">
					<Link href="/" className="text-white hover:text-white/80">
						<div className="relative w-20 h-20">
							<Image src="/logo.png" alt="Zugzology Logo" fill className="object-contain invert" sizes="24px" />
						</div>
					</Link>
				</div>

				{/* Navigation Grid */}
				<div className="md:block md:justify-end">
					<div className="flex flex-col flex-wrap gap-12 gap-x-4 md:gap-20 md:gap-x-16 sm:grid sm:max-h-fit sm:grid-cols-3 lg:grid-cols-4 max-h-[92rem] sm:max-h-[75rem]">
						{/* Shopify Section */}
						<div className="w-[calc(50%_-_1rem)] sm:w-fit" data-component-name="shopify">
							<h2 className="text-base font-bold text-white">Shopify</h2>
							<ul className="mt-4 md:mt-6">
								<li>
									<Link href="/about" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="about">
										About
									</Link>
								</li>
								<li>
									<Link href="/careers" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="careers">
										Careers
									</Link>
								</li>
								<li>
									<a href="https://shopifyinvestors.com/home/default.aspx" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="investors">
										Investors
									</a>
								</li>
								<li>
									<a href="https://www.shopify.com/news" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="press-and-media">
										Press and Media
									</a>
								</li>
								<li>
									<Link href="/partners" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="partners">
										Partners
									</Link>
								</li>
								<li>
									<Link href="/affiliates" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="affiliates">
										Affiliates
									</Link>
								</li>
								<li>
									<Link href="/legal" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="legal">
										Legal
									</Link>
								</li>
								<li>
									<a href="https://www.shopifystatus.com/" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="service-status">
										Service Status
									</a>
								</li>
							</ul>
						</div>

						{/* Support Section */}
						<div className="w-[calc(50%_-_1rem)] sm:w-fit" data-component-name="support">
							<h2 className="text-base font-bold text-white">Support</h2>
							<ul className="mt-4 md:mt-6">
								<li>
									<a href="https://help.shopify.com/en/questions" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="merchant-support">
										Merchant Support
									</a>
								</li>
								<li>
									<a href="https://help.shopify.com/en/" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="help-center">
										Help Center
									</a>
								</li>
								<li>
									<a href="https://www.shopify.com/partners/directory" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="hire-a-partner">
										Hire a Partner
									</a>
								</li>
								<li>
									<a href="https://academy.shopify.com" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="shopify-academy">
										Shopify Academy
									</a>
								</li>
								<li>
									<a href="https://community.shopify.com/c/Shopify-Community/ct-p/en" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="shopify-community">
										Shopify Community
									</a>
								</li>
							</ul>
						</div>

						{/* Developers Section */}
						<div className="w-[calc(50%_-_1rem)] sm:w-fit" data-component-name="developers">
							<h2 className="text-base font-bold text-white">Developers</h2>
							<ul className="mt-4 md:mt-6">
								<li>
									<a href="https://shopify.dev" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="shopify-dev">
										Shopify.dev
									</a>
								</li>
								<li>
									<a href="https://shopify.dev/api" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="api-documentation">
										API Documentation
									</a>
								</li>
								<li>
									<a href="https://devdegree.ca" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="dev-degree">
										Dev Degree
									</a>
								</li>
							</ul>
						</div>

						{/* Products Section */}
						<div className="w-[calc(50%_-_1rem)] sm:w-fit" data-component-name="products">
							<h2 className="text-base font-bold text-white">Products</h2>
							<ul className="mt-4 md:mt-6">
								<li>
									<a href="https://shop.app" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="shop">
										Shop
									</a>
								</li>
								<li>
									<Link href="/shop-pay" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="shop-pay">
										Shop Pay
									</Link>
								</li>
								<li>
									<Link href="/plus" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="shopify-plus">
										Shopify Plus
									</Link>
								</li>
								<li>
									<Link href="/fulfillment" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="shopify-fulfillment-network">
										Shopify Fulfillment Network
									</Link>
								</li>
								<li>
									<a href="https://www.linkpop.com/" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="linkpop">
										Linkpop
									</a>
								</li>
								<li>
									<Link href="/enterprise" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="shopify-for-enterprise">
										Shopify for Enterprise
									</Link>
								</li>
							</ul>
						</div>

						{/* Global Impact Section */}
						<div className="w-[calc(50%_-_1rem)] sm:w-fit" data-component-name="global-impact">
							<h2 className="text-base font-bold text-white">Global Impact</h2>
							<ul className="mt-4 md:mt-6">
								<li>
									<Link href="/climate" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="sustainability">
										Sustainability
									</Link>
								</li>
								<li>
									<Link href="/about/social-impact" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="social-impact">
										Social Impact
									</Link>
								</li>
								<li>
									<a href="https://www.shopify.com/1mbb" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="build-black">
										Build Black
									</a>
								</li>
								<li>
									<a href="https://buildnative.shop" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="build-native">
										Build Native
									</a>
								</li>
								<li>
									<Link href="/plus/commerce-trends" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="research">
										Research
									</Link>
								</li>
							</ul>
						</div>

						{/* Solutions Section */}
						<div className="w-[calc(50%_-_1rem)] sm:w-fit" data-component-name="solutions">
							<h2 className="text-base font-bold text-white">Solutions</h2>
							<ul className="mt-4 md:mt-6">
								<li>
									<Link href="/online" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="online-store-builder">
										Online Store Builder
									</Link>
								</li>
								<li>
									<Link href="/website/builder" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="website-builder">
										Website Builder
									</Link>
								</li>
								<li>
									<Link href="/tour/ecommerce-website" className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-[#E0E0E0] hover:text-white" data-component-name="ecommerce-website">
										Ecommerce Website
									</Link>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Bottom Section */}
			<section className="border-t my-0 container mx-auto max-sm:mx-0 xl:w-full border-white border-opacity-20 bg-inherit" data-section-name="footer" data-section-index="2" data-component-name="footer" data-viewable-component="true">
				<div className="flex flex-col items-center justify-center gap-4 py-8 sm:items-start sm:gap-8 lg:flex-row lg:justify-between lg:gap-10 bg-black text-white">
					<div className="mt-1 flex w-full flex-col items-center justify-center sm:flex-row sm:items-start sm:justify-start sm:gap-8 lg:gap-14">
						{/* Region Selector */}
						<div className="relative hidden sm:block" data-click-outside="dismiss" data-component-name="regions">
							<button aria-controls="regionSelector" aria-expanded="false" aria-haspopup="true" className="bg-transparent mx-auto md:inline-block py-3 text-[#E0E0E0] hover:text-white" type="button" data-component-name="region-selector-open" tabIndex={0} aria-label="Region Navigation. Current: USA">
								<span className="inline-flex items-center">
									<Globe className="mr-1 h-4 w-4" />
									<span className="break-keep">USA</span>
									<svg viewBox="0 0 10 5" aria-hidden="true" focusable="false" className="ml-2 h-3 w-3 fill-white">
										<path d="m0 0 5 5 5-5H0z"></path>
									</svg>
								</span>
							</button>
						</div>

						{/* Legal Links */}
						<ul className="flex flex-col items-center flex-wrap sm:flex-row sm:items-start gap-x-8 md:gap-x-10">
							<li className="font-semi-medium mt-2 block py-3 sm:mt-0 text-[#E0E0E0] hover:text-white">
								<Link href="/legal/terms" className="hover:underline" data-component-name="terms-of-service">
									Terms of Service
								</Link>
							</li>
							<li className="font-semi-medium mt-2 block py-3 sm:mt-0 text-[#E0E0E0] hover:text-white">
								<Link href="/legal/privacy" className="hover:underline" data-component-name="privacy-policy">
									Privacy Policy
								</Link>
							</li>
							<li className="font-semi-medium mt-2 block py-3 sm:mt-0 text-[#E0E0E0] hover:text-white">
								<Link href="/sitemap" className="hover:underline" data-component-name="sitemap">
									Sitemap
								</Link>
							</li>
							<li className="font-semi-medium mt-2 block py-3 sm:mt-0 text-[#E0E0E0] hover:text-white">
								<a href="https://privacy.shopify.com/en" className="hover:underline" data-component-name="privacy-choices">
									Privacy Choices
								</a>
							</li>
						</ul>
					</div>

					{/* Social Media Links */}
					<ul className="flex gap-4 md:gap-6" data-component-name="social">
						<li>
							<a href="https://www.facebook.com/shopify" rel="me nofollow noopener noreferrer" target="_blank" className="block h-8 w-8 fill-white hover:fill-shade-30" data-component-name="social-facebook" aria-label="External source: Facebook (Opens in a new window)">
								<Facebook className="h-full w-full" />
							</a>
						</li>
						<li>
							<a href="https://twitter.com/shopify" rel="me nofollow noopener noreferrer" target="_blank" className="block h-8 w-8 fill-white hover:fill-shade-30" data-component-name="social-twitter" aria-label="External source: Twitter (Opens in a new window)">
								<Twitter className="h-full w-full" />
							</a>
						</li>
						<li>
							<a href="https://www.youtube.com/user/shopify" rel="me nofollow noopener noreferrer" target="_blank" className="block h-8 w-8 fill-white hover:fill-shade-30" data-component-name="social-youtube" aria-label="External source: YouTube (Opens in a new window)">
								<Youtube className="h-full w-full" />
							</a>
						</li>
						<li>
							<a href="https://www.instagram.com/shopify/" rel="me nofollow noopener noreferrer" target="_blank" className="block h-8 w-8 fill-white hover:fill-shade-30" data-component-name="social-instagram" aria-label="External source: Instagram (Opens in a new window)">
								<Instagram className="h-full w-full" />
							</a>
						</li>
						<li>
							<a href="https://www.linkedin.com/company/shopify" rel="me nofollow noopener noreferrer" target="_blank" className="block h-8 w-8 fill-white hover:fill-shade-30" data-component-name="social-linkedin" aria-label="External source: LinkedIn (Opens in a new window)">
								<Linkedin className="h-full w-full" />
							</a>
						</li>
					</ul>
				</div>
			</section>
		</footer>
	);
}
