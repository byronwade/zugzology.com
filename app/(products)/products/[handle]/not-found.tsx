import Link from "next/link";

export default function ProductNotFound() {
	return (
		<div className="container mx-auto px-4 py-16 text-center">
			<h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
			<p className="text-neutral-600 mb-8">Sorry, we couldn't find the product you're looking for.</p>
			<Link prefetch={true} href="/products" className="inline-block rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
				Back to Products
			</Link>
		</div>
	);
}
