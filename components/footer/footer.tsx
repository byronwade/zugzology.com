"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function Footer() {
	const [openSection, setOpenSection] = useState<string | null>(null);

	const toggleSection = (section: string) => {
		setOpenSection(openSection === section ? null : section);
	};

	return (
		<footer className="footer bg-black text-white" role="contentinfo">
			<div className="container mx-auto px-4">
				<div className="footer__wrapper">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
						{/* Mycology Supplies Column */}
						<div className="footer__block-item">
							<button onClick={() => toggleSection("supplies")} className="footer__title w-full text-left flex justify-between items-center text-lg font-semibold mb-4 py-4 md:py-0">
								<span>Mycology Supplies</span>
								<span className={`transform transition-transform duration-300 md:hidden ${openSection === "supplies" ? "rotate-45" : ""}`}>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
								</span>
							</button>
							<div className={`footer__content transition-all duration-300 overflow-hidden md:h-auto ${openSection === "supplies" ? "h-auto" : "h-0 md:h-auto"}`}>
								<div className="space-y-2 text-gray-300">
									<p>✅ Need something you don't see on our site?</p>
									<p>✅ Want bulk pricing?</p>
									<p>✅ Need a custom order?</p>
									<p>Contact Us.</p>
									<p className="mt-4">Thank you for putting your trust in the Zugzology team!</p>
								</div>
							</div>
						</div>

						{/* Important Links Column */}
						<div className="footer__block-item">
							<button onClick={() => toggleSection("links")} className="footer__title w-full text-left flex justify-between items-center text-lg font-semibold mb-4 py-4 md:py-0">
								<span>Important Links</span>
								<span className={`transform transition-transform duration-300 md:hidden ${openSection === "links" ? "rotate-45" : ""}`}>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
								</span>
							</button>
							<div className={`footer__content transition-all duration-300 overflow-hidden md:h-auto ${openSection === "links" ? "h-auto" : "h-0 md:h-auto"}`}>
								<ul className="space-y-3 text-gray-300" role="list">
									<li>
										<Link href="/collections/all" className="hover:text-white transition-colors">
											All Products
										</Link>
									</li>
									<li>
										<Link href="/pages/instructions" className="hover:text-white transition-colors">
											How To's
										</Link>
									</li>
									<li>
										<Link href="/pages/faq" className="hover:text-white transition-colors">
											FAQ
										</Link>
									</li>
									<li>
										<Link href="/pages/contact" className="hover:text-white transition-colors">
											Bulk Order
										</Link>
									</li>
									<li>
										<Link href="/pages/contact" className="hover:text-white transition-colors">
											Contact Us
										</Link>
									</li>
									<li>
										<Link href="/policies/terms-of-service" className="hover:text-white transition-colors">
											Terms of Service
										</Link>
									</li>
									<li>
										<Link href="/policies/refund-policy" className="hover:text-white transition-colors">
											Returns
										</Link>
									</li>
								</ul>
							</div>
						</div>

						{/* Disclaimer Column */}
						<div className="footer__block-item">
							<button onClick={() => toggleSection("disclaimer")} className="footer__title w-full text-left flex justify-between items-center text-lg font-semibold mb-4 py-4 md:py-0">
								<span>Disclaimer</span>
								<span className={`transform transition-transform duration-300 md:hidden ${openSection === "disclaimer" ? "rotate-45" : ""}`}>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
								</span>
							</button>
							<div className={`footer__content transition-all duration-300 overflow-hidden md:h-auto ${openSection === "disclaimer" ? "h-auto" : "h-0 md:h-auto"}`}>
								<div className="text-gray-300">
									<p>Mycology supplies are intended to assist the growth or research of legal mushrooms according to a customer's local laws. We don't condone the usage of our mycology supplies for any other purpose.</p>
								</div>
							</div>
						</div>
					</div>

					{/* Footer Aside */}
					<aside className="footer__aside border-t border-gray-800">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
							{/* Country/Region Selector */}
							<div className="footer__aside-item">
								<div className="flex items-center">
									<button type="button" className="text-gray-300 hover:text-white transition-colors flex items-center">
										United States (USD $)
										<svg className="ml-2 w-4 h-4" viewBox="0 0 12 8" fill="none" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 2l4 4 4-4" />
										</svg>
									</button>
								</div>
							</div>

							{/* Social Media */}
							<div className="footer__aside-item">
								<p className="text-sm font-semibold mb-4">Follow Us</p>
								<ul className="flex gap-4" role="list">
									<li>
										<Link href="https://facebook.com/zugzology" target="_blank" rel="noopener" className="text-gray-300 hover:text-white transition-colors">
											<span className="sr-only">Facebook</span>
											<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
												<path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
											</svg>
										</Link>
									</li>
									<li>
										<Link href="https://twitter.com/zugzology" target="_blank" rel="noopener" className="text-gray-300 hover:text-white transition-colors">
											<span className="sr-only">Twitter</span>
											<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
												<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
											</svg>
										</Link>
									</li>
									<li>
										<Link href="https://instagram.com/zugzology" target="_blank" rel="noopener" className="text-gray-300 hover:text-white transition-colors">
											<span className="sr-only">Instagram</span>
											<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
												<path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
											</svg>
										</Link>
									</li>
								</ul>
							</div>

							{/* Payment Methods */}
							<div className="footer__aside-item">
								<p className="text-sm font-semibold mb-4">We Accept</p>
								<div className="flex flex-wrap gap-2">
									<Image src="/images/payment/visa.svg" alt="Visa" width={38} height={24} />
									<Image src="/images/payment/mastercard.svg" alt="Mastercard" width={38} height={24} />
									<Image src="/images/payment/amex.svg" alt="American Express" width={38} height={24} />
									<Image src="/images/payment/paypal.svg" alt="PayPal" width={38} height={24} />
								</div>
							</div>
						</div>

						{/* Copyright */}
						<div className="text-center py-8 border-t border-gray-800">
							<p className="text-sm text-gray-400">© 2025 Zugzology</p>
						</div>
					</aside>
				</div>
			</div>
		</footer>
	);
}
