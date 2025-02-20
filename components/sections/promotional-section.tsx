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
				<div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
				<div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
				<div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-2xl dark:bg-primary/10" />
			</div>

			<div className="relative z-10 flex min-h-[50vh] items-center justify-center">
				<div className="mx-auto w-full container px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
					<div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
						{/* Content */}
						<div className="flex flex-col justify-center">
							<div className="flex items-center space-x-2">
								<Badge className="bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30" variant="secondary">
									Limited Time Offer
								</Badge>
								<div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent dark:from-primary/40" />
							</div>

							<h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl lg:text-6xl">
								<span className="block text-primary">10% Off</span>
								<span className="block">Your First Order</span>
							</h2>

							<p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
								Start your cultivation journey with premium supplies and expert guidance. Use code <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 font-mono font-bold text-primary">WELCOME10</span>
							</p>

							<div className="mt-8 flex flex-col gap-4 sm:flex-row">
								<Button size="lg" className={`group relative overflow-hidden bg-primary px-8 hover:bg-primary/90 dark:bg-primary/90 dark:hover:bg-primary/80 transition-colors ${styles.shimmerButton}`} asChild>
									<Link href="/collections/all">
										<span className="relative z-10 flex items-center justify-center">
											Shop Now
											<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
										</span>
										<div className={`absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] ${styles.shimmerEffect}`} />
									</Link>
								</Button>
								<Button size="lg" variant="outline" className="group border-gray-200 px-8 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800" asChild>
									<Link href="/help">
										Learn More
										<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
									</Link>
								</Button>
							</div>

							<p className="mt-6 text-sm text-gray-500 dark:text-gray-400">*Valid for new customers only. Cannot be combined with other offers.</p>
						</div>

						{/* Image/Visual Side */}
						<div className="relative hidden lg:block">
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="relative h-full w-full">
									{/* Decorative circles */}
									<div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2">
										<div className={`absolute inset-0 rounded-full border-2 border-dashed border-primary/30 ${styles.spinSlow}`} />
										<div className={`absolute inset-8 rounded-full border-2 border-dashed border-primary/20 ${styles.spinSlowReverse}`} />
										<div className={`absolute inset-16 rounded-full border-2 border-dashed border-primary/10 ${styles.spinSlow}`} />
									</div>
									{/* Center content */}
									<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
										<div className="rounded-full bg-primary/10 p-8">
											<div className="rounded-full bg-primary/20 p-6">
												<div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">10%</div>
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
