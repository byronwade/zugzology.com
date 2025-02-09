"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Play, X, Share, ArrowRight } from "lucide-react";

interface Product {
	id: string;
	title: string;
	price: string;
	image: string;
}

interface Video {
	id: string;
	title: string;
	thumbnail: string;
	products?: Product[];
	isProductVideo?: boolean;
	embedUrl?: string;
}

const videos: Video[] = [
	{
		id: "wzMRjEDMdfs",
		title: "Growing Mushrooms at Home",
		thumbnail: "https://img.youtube.com/vi/wzMRjEDMdfs/maxresdefault.jpg",
		products: [
			{
				id: "1",
				title: "All-in-One Mushroom Grow Bag",
				price: "$29.99",
				image: "/images/products/grow-bag.jpg",
			},
			{
				id: "2",
				title: "Mushroom Spores Kit",
				price: "$19.99",
				image: "/images/products/spores-kit.jpg",
			},
		],
	},
	{
		id: "45b2t7fqhjA",
		title: "Mushroom Growing Guide",
		thumbnail: "https://img.youtube.com/vi/45b2t7fqhjA/maxresdefault.jpg",
		products: [
			{
				id: "3",
				title: "Premium Substrate Mix",
				price: "$24.99",
				image: "/images/products/substrate.jpg",
			},
		],
	},
	{
		id: "1Q0un2GPH70",
		title: "How to Use a Grow Bag",
		thumbnail: "https://img.youtube.com/vi/1Q0un2GPH70/maxresdefault.jpg",
		products: [
			{
				id: "4",
				title: "XL Mushroom Grow Bag",
				price: "$39.99",
				image: "/images/products/xl-bag.jpg",
			},
		],
	},
	{
		id: "6YGiTEqtSXs",
		title: "Mushroom Life Cycle",
		thumbnail: "https://img.youtube.com/vi/6YGiTEqtSXs/maxresdefault.jpg",
		products: [
			{
				id: "5",
				title: "Complete Growing Kit",
				price: "$49.99",
				image: "/images/products/complete-kit.jpg",
			},
		],
	},
];

// Helper function to get video ID from YouTube URL
function getYouTubeVideoId(url: string): string {
	const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^\/&\?]{10,12})/);
	return match?.[1] || "";
}

// Helper function to get video thumbnail URL with fallback
function getVideoThumbnail(videoId: string, fallbackUrl?: string): string {
	// Try multiple thumbnail qualities
	const thumbnailQualities = ["maxresdefault", "hqdefault", "mqdefault", "default"];

	if (videoId.includes("youtube.com") || videoId.includes("youtu.be")) {
		// For YouTube videos, use the first available thumbnail
		const id = getYouTubeVideoId(videoId);
		return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
	}

	// Return fallback image or a default placeholder
	return fallbackUrl || "/images/video-placeholder.jpg";
}

// Helper function to create video object from product media
function createVideoFromProductMedia(media: any): Video | null {
	if (!media?.node) return null;

	const { node } = media;
	if (node.mediaContentType !== "EXTERNAL_VIDEO" && node.mediaContentType !== "VIDEO") return null;

	const videoId = node.embedUrl ? getYouTubeVideoId(node.embedUrl) : "";
	if (!videoId && !node.sources?.[0]?.url) return null;

	return {
		id: videoId || node.sources[0].url,
		title: node.alt || "Product Video",
		thumbnail: node.previewImage?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
		isProductVideo: true,
		embedUrl: node.embedUrl || node.sources[0].url,
	};
}

export function VideoGallery({ product }: { product?: any }) {
	const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
	const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

	// Combine hardcoded videos with product videos if available
	const allVideos = useMemo(() => {
		const productVideos = product?.media?.edges?.map(createVideoFromProductMedia).filter(Boolean) || [];
		return [...videos, ...productVideos];
	}, [product]);

	const closeModal = useCallback(() => {
		setSelectedVideo(null);
		document.body.style.overflow = "unset";
	}, []);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeModal();
		};

		if (selectedVideo) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
		};
	}, [selectedVideo, closeModal]);

	return (
		<>
			{/* Video Modal */}
			{selectedVideo && (
				<div className="fixed inset-0 bg-black/95 z-50 flex">
					{/* Left Thumbnails */}
					<div className="w-24 bg-black/50 flex flex-col overflow-y-auto py-4 gap-2">
						{allVideos.map((video, index) => (
							<button
								key={video.id}
								onClick={() => {
									setSelectedVideo(video);
									setCurrentVideoIndex(index);
								}}
								className={`relative w-20 h-20 mx-auto rounded-lg overflow-hidden ${currentVideoIndex === index ? "ring-2 ring-white" : ""}`}
							>
								<img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
							</button>
						))}
					</div>

					{/* Main Content */}
					<div className="flex-1 flex flex-col relative">
						{/* Video Player */}
						<div className="flex-1 flex items-center justify-center p-8">
							<div className="relative w-full h-full">
								<iframe className="absolute inset-0 w-full h-full rounded-lg" src={selectedVideo.isProductVideo && !selectedVideo.embedUrl?.includes("youtube") ? selectedVideo.id : `https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`} title={selectedVideo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
							</div>
						</div>
					</div>

					{/* Right Product Sidebar */}
					<div className="w-[400px] bg-white overflow-y-auto">
						<div className="p-6">
							{/* Control Buttons */}
							<div className="flex justify-end gap-2 mb-6">
								<button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" title="Share video">
									<Share className="w-5 h-5 text-gray-600" />
								</button>
								<button onClick={closeModal} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors" title="Close video">
									<X className="w-5 h-5 text-gray-600" />
								</button>
							</div>

							<h3 className="text-xl font-bold mb-4">Products in this video</h3>
							<div className="space-y-6">
								{selectedVideo.products?.map((product) => (
									<div key={product.id} className="flex gap-4 items-center">
										<div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
											<img src={product.image} alt={product.title} className="w-full h-full object-cover" />
										</div>
										<div className="flex-1">
											<h4 className="font-semibold">{product.title}</h4>
											<p className="text-lg font-bold text-blue-600">{product.price}</p>
											<button className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-700">
												View Product <ArrowRight className="w-4 h-4 ml-1" />
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Video Grid */}
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
				{allVideos.map((video) => (
					<button key={video.id} onClick={() => setSelectedVideo(video)} className="group relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: "177.78%" }}>
						<div className="absolute inset-0">
							<img
								src={video.thumbnail || getVideoThumbnail(video.id)}
								alt={video.title}
								className="w-full h-full object-cover"
								onError={(e) => {
									const target = e.target as HTMLImageElement;
									target.src = "/images/video-placeholder.jpg";
								}}
							/>
							<div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
								<Play className="w-12 h-12 text-white opacity-90 group-hover:opacity-100 transition-opacity" />
							</div>
						</div>
					</button>
				))}
			</div>
		</>
	);
}
