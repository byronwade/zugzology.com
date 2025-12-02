import { ImageResponse } from "next/og";
import { getProductPageData } from "@/lib/api/shopify/actions";
import { getStoreConfigSafe } from "@/lib/config/store-config";

export const runtime = "edge";
export const alt = "Product Image";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

/**
 * Dynamic Open Graph image for product pages
 * Shows product image, title, price, and availability
 */
export default async function ProductOpengraphImage({ params }: { params: { handle: string } }) {
	const { handle } = await params;
	const config = getStoreConfigSafe();

	try {
		const { product } = await getProductPageData(handle);

		if (!product) {
			// Fallback to default OG image
			return new ImageResponse(
				<div
					style={{
						height: "100%",
						width: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: "#f3f4f6",
					}}
				>
					<div style={{ fontSize: 40 }}>Product Not Found</div>
				</div>,
				{ ...size }
			);
		}

		const productImage = product.images?.nodes?.[0]?.url;
		const price = product.priceRange?.minVariantPrice?.amount || "0";
		const currency = product.priceRange?.minVariantPrice?.currencyCode || "USD";
		const formattedPrice = new Intl.NumberFormat("en-US", {
			style: "currency",
			currency,
		}).format(Number.parseFloat(price));

		const availability = product.availableForSale ? "In Stock" : "Out of Stock";

		return new ImageResponse(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					background: "white",
					fontFamily: "system-ui, sans-serif",
				}}
			>
				{/* Product Image Section */}
				<div
					style={{
						width: "50%",
						height: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						background: "#f9fafb",
						position: "relative",
					}}
				>
					{productImage ? (
						// biome-ignore lint/performance/noImgElement: ImageResponse doesn't support Next.js Image component
						<img
							alt={product.title}
							src={productImage}
							width={1200}
							height={630}
							style={{
								width: "90%",
								height: "90%",
								objectFit: "contain",
							}}
						/>
					) : (
						<div
							style={{
								fontSize: 100,
							}}
						>
							🍄
						</div>
					)}
				</div>

				{/* Product Info Section */}
				<div
					style={{
						width: "50%",
						height: "100%",
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						padding: "60px",
						background: "white",
					}}
				>
					{/* Brand */}
					<div
						style={{
							fontSize: "20px",
							color: "#6b7280",
							marginBottom: "15px",
							fontWeight: "600",
							textTransform: "uppercase",
							letterSpacing: "0.05em",
						}}
					>
						{product.vendor || config.storeName}
					</div>

					{/* Product Title */}
					<h1
						style={{
							fontSize: "48px",
							fontWeight: "bold",
							color: "#111827",
							margin: 0,
							marginBottom: "20px",
							lineHeight: 1.2,
							overflow: "hidden",
							textOverflow: "ellipsis",
							display: "-webkit-box",
							WebkitLineClamp: 2,
							WebkitBoxOrient: "vertical",
						}}
					>
						{product.title}
					</h1>

					{/* Price */}
					<div
						style={{
							fontSize: "56px",
							fontWeight: "bold",
							color: "#7c3aed",
							marginBottom: "25px",
						}}
					>
						{formattedPrice}
					</div>

					{/* Badges */}
					<div
						style={{
							display: "flex",
							gap: "15px",
							flexWrap: "wrap",
						}}
					>
						<div
							style={{
								background: product.availableForSale ? "#10b981" : "#ef4444",
								color: "white",
								padding: "10px 20px",
								borderRadius: "25px",
								fontSize: "18px",
								fontWeight: "600",
							}}
						>
							{availability}
						</div>
						<div
							style={{
								background: "#f3f4f6",
								color: "#4b5563",
								padding: "10px 20px",
								borderRadius: "25px",
								fontSize: "18px",
								fontWeight: "600",
							}}
						>
							Free Shipping
						</div>
					</div>

					{/* Domain */}
					<div
						style={{
							position: "absolute",
							bottom: "40px",
							fontSize: "18px",
							color: "#9ca3af",
							fontWeight: "500",
						}}
					>
						{config.storeDomain}
					</div>
				</div>
			</div>,
			{
				...size,
			}
		);
	} catch {
		// Fallback error image
		return new ImageResponse(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#f3f4f6",
				}}
			>
				<div style={{ fontSize: 40 }}>Error Loading Product</div>
			</div>,
			{ ...size }
		);
	}
}
