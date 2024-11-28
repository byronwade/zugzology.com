import { unstable_cache } from "next/cache";
import { Suspense } from "react";

interface Product {
	id: string;
	title: string;
	description: string;
	price: number;
	slug: string;
	image: string;
	category: string;
	brand: string;
	rating: number;
}

// Mock products data
const mockProducts: Product[] = [
	{
		id: "1",
		title: "All-In-One Mushroom Grow Bag 4lbs",
		description: "Nurture a bountiful harvest with our All-In-One Grow Bags. Our Coco Core, Vermiculite, and Gypsum blend creates the perfect environment for mushroom cultivation.",
		price: 20.0,
		slug: "all-in-one-mushroom-grow-bag",
		image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
		category: "Equipment",
		brand: "Zugzology",
		rating: 4.5,
	},
	// ... add more mock products
];

const getProducts = unstable_cache(
	async () => {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return mockProducts;
	},
	["products-list"],
	{
		revalidate: 3600,
		tags: ["products"],
	}
);

function ProductsLoading() {
	return <div className="animate-pulse">Loading products...</div>;
}

function ProductList({ products }: { products: Product[] }) {
	return (
		<div className="flex-1 divide-y">
			{products.map((product) => (
				<div key={product.id} className="flex p-4 bg-background">
					<div className="w-32 h-32 md:w-48 md:h-48 relative flex-shrink-0 bg-gray-100 flex items-center justify-center border-b border-gray-200 rounded-md">
						<img src={product.image} alt={product.title} className="object-contain rounded-md" style={{ width: "100%", height: "100%" }} />
					</div>
					<div className="flex-grow pl-4 flex flex-col">
						<a href={`/products/${product.slug}`} className="hover:underline">
							<h2 className="font-medium text-base line-clamp-2">{product.title}</h2>
						</a>
						<div className="mt-1">
							<span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
						</div>
						<div className="mt-1 space-y-0.5 text-sm">
							<p>FREE delivery</p>
							<p className="text-red-600">Out of Stock</p>
						</div>
						<button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full mt-2 md:mt-3 md:max-w-[200px]" disabled>
							Add to cart
						</button>
						<p className="mt-4 text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">{product.description}</p>
					</div>
				</div>
			))}
		</div>
	);
}

async function ProductsContent() {
	const products = await getProducts();

	return (
		<div className="flex-1 lg:ml-64">
			{/* Mobile filters */}
			<div className="lg:hidden">
				<div className="sticky top-[64px] z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="flex h-14 items-center px-4 gap-4">
						<button className="justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
								<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
							</svg>
							<span>Filters</span>
						</button>
					</div>
				</div>
			</div>

			<h1 className="text-3xl font-bold p-4">Our Products</h1>
			<ProductList products={products} />
		</div>
	);
}

export default function ProductsPage() {
	return (
		<div className="min-h-screen bg-background flex flex-col">
			<div className="flex-1 flex relative">
				<Suspense fallback={<ProductsLoading />}>
					<ProductsContent />
				</Suspense>
			</div>
		</div>
	);
}