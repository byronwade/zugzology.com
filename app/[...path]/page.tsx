import { notFound } from "next/navigation";
import { ProductsList } from "@/components/products/products-list";
import { ProductDetails } from "@/components/products/product-details";
import { PostContent } from "@/components/myceliums-gambit/post-content";
import { MyceliumsGambitList } from "@/components/myceliums-gambit/myceliums-gambit-list";
import { getCollectionData, getAllProducts } from "@/actions/getTaxonomyData";
import { getProduct } from "@/actions/getProduct";
import { getMyceliumsGambitPosts, getMyceliumsGambitPost } from "@/actions/getMyceliumsGambitPosts";
import { FilterSidebar } from "@/components/products/filter-sidebar";
import { FilterBar } from "@/components/products/filter-bar";

export const runtime = "edge";
export const preferredRegion = "auto";
export const revalidate = 0;

export default async function PathPage({ params }: { params: { path: string[] } }) {
	const nextjs15 = await params;
	const path = nextjs15.path;
	const type = path[0];
	const handle = path.slice(1).join("/");

	const shouldShowFilters = (type === "products" && !handle) || (type === "collections" && handle !== "all");

	const shouldShowTitle = (type: string, handle: string) => {
		if (type === "products" && handle) return false;
		if (type === "myceliums-gambit" && handle) return false;
		return true;
	};

	async function getPageContent() {
		switch (type) {
			case "products":
				if (!handle) {
					const products = await getAllProducts();
					return {
						title: "All Products",
						content: <ProductsList products={products} />,
					};
				}
				const product = await getProduct(handle);
				if (!product) return null;
				return {
					title: product.title,
					description: product.description,
					content: <ProductDetails product={product} />,
				};

			case "myceliums-gambit":
				if (!handle) {
					const posts = await getMyceliumsGambitPosts(250);
					return {
						title: "Mycelium's Gambit",
						description: "Read our latest articles about mushrooms and mycology",
						content: <MyceliumsGambitList posts={posts} />,
					};
				}
				const post = await getMyceliumsGambitPost(handle);
				if (!post) return null;
				return {
					title: post.title,
					description: post.excerpt,
					content: <PostContent post={post} />,
				};

			case "collections":
				if (!handle || handle === "all") {
					const products = await getAllProducts();
					return {
						title: "All Collections",
						content: <ProductsList products={products} />,
					};
				}
				const collection = await getCollectionData(handle);
				if (!collection) return null;
				return {
					title: collection.title,
					description: collection.description,
					content: <ProductsList products={collection.products.edges.map((edge) => edge.node)} />,
				};

			case "contact":
				return {
					title: "Contact Us",
					content: <div>Contact Page Content</div>,
				};

			case "about":
				return {
					title: "About Us",
					content: <div>About Page Content</div>,
				};

			default:
				return null;
		}
	}

	const pageContent = await getPageContent();
	if (!pageContent) {
		notFound();
	}

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<div className="flex-1 flex relative">
				{shouldShowFilters && (
					<aside className="hidden lg:block w-64 fixed top-[105px] bottom-0 left-0 overflow-y-auto border-r bg-background">
						<div className="p-4 h-full">
							<FilterSidebar categories={["Mushrooms", "Spores", "Equipment", "Supplies"]} brands={["Zugzology", "Other Brands"]} />
						</div>
					</aside>
				)}

				<div className={`flex-1 ${shouldShowFilters ? "lg:ml-64" : ""}`}>
					{shouldShowFilters && (
						<div className="lg:hidden">
							<FilterBar categories={["Mushrooms", "Spores", "Equipment", "Supplies"]} brands={["Zugzology", "Other Brands"]} />
						</div>
					)}

					<>
						{shouldShowTitle(type, handle) && <h1 className="text-3xl font-bold p-4">{pageContent.title}</h1>}
						{pageContent.content}
					</>
				</div>
			</div>
		</div>
	);
}
