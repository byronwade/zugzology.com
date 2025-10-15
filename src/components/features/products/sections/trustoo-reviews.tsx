"use client";

import { format } from "date-fns";
import { Check, Image as ImageIcon, Loader2, Star, ThumbsUp, Upload } from "lucide-react";
import NextImage from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getProductReviews, getProductStats, submitReview } from "@/lib/trustoo";

type TrustooReviewsProps = {
	productId: string;
	productSku?: string;
};

function ReviewSkeleton() {
	return (
		<div className="animate-pulse space-y-4">
			<div className="flex items-center space-x-4">
				<div className="h-12 w-12 rounded-full bg-muted" />
				<div className="space-y-2">
					<div className="h-4 w-32 rounded bg-muted" />
					<div className="h-3 w-24 rounded bg-muted" />
				</div>
			</div>
			<div className="space-y-2">
				<div className="h-4 w-3/4 rounded bg-muted" />
				<div className="h-4 w-full rounded bg-muted" />
				<div className="h-4 w-2/3 rounded bg-muted" />
			</div>
		</div>
	);
}

type ReviewFormProps = {
	productId: string;
	productSku?: string;
	onSuccess?: () => void;
};

function ReviewForm({ productId, productSku, onSuccess }: ReviewFormProps) {
	const [rating, setRating] = useState(0);
	const [hoveredRating, setHoveredRating] = useState(0);
	const [images, setImages] = useState<File[]>([]);
	const [submitting, setSubmitting] = useState(false);
	const [formData, setFormData] = useState({
		title: "",
		content: "",
		author: "",
		email: "",
	});

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const newImages = Array.from(e.target.files);
			setImages((prev) => [...prev, ...newImages].slice(0, 5)); // Limit to 5 images
		}
	};

	const removeImage = (index: number) => {
		setImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate form
		if (!rating) {
			toast.error("Please select a rating");
			return;
		}
		if (!formData.title.trim()) {
			toast.error("Please enter a review title");
			return;
		}
		if (!formData.content.trim()) {
			toast.error("Please enter your review");
			return;
		}
		if (!formData.author.trim()) {
			toast.error("Please enter your name");
			return;
		}
		if (!formData.email.trim()) {
			toast.error("Please enter your email");
			return;
		}

		setSubmitting(true);
		try {
			const result = await submitReview({
				productId,
				productSku,
				rating,
				...formData,
				images,
			});

			if (result.success) {
				toast.success("Review submitted successfully!");
				// Reset form
				setRating(0);
				setImages([]);
				setFormData({
					title: "",
					content: "",
					author: "",
					email: "",
				});
				onSuccess?.();
			} else {
				toast.error(result.message || "Failed to submit review");
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to submit review");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form className="space-y-6" onSubmit={handleSubmit}>
			<div className="space-y-2">
				<Label>Your Rating*</Label>
				<div className="flex items-center space-x-1">
					{[1, 2, 3, 4, 5].map((star) => (
						<Star
							className={`h-8 w-8 cursor-pointer transition-colors ${star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"}`}
							key={star}
							onClick={() => setRating(star)}
							onMouseEnter={() => setHoveredRating(star)}
							onMouseLeave={() => setHoveredRating(0)}
						/>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="title">Review Title*</Label>
				<Input
					id="title"
					onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
					placeholder="Summarize your experience"
					required
					value={formData.title}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="content">Your Review*</Label>
				<Textarea
					id="content"
					onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
					placeholder="Share your experience with this product"
					required
					rows={4}
					value={formData.content}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="author">Your Name*</Label>
				<Input
					id="author"
					onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
					placeholder="Enter your name"
					required
					value={formData.author}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Your Email*</Label>
				<Input
					id="email"
					onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
					placeholder="Enter your email"
					required
					type="email"
					value={formData.email}
				/>
				<p className="text-neutral-500 text-xs">Your email will not be published</p>
			</div>

			<div className="space-y-2">
				<Label>Photos (optional)</Label>
				<div className="flex flex-wrap gap-2">
					{images.map((image, index) => (
						<div className="group relative" key={index}>
							<NextImage
								alt={`Upload ${index + 1}`}
								className="h-20 w-20 rounded-md object-cover"
								height={80}
								src={URL.createObjectURL(image)}
								unoptimized
								width={80}
							/>
							<button
								className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
								onClick={() => removeImage(index)}
								type="button"
							>
								×
							</button>
						</div>
					))}
					{images.length < 5 && (
						<label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border-2 border-dashed transition-colors hover:border-primary">
							<input accept="image/*" className="hidden" multiple onChange={handleImageUpload} type="file" />
							<Upload className="h-6 w-6 text-neutral-400" />
						</label>
					)}
				</div>
				<p className="text-neutral-500 text-xs">You can upload up to 5 images (PNG, JPG)</p>
			</div>

			<Button className="w-full" disabled={submitting} type="submit">
				{submitting ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Submitting...
					</>
				) : (
					"Submit Review"
				)}
			</Button>
		</form>
	);
}

export function TrustooReviews({ productId, productSku }: TrustooReviewsProps) {
	const [page, setPage] = useState(1);
	const [reviews, setReviews] = useState<any[]>([]);
	const [stats, setStats] = useState<any>(null);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadReviews() {
			setLoading(true);
			try {
				const [reviewsData, statsData] = await Promise.all([
					getProductReviews(productId, page),
					getProductStats(productId),
				]);

				setReviews((prev) => (page === 1 ? reviewsData.reviews : [...prev, ...reviewsData.reviews]));
				setTotal(reviewsData.total);
				setStats(statsData);
			} catch (_error) {
			} finally {
				setLoading(false);
			}
		}

		loadReviews();
	}, [productId, page]);

	const loadMore = () => setPage((prev) => prev + 1);

	if (loading && page === 1) {
		return (
			<section className="my-8 space-y-8">
				<h2 className="mb-4 font-bold text-2xl">Customer Reviews</h2>
				<div className="space-y-8">
					<ReviewSkeleton />
					<ReviewSkeleton />
					<ReviewSkeleton />
				</div>
			</section>
		);
	}

	// Show review form if there are no reviews
	if (!loading && total === 0) {
		return (
			<section className="my-8">
				<div className="mb-8 text-center">
					<h2 className="mb-2 font-bold text-2xl">Be the First to Review</h2>
					<p className="text-neutral-600">
						Share your experience with this product and help other shoppers make informed decisions.
					</p>
				</div>
				<div className="mx-auto max-w-2xl">
					<ReviewForm productId={productId} productSku={productSku} />
				</div>
			</section>
		);
	}

	return (
		<section className="my-8">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="font-bold text-2xl">Customer Reviews</h2>
				{stats && (
					<div className="flex items-center space-x-4">
						<div className="flex items-center">
							{[...new Array(5)].map((_, i) => (
								<Star
									className={`h-5 w-5 ${i < Math.floor(stats.averageRating) ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"}`}
									key={i}
								/>
							))}
						</div>
						<span className="text-neutral-600 text-sm">
							{stats.averageRating.toFixed(1)} ({stats.totalReviews} reviews)
						</span>
					</div>
				)}
			</div>

			<div className="space-y-8">
				{reviews.map((review) => (
					<div className="border-b pb-6 last:border-0" key={review.id}>
						<div className="mb-4 flex items-start justify-between">
							<div>
								<div className="mb-2 flex items-center space-x-2">
									{[...new Array(5)].map((_, i) => (
										<Star
											className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"}`}
											key={i}
										/>
									))}
								</div>
								<h3 className="mb-1 font-semibold">{review.title}</h3>
								<p className="mb-2 text-neutral-600 text-sm">
									By {review.author} on {format(new Date(review.createdAt), "MMM d, yyyy")}
								</p>
							</div>
							{review.verifiedPurchase && (
								<div className="flex items-center text-green-600 text-sm">
									<Check className="mr-1 h-4 w-4" />
									Verified Purchase
								</div>
							)}
						</div>

						<p className="mb-4 text-neutral-700">{review.content}</p>

						{review.images && review.images.length > 0 && (
							<div className="mb-4 flex items-center space-x-2">
								<ImageIcon className="h-4 w-4 text-neutral-500" />
								<span className="text-neutral-600 text-sm">
									{review.images.length} image{review.images.length !== 1 ? "s" : ""}
								</span>
							</div>
						)}

						{review.likes && review.likes > 0 && (
							<div className="flex items-center text-neutral-600 text-sm">
								<ThumbsUp className="mr-1 h-4 w-4" />
								{review.likes} helpful
							</div>
						)}

						{review.response && (
							<div className="mt-4 border-neutral-200 border-l-2 pl-4">
								<p className="mb-1 font-semibold text-sm">Response from Zugzology:</p>
								<p className="text-neutral-700 text-sm">{review.response.content}</p>
								<p className="mt-1 text-neutral-500 text-xs">
									{format(new Date(review.response.createdAt), "MMM d, yyyy")}
								</p>
							</div>
						)}
					</div>
				))}
			</div>

			{reviews.length < total && (
				<div className="mt-6 text-center">
					<Button disabled={loading} onClick={loadMore} variant="outline">
						{loading ? "Loading..." : "Load More Reviews"}
					</Button>
				</div>
			)}

			{/* Add review button for products with existing reviews */}
			<div className="mt-8 text-center">
				<Button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>
					Write a Review
				</Button>
			</div>

			{/* Review form at the bottom for products with existing reviews */}
			<div className="mt-12 border-t pt-8">
				<h3 className="mb-6 font-bold text-xl">Write a Review</h3>
				<ReviewForm productId={productId} productSku={productSku} />
			</div>
		</section>
	);
}
