import { ImageResponse } from "next/og";
import { getArticleByHandles } from "@/lib/api/shopify/actions";
import { getStoreConfigSafe } from "@/lib/config/store-config";

// Regex pattern for word splitting (moved to top level for performance)
const WHITESPACE_REGEX = /\s+/;

export const runtime = "edge";
export const alt = "Blog Post Image";
export const size = {
	width: 1200,
	height: 630,
};
export const contentType = "image/png";

/**
 * Dynamic Open Graph image for blog posts
 * Shows featured image, title, author, and reading time
 */
export default async function BlogPostOpengraphImage({ params }: { params: { blog: string; slug: string } }) {
	const { blog, slug } = await params;
	const config = getStoreConfigSafe();

	try {
		const article = await getArticleByHandles(blog, slug);

		if (!article) {
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
					<div style={{ fontSize: 40 }}>Article Not Found</div>
				</div>,
				{ ...size }
			);
		}

		const articleImage = article.image?.url;
		const authorName = article.author?.name || "Zugzology Team";
		const publishDate = article.publishedAt
			? new Date(article.publishedAt).toLocaleDateString("en-US", {
					month: "long",
					day: "numeric",
					year: "numeric",
				})
			: "";

		// Calculate reading time
		const wordCount = article.content ? article.content.split(WHITESPACE_REGEX).length : 0;
		const readingTime = Math.ceil(wordCount / 200);

		return new ImageResponse(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					background: "white",
					fontFamily: "system-ui, sans-serif",
				}}
			>
				{/* Featured Image */}
				{articleImage ? (
					<div
						style={{
							height: "50%",
							width: "100%",
							display: "flex",
							position: "relative",
						}}
					>
						{/* biome-ignore lint/performance/noImgElement: ImageResponse doesn't support Next.js Image component */}
						<img
							alt={article.title}
							height={630}
							src={articleImage}
							style={{
								width: "100%",
								height: "100%",
								objectFit: "cover",
							}}
							width={1200}
						/>
						<div
							style={{
								position: "absolute",
								bottom: 0,
								left: 0,
								right: 0,
								height: "100px",
								background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
							}}
						/>
					</div>
				) : (
					<div
						style={{
							height: "50%",
							width: "100%",
							background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<div style={{ fontSize: "100px" }}>📝</div>
					</div>
				)}

				{/* Content Section */}
				<div
					style={{
						height: "50%",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						padding: "40px 50px",
					}}
				>
					{/* Blog Category Badge */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							marginBottom: "15px",
						}}
					>
						<div
							style={{
								background: "#7c3aed",
								color: "white",
								padding: "8px 20px",
								borderRadius: "20px",
								fontSize: "16px",
								fontWeight: "600",
								textTransform: "uppercase",
							}}
						>
							{article.blog?.title || "BLOG"}
						</div>
					</div>

					{/* Article Title */}
					<h1
						style={{
							fontSize: "42px",
							fontWeight: "bold",
							color: "#111827",
							margin: 0,
							lineHeight: 1.2,
							overflow: "hidden",
							textOverflow: "ellipsis",
							display: "-webkit-box",
							WebkitLineClamp: 2,
							WebkitBoxOrient: "vertical",
							flex: 1,
						}}
					>
						{article.title}
					</h1>

					{/* Author & Meta Info */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginTop: "20px",
							paddingTop: "20px",
							borderTop: "2px solid #e5e7eb",
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "15px",
							}}
						>
							{/* Author Avatar */}
							<div
								style={{
									width: "50px",
									height: "50px",
									borderRadius: "50%",
									background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									color: "white",
									fontSize: "22px",
									fontWeight: "bold",
								}}
							>
								{authorName.charAt(0)}
							</div>

							{/* Author Info */}
							<div
								style={{
									display: "flex",
									flexDirection: "column",
								}}
							>
								<div
									style={{
										fontSize: "20px",
										fontWeight: "600",
										color: "#111827",
									}}
								>
									{authorName}
								</div>
								<div
									style={{
										fontSize: "16px",
										color: "#6b7280",
									}}
								>
									{publishDate} · {readingTime} min read
								</div>
							</div>
						</div>

						{/* Brand Logo */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "10px",
							}}
						>
							<div style={{ fontSize: "32px" }}>🍄</div>
							<div
								style={{
									fontSize: "24px",
									fontWeight: "bold",
									color: "#7c3aed",
								}}
							>
								{config.storeName}
							</div>
						</div>
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
				<div style={{ fontSize: 40 }}>Error Loading Article</div>
			</div>,
			{ ...size }
		);
	}
}
