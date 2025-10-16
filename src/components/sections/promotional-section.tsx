"use client";

import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import styles from "./promotional-section.module.css";

export function PromotionalSection() {
	return (
		<section className="relative min-h-[50vh] overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-transparent dark:from-primary/10 dark:via-primary/20 dark:to-transparent">
			{/* Decorative Elements */}
			<div className="absolute inset-0 z-0">
				<div className="-left-24 -top-24 absolute h-96 w-96 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
				<div className="-bottom-24 -right-24 absolute h-96 w-96 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
				<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-64 w-64 rounded-full bg-primary/5 blur-2xl dark:bg-primary/10" />
			</div>

			<div className="relative z-10 flex min-h-[50vh] items-center justify-center">
				<div className="container mx-auto px-4 py-12">
					<div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
						{/* Content */}
						<div className="flex flex-col justify-center">
							<div className="flex items-center space-x-2">
								<Badge
									className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
									variant="secondary"
								>
									Limited Time Offer
								</Badge>
								<div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent dark:from-primary/40" />
							</div>

							<h2 className="mt-4 max-w-2xl font-bold text-4xl text-foreground tracking-tight sm:text-5xl lg:text-6xl">
								<span className="block text-primary">10% Off</span>
								<span className="block">Your First Order</span>
							</h2>

							<p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed">
								Start your cultivation journey with premium supplies and expert guidance. Use code{" "}
								<span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 font-bold font-mono text-primary">
									WELCOME10
								</span>
							</p>

							<div className="mt-8 flex flex-col gap-4 sm:flex-row">
								<Button
									asChild
									className={`group relative overflow-hidden bg-primary px-8 transition-colors hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary/80 ${styles.shimmerButton}`}
									size="lg"
								>
									<Link href="/collections/all">
										<span className="relative z-10 flex items-center justify-center">
											Shop Now
											<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
										</span>
										<div
											className={`absolute inset-0 z-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent ${styles.shimmerEffect}`}
										/>
									</Link>
								</Button>
								<Button asChild className="group border px-8" size="lg" variant="outline">
									<Link href="/help">
										Learn More
										<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
									</Link>
								</Button>
							</div>

							<p className="mt-6 text-muted-foreground text-sm">
								*Valid for new customers only. Cannot be combined with other offers.
							</p>
						</div>

						{/* Image/Visual Side */}
						<div className="relative hidden lg:block">
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="relative h-full w-full">
									{/* Decorative circles */}
									<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-64 w-64">
										<div
											className={`absolute inset-0 rounded-full border-2 border-primary/30 border-dashed ${styles.spinSlow}`}
										/>
										<div
											className={`absolute inset-8 rounded-full border-2 border-primary/20 border-dashed ${styles.spinSlowReverse}`}
										/>
										<div
											className={`absolute inset-16 rounded-full border-2 border-primary/10 border-dashed ${styles.spinSlow}`}
										/>
									</div>
									{/* Center content */}
									<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2">
										<div className="rounded-full bg-primary/10 p-8">
											<div className="rounded-full bg-primary/20 p-6">
												<div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary font-bold text-3xl text-white">
													10%
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
