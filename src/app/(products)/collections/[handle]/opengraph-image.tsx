import { ImageResponse } from "next/og";
import { getCollection } from "@/lib/api/shopify/actions";
import { getStoreConfigSafe } from "@/lib/config/store-config";

export const runtime = "edge";
export const alt = "Collection Image";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

/**
 * Dynamic Open Graph image for collection pages
 * Shows collection image, title, and product count
 */
export default async function CollectionOpengraphImage({ params }: { params: { handle: string } }) {
	const { handle } = await params;
	const config = getStoreConfigSafe();

	try {
		const collection = await getCollection(handle);

		if (!collection) {
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
					<div style={{ fontSize: 40 }}>Collection Not Found</div>
				</div>,
				{ ...size }
			);
		}

		const collectionImage = collection.image?.url;
		const productCount = collection.productsCount || 0;

		return new ImageResponse(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					fontFamily: "system-ui, sans-serif",
					position: "relative",
				}}
			>
				{/* Background Image with Overlay */}
				{collectionImage && (
					<>
						{/* biome-ignore lint/performance/noImgElement: ImageResponse doesn't support Next.js Image component */}
						<img
							alt={collection.title}
							height={630}
							src={collectionImage}
							style={{
								position: "absolute",
								width: "100%",
								height: "100%",
								objectFit: "cover",
								opacity: 0.3,
							}}
							width={1200}
						/>
						<div
							style={{
								position: "absolute",
								width: "100%",
								height: "100%",
								background: "linear-gradient(135deg, rgba(102,126,234,0.9) 0%, rgba(118,75,162,0.9) 100%)",
							}}
						/>
					</>
				)}

				{/* Content */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						padding: "80px",
						zIndex: 10,
						width: "100%",
					}}
				>
					{/* Category Badge */}
					<div
						style={{
							background: "rgba(255,255,255,0.2)",
							backdropFilter: "blur(10px)",
							padding: "12px 24px",
							borderRadius: "50px",
							fontSize: "20px",
							color: "white",
							fontWeight: "600",
							marginBottom: "30px",
							width: "fit-content",
							border: "2px solid rgba(255,255,255,0.3)",
						}}
					>
						COLLECTION
					</div>

					{/* Collection Title */}
					<h1
						style={{
							fontSize: "72px",
							fontWeight: "bold",
							color: "white",
							margin: 0,
							marginBottom: "20px",
							lineHeight: 1.1,
							overflow: "hidden",
							textOverflow: "ellipsis",
							display: "-webkit-box",
							WebkitLineClamp: 2,
							WebkitBoxOrient: "vertical",
						}}
					>
						{collection.title}
					</h1>

					{/* Description */}
					{collection.description && (
						<p
							style={{
								fontSize: "28px",
								color: "rgba(255,255,255,0.9)",
								margin: 0,
								marginBottom: "30px",
								maxWidth: "900px",
								overflow: "hidden",
								textOverflow: "ellipsis",
								display: "-webkit-box",
								WebkitLineClamp: 2,
								WebkitBoxOrient: "vertical",
							}}
						>
							{collection.description.replace(/<[^>]*>/g, "")}
						</p>
					)}

					{/* Product Count Badge */}
					<div
						style={{
							display: "flex",
							gap: "20px",
							alignItems: "center",
						}}
					>
						<div
							style={{
								background: "white",
								color: "#7c3aed",
								padding: "15px 30px",
								borderRadius: "50px",
								fontSize: "28px",
								fontWeight: "700",
							}}
						>
							{productCount} {productCount === 1 ? "Product" : "Products"}
						</div>
						<div
							style={{
								background: "rgba(255,255,255,0.2)",
								backdropFilter: "blur(10px)",
								padding: "15px 30px",
								borderRadius: "50px",
								fontSize: "24px",
								color: "white",
								fontWeight: "600",
								border: "2px solid rgba(255,255,255,0.3)",
							}}
						>
							Free Shipping
						</div>
					</div>
				</div>

				{/* Brand Name */}
				<div
					style={{
						position: "absolute",
						bottom: "40px",
						right: "40px",
						display: "flex",
						alignItems: "center",
						gap: "15px",
					}}
				>
					<div
						style={{
							fontSize: "32px",
							fontWeight: "bold",
							color: "white",
						}}
					>
						{config.storeName}
					</div>
					<div
						style={{
							fontSize: "20px",
							color: "rgba(255,255,255,0.7)",
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
				<div style={{ fontSize: 40 }}>Error Loading Collection</div>
			</div>,
			{ ...size }
		);
	}
}
