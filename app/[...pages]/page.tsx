export default function DynamicPage({ params }: { params: { pages: string[] } }) {
	// params.pages will be an array of path segments
	// e.g., for "/shop/products" it will be ["shop", "products"]

	// You can add your routing logic here based on params.pages
	return <div>{/* Your dynamic page content */}</div>;
}
