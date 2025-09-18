"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import { getProductReviews, getProductStats, submitReview } from "@/lib/trustoo";
import { Star, ThumbsUp, Check, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TrustooReviewsProps {
	productId: string;
	productSku?: string;
}

function ReviewSkeleton() {
	return (
		<div className="space-y-4 animate-pulse">
			<div className="flex items-center space-x-4">
				<div className="w-12 h-12 bg-gray-200 rounded-full" />
				<div className="space-y-2">
					<div className="h-4 w-32 bg-gray-200 rounded" />
					<div className="h-3 w-24 bg-gray-200 rounded" />
				</div>
			</div>
			<div className="space-y-2">
				<div className="h-4 w-3/4 bg-gray-200 rounded" />
				<div className="h-4 w-full bg-gray-200 rounded" />
				<div className="h-4 w-2/3 bg-gray-200 rounded" />
			</div>
		</div>
	);
}

interface ReviewFormProps {
	productId: string;
	productSku?: string;
	onSuccess?: () => void;
}

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
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="space-y-2">
				<Label>Your Rating*</Label>
				<div className="flex items-center space-x-1">
					{[1, 2, 3, 4, 5].map((star) => (
						<Star key={star} className={`h-8 w-8 cursor-pointer transition-colors ${star <= (hoveredRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-neutral-300"}`} onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)} onClick={() => setRating(star)} />
					))}
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="title">Review Title*</Label>
				<Input id="title" value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} placeholder="Summarize your experience" required />
			</div>

			<div className="space-y-2">
				<Label htmlFor="content">Your Review*</Label>
				<Textarea id="content" value={formData.content} onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))} placeholder="Share your experience with this product" rows={4} required />
			</div>

			<div className="space-y-2">
				<Label htmlFor="author">Your Name*</Label>
				<Input id="author" value={formData.author} onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))} placeholder="Enter your name" required />
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Your Email*</Label>
				<Input id="email" type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} placeholder="Enter your email" required />
				<p className="text-xs text-neutral-500">Your email will not be published</p>
			</div>

			<div className="space-y-2">
				<Label>Photos (optional)</Label>
				<div className="flex flex-wrap gap-2">
					{images.map((image, index) => (
						<div key={index} className="relative group">
							<NextImage src={URL.createObjectURL(image)} alt={`Upload ${index + 1}`} width={80} height={80} className="w-20 h-20 object-cover rounded-md" unoptimized />
							<button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
								×
							</button>
						</div>
					))}
					{images.length < 5 && (
						<label className="w-20 h-20 flex items-center justify-center border-2 border-dashed rounded-md cursor-pointer hover:border-primary transition-colors">
							<input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
							<Upload className="h-6 w-6 text-neutral-400" />
						</label>
					)}
				</div>
				<p className="text-xs text-neutral-500">You can upload up to 5 images (PNG, JPG)</p>
			</div>

			<Button type="submit" className="w-full" disabled={submitting}>
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
				const [reviewsData, statsData] = await Promise.all([getProductReviews(productId, page), getProductStats(productId)]);

				setReviews((prev) => (page === 1 ? reviewsData.reviews : [...prev, ...reviewsData.reviews]));
				setTotal(reviewsData.total);
				setStats(statsData);
			} catch (error) {
				console.error("Error loading reviews:", error);
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
				<h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
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
				<div className="text-center mb-8">
					<h2 className="text-2xl font-bold mb-2">Be the First to Review</h2>
					<p className="text-neutral-600">Share your experience with this product and help other shoppers make informed decisions.</p>
				</div>
				<div className="max-w-2xl mx-auto">
					<ReviewForm productId={productId} productSku={productSku} />
				</div>
			</section>
		);
	}

	return (
		<section className="my-8">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-2xl font-bold">Customer Reviews</h2>
				{stats && (
					<div className="flex items-center space-x-4">
						<div className="flex items-center">
							{[...Array(5)].map((_, i) => (
								<Star key={i} className={`h-5 w-5 ${i < Math.floor(stats.averageRating) ? "text-yellow-400 fill-yellow-400" : "text-neutral-300"}`} />
							))}
						</div>
						<span className="text-sm text-neutral-600">
							{stats.averageRating.toFixed(1)} ({stats.totalReviews} reviews)
						</span>
					</div>
				)}
			</div>

			<div className="space-y-8">
				{reviews.map((review) => (
					<div key={review.id} className="border-b pb-6 last:border-0">
						<div className="flex items-start justify-between mb-4">
							<div>
								<div className="flex items-center space-x-2 mb-2">
									{[...Array(5)].map((_, i) => (
										<Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-300"}`} />
									))}
								</div>
								<h3 className="font-semibold mb-1">{review.title}</h3>
								<p className="text-sm text-neutral-600 mb-2">
									By {review.author} on {format(new Date(review.createdAt), "MMM d, yyyy")}
								</p>
							</div>
							{review.verifiedPurchase && (
								<div className="flex items-center text-green-600 text-sm">
									<Check className="h-4 w-4 mr-1" />
									Verified Purchase
								</div>
							)}
						</div>

						<p className="text-neutral-700 mb-4">{review.content}</p>

						{review.images && review.images.length > 0 && (
							<div className="flex items-center space-x-2 mb-4">
								<ImageIcon className="h-4 w-4 text-neutral-500" />
								<span className="text-sm text-neutral-600">
									{review.images.length} image{review.images.length !== 1 ? "s" : ""}
								</span>
							</div>
						)}

						{review.likes && review.likes > 0 && (
							<div className="flex items-center text-sm text-neutral-600">
								<ThumbsUp className="h-4 w-4 mr-1" />
								{review.likes} helpful
							</div>
						)}

						{review.response && (
							<div className="mt-4 pl-4 border-l-2 border-neutral-200">
								<p className="text-sm font-semibold mb-1">Response from Zugzology:</p>
								<p className="text-sm text-neutral-700">{review.response.content}</p>
								<p className="text-xs text-neutral-500 mt-1">{format(new Date(review.response.createdAt), "MMM d, yyyy")}</p>
							</div>
						)}
					</div>
				))}
			</div>

			{reviews.length < total && (
				<div className="mt-6 text-center">
					<Button variant="outline" onClick={loadMore} disabled={loading}>
						{loading ? "Loading..." : "Load More Reviews"}
					</Button>
				</div>
			)}

			{/* Add review button for products with existing reviews */}
			<div className="mt-8 text-center">
				<Button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}>Write a Review</Button>
			</div>

			{/* Review form at the bottom for products with existing reviews */}
			<div className="mt-12 pt-8 border-t">
				<h3 className="text-xl font-bold mb-6">Write a Review</h3>
				<ReviewForm productId={productId} productSku={productSku} />
			</div>
		</section>
	);
}

// Add TypeScript declaration for Trustoo
declare global {
	interface Window {
		trustoo: (command: string, options?: any) => void;
	}
}
