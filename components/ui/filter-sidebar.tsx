import { Star } from "lucide-react";

const categories = ["Mushrooms", "Spores", "Equipment", "Supplies"];
const brands = ["Zugzology", "Other Brands"];

export default function FilterSidebar() {
	return (
		<aside className="w-64 overflow-y-auto border-r bg-background">
			<div className="p-4 h-full">
				<div className="space-y-6">
					{/* Categories */}
					<div>
						<h3 className="font-semibold mb-2">Categories</h3>
						<div className="space-y-2 max-h-48 overflow-y-auto">
							{categories.map((category) => (
								<div key={category} className="flex items-center">
									<button type="button" role="checkbox" aria-checked="false" className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" id={category} />
									<label htmlFor={category} className="ml-2 text-sm">
										{category}
									</label>
								</div>
							))}
						</div>
					</div>

					{/* Brands */}
					<div>
						<h3 className="font-semibold mb-2">Brands</h3>
						<div className="space-y-2 max-h-48 overflow-y-auto">
							{brands.map((brand) => (
								<div key={brand} className="flex items-center">
									<button type="button" role="checkbox" aria-checked="false" className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" id={brand} />
									<label htmlFor={brand} className="ml-2 text-sm">
										{brand}
									</label>
								</div>
							))}
						</div>
					</div>

					{/* Price Range */}
					<div>
						<h3 className="font-semibold mb-2">Price Range</h3>
						<div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
							<div className="absolute h-full bg-primary" style={{ left: "0%", right: "0%" }} />
						</div>
						<div className="flex justify-between text-sm mt-2">
							<span>$0</span>
							<span>$3000</span>
						</div>
					</div>

					{/* Customer Rating */}
					<div>
						<h3 className="font-semibold mb-2">Customer Rating</h3>
						{[4, 3, 2, 1].map((rating) => (
							<div key={rating} className="flex items-center">
								<button type="button" role="checkbox" aria-checked="false" className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" id={`rating-${rating}`} />
								<label htmlFor={`rating-${rating}`} className="ml-2 text-sm flex items-center">
									{rating}+ <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 ml-1" />
								</label>
							</div>
						))}
					</div>
				</div>
			</div>
		</aside>
	);
}
