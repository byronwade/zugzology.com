"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import type { MouseEvent } from "react";
import { PrefetchLink } from "@/components/ui/prefetch-link";
import type { ShopifyProduct } from "@/lib/types";

type ProductPreviewCardProps = {
	product?: ShopifyProduct;
};

export function ProductPreviewCard({ product }: ProductPreviewCardProps) {
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
	const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

	const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
	const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

	const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;
		const xPct = mouseX / width - 0.5;
		const yPct = mouseY / height - 0.5;
		x.set(xPct);
		y.set(yPct);
	};

	const handleMouseLeave = () => {
		x.set(0);
		y.set(0);
	};

	if (!product?.images?.nodes?.[0]) {
		return null;
	}

	const image = product.images.nodes[0];
	const firstVariant = product.variants?.nodes?.[0];
	const price = firstVariant?.price?.amount;
	const compareAtPrice = firstVariant?.compareAtPrice?.amount;
	const hasDiscount = compareAtPrice && Number.parseFloat(compareAtPrice) > Number.parseFloat(price || "0");

	return (
		<motion.div
			animate={{ opacity: 1, scale: 1 }}
			className="group perspective-1000 relative h-full w-full"
			initial={{ opacity: 0, scale: 0.9 }}
			onMouseLeave={handleMouseLeave}
			onMouseMove={handleMouseMove}
			transition={{ duration: 0.8, delay: 0.6 }}
		>
			<motion.div
				className="relative h-full w-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-2xl transition-all duration-500"
				style={{
					rotateX,
					rotateY,
					transformStyle: "preserve-3d",
				}}
				whileHover={{ scale: 1.02 }}
			>
				{/* Glow effect */}
				<div className="-inset-px pointer-events-none absolute rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
					<div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-2xl" />
				</div>

				{/* Badge */}
				{hasDiscount && (
					<motion.div
						animate={{ scale: 1, rotate: 0 }}
						className="absolute top-6 right-6 z-20 rounded-full bg-primary px-3 py-1 font-semibold text-sm text-white shadow-lg"
						initial={{ scale: 0, rotate: -180 }}
						transition={{ duration: 0.5, delay: 1 }}
					>
						Sale
					</motion.div>
				)}

				{/* Product Image */}
				<motion.div
					className="relative mb-6 aspect-square overflow-hidden rounded-2xl bg-white/5"
					style={{ transformStyle: "preserve-3d", transform: "translateZ(50px)" }}
				>
					<Image
						alt={product.title}
						className="object-cover transition-transform duration-700 group-hover:scale-110"
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						src={image.url}
					/>

					{/* Image overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
				</motion.div>

				{/* Product Info */}
				<motion.div className="relative z-10" style={{ transformStyle: "preserve-3d", transform: "translateZ(75px)" }}>
					<h3 className="mb-2 line-clamp-2 font-bold text-white text-xl">{product.title}</h3>

					{product.description && (
						<p className="mb-4 line-clamp-2 text-sm text-white/60">{product.description.slice(0, 100)}...</p>
					)}

					{/* Price */}
					{price && (
						<div className="mb-4 flex items-baseline gap-2">
							<span className="font-bold text-2xl text-primary">${price}</span>
							{hasDiscount && compareAtPrice && (
								<span className="text-sm text-white/40 line-through">${compareAtPrice}</span>
							)}
						</div>
					)}

					{/* CTA */}
					<PrefetchLink className="block" href={`/products/${product.handle}`}>
						<motion.button
							className="w-full rounded-xl bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/20"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							View Product
						</motion.button>
					</PrefetchLink>
				</motion.div>

				{/* Shimmer effect */}
				<motion.div
					animate={{
						background: [
							"linear-gradient(90deg, transparent 0%, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%, transparent 100%)",
							"linear-gradient(90deg, transparent 0%, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%, transparent 100%)",
						],
						backgroundPosition: ["-200% 0", "200% 0"],
					}}
					className="pointer-events-none absolute inset-0 rounded-3xl"
					transition={{
						duration: 3,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
				/>
			</motion.div>
		</motion.div>
	);
}
