import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
	return (
		<footer className="w-full py-12 md:py-16 lg:py-20 border-y">
			<div className="px-4 md:px-6">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
					<div className="space-y-4">
						<h3 className="text-base font-semibold">Product</h3>
						<nav className="flex flex-col space-y-3">
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Overview
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Pricing
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Marketplace
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Features
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Integrations
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Pricing
							</Link>
						</nav>
					</div>
					<div className="space-y-4">
						<h3 className="text-base font-semibold">Company</h3>
						<nav className="flex flex-col space-y-3">
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								About
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Team
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Blog
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Careers
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Contact
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Privacy
							</Link>
						</nav>
					</div>
					<div className="space-y-4">
						<h3 className="text-base font-semibold">Resources</h3>
						<nav className="flex flex-col space-y-3">
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Help
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Sales
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Advertise
							</Link>
						</nav>
					</div>
					<div className="space-y-4">
						<h3 className="text-base font-semibold">Social</h3>
						<nav className="flex flex-col space-y-3">
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Twitter
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								Instagram
							</Link>
							<Link className="text-sm text-muted-foreground hover:text-primary" href="#">
								LinkedIn
							</Link>
						</nav>
					</div>
				</div>
				<div className="mt-12 flex flex-col gap-8 md:flex-row md:justify-between">
					<div className="space-y-4">
						<h3 className="text-base font-semibold">Follow us</h3>
						<div className="flex gap-4">
							<Link className="rounded-full bg-muted p-2 hover:bg-muted-foreground/10" href="#">
								<Facebook className="h-5 w-5 text-muted-foreground" />
								<span className="sr-only">Facebook</span>
							</Link>
							<Link className="rounded-full bg-muted p-2 hover:bg-muted-foreground/10" href="#">
								<Twitter className="h-5 w-5 text-muted-foreground" />
								<span className="sr-only">Twitter</span>
							</Link>
							<Link className="rounded-full bg-muted p-2 hover:bg-muted-foreground/10" href="#">
								<Instagram className="h-5 w-5 text-muted-foreground" />
								<span className="sr-only">Instagram</span>
							</Link>
							<Link className="rounded-full bg-muted p-2 hover:bg-muted-foreground/10" href="#">
								<Linkedin className="h-5 w-5 text-muted-foreground" />
								<span className="sr-only">LinkedIn</span>
							</Link>
						</div>
					</div>
					<div className="space-y-4">
						<h3 className="text-base font-semibold">Mobile App</h3>
						<div className="flex gap-4">
							<Link className="rounded-full bg-muted p-2 hover:bg-muted-foreground/10" href="#">
								<svg className=" h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
									<polygon points="12 15 17 21 7 21 12 15" />
								</svg>
								<span className="sr-only">Android App</span>
							</Link>
							<Link className="rounded-full bg-muted p-2 hover:bg-muted-foreground/10" href="#">
								<svg className=" h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
									<path d="M10 2c1 .5 2 2 2 5" />
								</svg>
								<span className="sr-only">iOS App</span>
							</Link>
						</div>
					</div>
				</div>
				<div className="mt-8 border-t pt-8 text-center">
					<p className="text-sm text-muted-foreground">© 2024 Shadcn. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
