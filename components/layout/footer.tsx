import { Shield, Truck, Package, Sprout, Award, Star, Clock, Users, Facebook, Twitter, Youtube, Instagram, Linkedin, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import StoreFeatures from "../store/store-features";

export function Footer() {
	return (
		<footer className="w-full">
			{/* Features Section - Using the new StoreFeatures component */}
			<StoreFeatures />

			{/* Main Footer */}
			<div className="relative flex flex-col font-sans bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
				<section className="container mx-auto flex flex-col gap-16 p-4 sm:py-16 my-0 sm:justify-start sm:pb-16 md:flex-row md:flex-nowrap md:justify-between md:pb-20 md:py-20 md:gap-20 xl:w-full">
					{/* Logo Section */}
					<div className="min-w-[100px] flex items-start">
						<Link href="/" className="text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300">
							<div className="relative w-20 h-20">
								<Image src="/logo.png" alt="Zugzology Logo" fill className="object-contain dark:invert" sizes="24px" />
							</div>
						</Link>
					</div>

					{/* Navigation Grid */}
					<div className="md:block md:justify-end">
						<div className="flex flex-col flex-wrap gap-12 gap-x-4 md:gap-20 md:gap-x-16 sm:grid sm:max-h-fit sm:grid-cols-3 lg:grid-cols-4 max-h-[92rem] sm:max-h-[75rem]">
							{/* Main Section */}
							<div className="w-[calc(50%_-_1rem)] sm:w-fit">
								<h2 className="text-base font-bold text-gray-900 dark:text-white">Zugzology</h2>
								<ul className="mt-4 md:mt-6">
									{[
										{ href: "/about", text: "About Us" },
										{ href: "/careers", text: "Careers" },
										{ href: "/wholesale", text: "Wholesale Program" },
										{ href: "/blogs/news", text: "News & Updates" },
										{ href: "/partners", text: "Partner Program" },
										{ href: "/affiliate", text: "Affiliate Program" },
										{ href: "/legal", text: "Legal" },
										{ href: "/status", text: "Service Status" },
									].map((link) => (
										<li key={link.href}>
											<Link
												href={link.href}
												className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
											>
												{link.text}
											</Link>
										</li>
									))}
								</ul>
							</div>

							{/* Support Section */}
							<div className="w-[calc(50%_-_1rem)] sm:w-fit">
								<h2 className="text-base font-bold text-gray-900 dark:text-white">Support</h2>
								<ul className="mt-4 md:mt-6">
									{[
										{ href: "/help/support", text: "Customer Support" },
										{ href: "/help/center", text: "Help Center" },
										{ href: "/shipping", text: "Shipping Information" },
										{ href: "/returns", text: "Returns & Exchanges" },
										{ href: "/faq", text: "FAQ" },
									].map((link) => (
										<li key={link.href}>
											<Link
												href={link.href}
												className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
											>
												{link.text}
											</Link>
										</li>
									))}
								</ul>
							</div>

							{/* Resources Section */}
							<div className="w-[calc(50%_-_1rem)] sm:w-fit">
								<h2 className="text-base font-bold text-gray-900 dark:text-white">Resources</h2>
								<ul className="mt-4 md:mt-6">
									{[
										{ href: "/guides", text: "Growing Guides" },
										{ href: "/blog", text: "Blog" },
										{ href: "/videos", text: "Video Tutorials" },
									].map((link) => (
										<li key={link.href}>
											<Link
												href={link.href}
												className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
											>
												{link.text}
											</Link>
										</li>
									))}
								</ul>
							</div>

							{/* Products Section */}
							<div className="w-[calc(50%_-_1rem)] sm:w-fit">
								<h2 className="text-base font-bold text-gray-900 dark:text-white">Products</h2>
								<ul className="mt-4 md:mt-6">
									{[
										{ href: "/collections/all", text: "All Products" },
										{ href: "/collections/grow-bags", text: "Grow Bags" },
										{ href: "/collections/substrates", text: "Substrates" },
										{ href: "/collections/equipment", text: "Equipment" },
										{ href: "/collections/supplies", text: "Supplies" },
										{ href: "/collections/bulk", text: "Bulk Orders" },
									].map((link) => (
										<li key={link.href}>
											<Link
												href={link.href}
												className="mt-2 block py-3 text-base font-semi-medium hover:underline md:py-0.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
											>
												{link.text}
											</Link>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</section>

				{/* Bottom Section */}
				<section className="border-t border-gray-200 dark:border-gray-800 my-0 container mx-auto max-sm:mx-0 xl:w-full">
					<div className="flex flex-col items-center justify-center gap-4 py-8 sm:items-start sm:gap-8 lg:flex-row lg:justify-between lg:gap-10">
						<div className="mt-1 flex w-full flex-col items-center justify-center sm:flex-row sm:items-start sm:justify-start sm:gap-8 lg:gap-14">
							{/* Region Selector */}
							<div className="relative hidden sm:block">
								<button
									className="bg-transparent mx-auto md:inline-block py-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
									type="button"
								>
									<span className="inline-flex items-center">
										<Globe className="mr-1 h-4 w-4" />
										<span className="break-keep">USA</span>
										<svg viewBox="0 0 10 5" aria-hidden="true" focusable="false" className="ml-2 h-3 w-3 fill-current">
											<path d="m0 0 5 5 5-5H0z"></path>
										</svg>
									</span>
								</button>
							</div>

							{/* Legal Links */}
							<ul className="flex flex-col items-center flex-wrap sm:flex-row sm:items-start gap-x-8 md:gap-x-10">
								{[
									{ href: "/terms", text: "Terms of Service" },
									{ href: "/privacy", text: "Privacy Policy" },
									{ href: "/sitemap", text: "Sitemap" },
									{ href: "/cookies", text: "Cookie Preferences" },
								].map((link) => (
									<li
										key={link.href}
										className="font-semi-medium mt-2 block py-3 sm:mt-0 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
									>
										<Link href={link.href} className="hover:underline">
											{link.text}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Social Media Links */}
						<ul className="flex gap-4 md:gap-6">
							{[
								{ href: "https://www.facebook.com/zugzology", Icon: Facebook },
								{ href: "https://twitter.com/zugzology", Icon: Twitter },
								{ href: "https://www.youtube.com/@zugzology", Icon: Youtube },
								{ href: "https://www.instagram.com/zugzology", Icon: Instagram },
								{ href: "https://www.linkedin.com/company/zugzology", Icon: Linkedin },
							].map((social) => (
								<li key={social.href}>
									<a
										href={social.href}
										rel="me nofollow noopener noreferrer"
										target="_blank"
										className="block h-8 w-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
									>
										<social.Icon className="h-full w-full" />
									</a>
								</li>
							))}
						</ul>
					</div>
				</section>
			</div>
		</footer>
	);
}
