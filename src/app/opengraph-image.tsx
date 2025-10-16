import { ImageResponse } from "next/og";
import { getStoreConfigSafe } from "@/lib/config/store-config";

export const runtime = "edge";
export const alt = "Zugzology - Premium Mushroom Cultivation Supplies";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

/**
 * Default Open Graph image for homepage and fallback
 * Uses Next.js ImageResponse API with Tailwind-like styling
 */
export default async function OpengraphImage() {
	const config = getStoreConfigSafe();

	return new ImageResponse(
		(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					fontFamily: "system-ui, sans-serif",
				}}
			>
				{/* Background Pattern */}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background:
							"radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
					}}
				/>

				{/* Content Container */}
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						padding: "80px",
						textAlign: "center",
						zIndex: 10,
					}}
				>
					{/* Logo/Icon */}
					<div
						style={{
							width: "120px",
							height: "120px",
							borderRadius: "30px",
							background: "white",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							marginBottom: "40px",
							fontSize: "60px",
						}}
					>
						🍄
					</div>

					{/* Brand Name */}
					<h1
						style={{
							fontSize: "72px",
							fontWeight: "bold",
							color: "white",
							margin: 0,
							marginBottom: "20px",
							letterSpacing: "-0.02em",
						}}
					>
						{config.storeName}
					</h1>

					{/* Tagline */}
					<p
						style={{
							fontSize: "32px",
							color: "rgba(255,255,255,0.9)",
							margin: 0,
							marginBottom: "30px",
							maxWidth: "800px",
						}}
					>
						Premium Mushroom Cultivation Supplies
					</p>

					{/* Badge/CTA */}
					<div
						style={{
							display: "flex",
							gap: "20px",
							alignItems: "center",
						}}
					>
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
							✓ Free Shipping Over $75
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
							✓ Expert Support
						</div>
					</div>
				</div>

				{/* Footer Domain */}
				<div
					style={{
						position: "absolute",
						bottom: "40px",
						right: "40px",
						fontSize: "20px",
						color: "rgba(255,255,255,0.7)",
						fontWeight: "500",
					}}
				>
					{config.storeDomain}
				</div>
			</div>
		),
		{
			...size,
		}
	);
}
