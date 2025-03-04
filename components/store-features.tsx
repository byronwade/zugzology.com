import { Truck, ShieldCheck, Sprout, BookOpen, HeadphonesIcon, RefreshCw } from "lucide-react";

export function StoreFeatures() {
	const features = [
		{
			icon: Truck,
			title: "Free Shipping",
			description: "Free shipping on all orders over $75",
		},
		{
			icon: ShieldCheck,
			title: "Satisfaction Guarantee",
			description: "30-day money-back guarantee on all products",
		},
		{
			icon: Sprout,
			title: "Sustainable Practices",
			description: "Eco-friendly packaging and growing methods",
		},
		{
			icon: BookOpen,
			title: "Expert Resources",
			description: "Free access to our cultivation guides and videos",
		},
		{
			icon: HeadphonesIcon,
			title: "Customer Support",
			description: "Dedicated support from experienced growers",
		},
		{
			icon: RefreshCw,
			title: "Subscription Options",
			description: "Save with regular deliveries of your favorites",
		},
	];

	return (
		<section className="py-16">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<h2 className="text-2xl font-bold tracking-tight text-center text-gray-900 sm:text-3xl mb-12">
					Why Choose Zugzology
				</h2>
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{features.map((feature, index) => (
						<div key={index} className="flex flex-col items-center text-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
								<feature.icon className="h-8 w-8 text-primary" />
							</div>
							<h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
							<p className="mt-2 text-gray-600">{feature.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
