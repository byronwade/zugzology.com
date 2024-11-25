"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ImageIcon, Star, StarHalf, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Suspense } from "react";

interface Product {
	id: string;
	name: string;
	price: number;
	image: string;
	rating: number;
	reviews: number;
	delivery: {
		free: boolean;
		date: string;
		prime?: boolean;
	};
	fastDelivery?: {
		date: string;
	};
	stock?: {
		count: number;
		warning?: boolean;
	};
}

const mockProducts: Product[] = [
	{
		id: "1",
		name: "ASUS ROG STRIX GeForce RTX™ 4090 OC Edition 24GB GDDR6X, HDMI 2.1, DP 1.4",
		price: 2970.0,
		image: "https://placehold.co/600x600",
		rating: 4.5,
		reviews: 102,
		delivery: {
			free: true,
			date: "Thu, Dec 5",
		},
		fastDelivery: {
			date: "Wed, Nov 27",
		},
		stock: {
			count: 5,
			warning: true,
		},
	},
	{
		id: "2",
		name: "ASUS ProArt GeForce RTX™ 4080 Super OC Edition Graphics Card (PCIe 4.0, 16GB GDDR6X, DLSS 3)",
		price: 1149.97,
		image: "https://placehold.co/600x600",
		rating: 4.5,
		reviews: 751,
		delivery: {
			free: true,
			date: "Fri, Dec 6",
			prime: true,
		},
	},
	{
		id: "3",
		name: "MSI GeForce RTX® 4090 Gaming X Trio 24G",
		price: 2699.99,
		image: "https://placehold.co/600x600",
		rating: 5,
		reviews: 1,
		delivery: {
			free: true,
			date: "Thu, Dec 5",
		},
		fastDelivery: {
			date: "Wed, Nov 27",
		},
		stock: {
			count: 2,
			warning: true,
		},
	},
];

const categories = ["Graphics Cards", "CPUs", "Motherboards", "RAM", "Storage", "Power Supplies", "Cases", "Cooling", "Monitors", "Peripherals"];

const brands = ["ASUS", "MSI", "GIGABYTE", "EVGA", "Sapphire", "XFX", "Zotac", "PowerColor"];

function RatingStars({ rating }: { rating: number }) {
	return (
		<div className="flex items-center">
			{[...Array(5)].map((_, i) => {
				if (i < Math.floor(rating)) {
					return <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
				} else if (i === Math.floor(rating) && rating % 1 !== 0) {
					return <StarHalf key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
				}
				return <Star key={i} className="w-4 h-4 text-gray-300" />;
			})}
		</div>
	);
}

function SearchResults() {
	const searchParams = useSearchParams();
	const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
	const [priceRange, setPriceRange] = useState([0, 3000]);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	useEffect(() => {
		setSearchQuery(searchParams.get("q") || "");
	}, [searchParams]);

	const filteredProducts = mockProducts.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()));

	const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
	const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

	const FilterSidebar = () => (
		<div className="space-y-6">
			<div>
				<h3 className="font-semibold mb-2">Categories</h3>
				<div className="space-y-2 max-h-48 overflow-y-auto">
					{categories.map((category) => (
						<div key={category} className="flex items-center">
							<Checkbox id={category} />
							<label htmlFor={category} className="ml-2 text-sm">
								{category}
							</label>
						</div>
					))}
				</div>
			</div>
			<div>
				<h3 className="font-semibold mb-2">Brands</h3>
				<div className="space-y-2 max-h-48 overflow-y-auto">
					{brands.map((brand) => (
						<div key={brand} className="flex items-center">
							<Checkbox id={brand} />
							<label htmlFor={brand} className="ml-2 text-sm">
								{brand}
							</label>
						</div>
					))}
				</div>
			</div>
			<div>
				<h3 className="font-semibold mb-2">Price Range</h3>
				<Slider min={0} max={3000} step={10} value={priceRange} onValueChange={setPriceRange} className="mb-2" />
				<div className="flex justify-between text-sm">
					<span>${priceRange[0]}</span>
					<span>${priceRange[1]}</span>
				</div>
			</div>
			<div>
				<h3 className="font-semibold mb-2">Customer Rating</h3>
				{[4, 3, 2, 1].map((rating) => (
					<div key={rating} className="flex items-center">
						<Checkbox id={`rating-${rating}`} />
						<label htmlFor={`rating-${rating}`} className="ml-2 text-sm flex items-center">
							{rating}+ <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 ml-1" />
						</label>
					</div>
				))}
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<div className="p-4 border-b">
				<p className="text-sm text-muted-foreground">
					{filteredProducts.length} results {searchQuery && `for "${searchQuery}"`}
				</p>
			</div>

			<div className="flex-1 flex">
				{/* Filter Sidebar for desktop */}
				<aside className="hidden md:block w-64 p-4 border-r bg-background">
					<FilterSidebar />
				</aside>

				{/* Product List */}
				<div className="flex-1 divide-y">
					{paginatedProducts.map((product) => (
						<div key={product.id} className="flex p-4 bg-white">
							<div className="w-48 h-48 relative flex-shrink-0">
								<Image src={product.image} alt={product.name} fill className="object-contain" style={{ maxWidth: "100%", maxHeight: "100%" }} />
								<Button variant="ghost" size="icon" className="absolute bottom-0 left-0 bg-white/80 backdrop-blur-sm rounded-full">
									<ImageIcon className="h-4 w-4" />
								</Button>
							</div>
							<div className="flex-grow pl-4 flex flex-col">
								<h2 className="font-medium text-base line-clamp-2">{product.name}</h2>
								<div className="mt-1 flex items-center gap-2">
									<RatingStars rating={product.rating} />
									<span className="text-sm text-muted-foreground">({product.reviews})</span>
								</div>
								<div className="mt-1">
									<span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
								</div>
								<div className="mt-1 space-y-0.5 text-sm">
									<p>
										{product.delivery.free ? "FREE delivery " : "Delivery "}
										{product.delivery.date}
										{product.delivery.prime && " for Prime members"}
									</p>
									{product.fastDelivery && <p className="text-sm">Or fastest delivery {product.fastDelivery.date}</p>}
									{product.stock?.warning && <p className="text-red-600 text-sm">Only {product.stock.count} left in stock - order soon.</p>}
								</div>
								<Button className="w-full mt-2 md:mt-3 md:max-w-[200px]">Add to cart</Button>
							</div>
						</div>
					))}
				</div>

				{/* Mobile Filter Button */}
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="outline" size="icon" className="fixed bottom-4 right-4 rounded-full md:hidden">
							<Filter className="h-6 w-6" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-[300px] sm:w-[400px]">
						<FilterSidebar />
					</SheetContent>
				</Sheet>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex justify-center items-center py-4 px-4 bg-white">
					<Button variant="outline" size="icon" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<span className="mx-4 text-sm">
						Page {currentPage} of {totalPages}
					</span>
					<Button variant="outline" size="icon" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
}

export default function SearchPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center min-h-screen">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
				</div>
			}
		>
			<SearchResults />
		</Suspense>
	);
}
