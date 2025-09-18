"use client";

import { Award, Box, Clock, HeartHandshake, Leaf, ShieldCheck, Truck, Users } from "lucide-react";

export default function StoreFeatures() {
	const features = [
		{
			icon: <Award className="h-5 w-5" />,
			title: "Quality Guaranteed",
			description: "Lab-tested supplies for optimal growth success.",
		},
		{
			icon: <Leaf className="h-5 w-5" />,
			title: "Expert Support",
			description: "Access our knowledge base for cultivation success.",
		},
		{
			icon: <Box className="h-5 w-5" />,
			title: "Discreet Shipping",
			description: "Plain, unmarked packaging for all orders.",
		},
		{
			icon: <Truck className="h-5 w-5" />,
			title: "Fast & Free Shipping",
			description: "Free shipping on orders over $50.",
		},
		{
			icon: <ShieldCheck className="h-5 w-5" />,
			title: "Premium Products",
			description: "Carefully selected for best results.",
		},
		{
			icon: <Clock className="h-5 w-5" />,
			title: "24/7 Support",
			description: "Help available through our knowledge base.",
		},
		{
			icon: <Users className="h-5 w-5" />,
			title: "Growing Community",
			description: "Share experiences and tips with growers.",
		},
		{
			icon: <HeartHandshake className="h-5 w-5" />,
			title: "30-Day Guarantee",
			description: "Money-back guarantee on all purchases.",
		},
	];

	return (
		<section className="relative overflow-hidden bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950">
			{/* Subtle background pattern */}
			<div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
				<div className="absolute inset-0" style={{
					backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
					backgroundSize: '20px 20px'
				}}></div>
			</div>
			
			<div className="relative py-16 sm:py-20">
				<div className="container mx-auto px-4 md:px-6">
					<div className="text-center mb-12">
						<h2 className="text-2xl sm:text-3xl font-light text-gray-900 dark:text-white mb-4">
							Why Choose Zugzology?
						</h2>
						<p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
							Premium mushroom cultivation supplies with the support and quality you need to succeed.
						</p>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
						{features.map((feature, index) => (
							<div
								key={index}
								className="group relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-6 hover:bg-white/80 dark:hover:bg-gray-900/80 hover:border-gray-300/50 dark:hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/25 dark:hover:shadow-gray-900/25 hover:-translate-y-1"
							>
								{/* Icon */}
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200/70 dark:from-gray-800 dark:to-gray-700/70 mb-4 group-hover:scale-110 transition-transform duration-300">
									<div className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300">
										{feature.icon}
									</div>
								</div>

								{/* Content */}
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
									{feature.title}
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
									{feature.description}
								</p>

								{/* Hover effect overlay */}
								<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
