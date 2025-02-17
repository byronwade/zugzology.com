"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { ShopifyMediaImage, ShopifyMediaVideo, YouTubeVideo, ShopifyExternalVideo, ShopifyProduct } from "@/lib/types";

interface ProductMedia {
	url: string;
	altText: string | null;
	width: number;
	height: number;
	type: "image" | "video" | "youtube" | "external_video";
	videoSources?: Array<{
		url: string;
		mimeType: string;
	}>;
	previewImage?: {
		url: string;
		altText: string | null;
	};
}

interface ProductGalleryProps {
	media: (ShopifyMediaImage | ShopifyMediaVideo | ShopifyExternalVideo)[];
	title: string;
	selectedIndex?: number;
	onMediaSelect?: (index: number) => void;
	product?: ShopifyProduct;
}

interface ThumbnailButtonProps {
	media: ShopifyMediaImage | ShopifyMediaVideo | ShopifyExternalVideo | YouTubeVideo;
	index: number;
	isActive: boolean;
	onClick: () => void;
	onMouseEnter: () => void;
	layout?: "desktop" | "mobile";
}

// Separate thumbnail component
const ThumbnailButton = ({ media, index, isActive, onClick, onMouseEnter, layout = "desktop" }: ThumbnailButtonProps) => {
	const isVideo = media.mediaContentType === "VIDEO";
	const isYouTube = media.mediaContentType === "YOUTUBE";
	const isExternalVideo = media.mediaContentType === "EXTERNAL_VIDEO";

	let thumbnailUrl: string | undefined;
	let thumbnailAlt: string | null = null;

	if (isYouTube) {
		thumbnailUrl = (media as YouTubeVideo).thumbnail?.url;
		thumbnailAlt = (media as YouTubeVideo).thumbnail?.altText || null;
	} else if (isVideo) {
		thumbnailUrl = (media as ShopifyMediaVideo).previewImage?.url;
		thumbnailAlt = (media as ShopifyMediaVideo).previewImage?.altText;
	} else if (isExternalVideo) {
		thumbnailUrl = (media as ShopifyExternalVideo).previewImage?.url;
		thumbnailAlt = (media as ShopifyExternalVideo).previewImage?.altText;
	} else {
		thumbnailUrl = (media as ShopifyMediaImage).image?.url;
		thumbnailAlt = (media as ShopifyMediaImage).image?.altText;
	}

	if (!thumbnailUrl) return null;

	return (
		<button onClick={onClick} onMouseEnter={onMouseEnter} className={cn("relative rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-foreground/10", "hover:border-foreground transition duration-200", layout === "desktop" ? "w-16 h-16" : "aspect-square w-[70px]", isActive && (layout === "desktop" ? "border-foreground" : "ring-2 ring-offset-2 ring-primary"))}>
			<div className="absolute inset-0 overflow-hidden rounded-lg">
				<Image src={thumbnailUrl} alt={thumbnailAlt || ""} fill className="object-cover" sizes={layout === "desktop" ? "64px" : "(max-width: 768px) 70px, 64px"} />
				{(isVideo || isYouTube || isExternalVideo) && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/30">
						<Play className="w-4 h-4 text-white" />
					</div>
				)}
			</div>
		</button>
	);
};

// Helper function to extract YouTube video ID
const getYouTubeId = (url: string) => {
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = url.match(regExp);
	return match && match[2].length === 11 ? match[2] : null;
};

// Helper function to get YouTube embed URL
const getYouTubeEmbedUrl = (url: string) => {
	const videoId = getYouTubeId(url);
	return videoId ? `https://www.youtube.com/embed/${videoId}?playsinline=1&enablejsapi=1&rel=0` : "";
};

// Helper function to get YouTube thumbnail
const getYouTubeThumbnail = (videoId: string) => {
	return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

// Helper function to get media array
const getMediaArray = (media: (ShopifyMediaImage | ShopifyMediaVideo)[]) => {
	if (!media || !Array.isArray(media)) {
		console.warn("Invalid media array provided to ProductGallery");
		return [];
	}
	return media.filter((item) => {
		if (!item) {
			console.warn("Null or undefined media item found");
			return false;
		}
		if (item.mediaContentType === "IMAGE") {
			return item.image?.url;
		}
		if (item.mediaContentType === "VIDEO") {
			return item.sources?.[0]?.url;
		}
		return false;
	});
};

export function ProductGallery({ media, title, selectedIndex = 0, onMediaSelect, product }: ProductGalleryProps) {
	const [activeIndex, setActiveIndex] = useState(selectedIndex);
	const [mounted, setMounted] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const thumbnailsRef = useRef<HTMLDivElement>(null);
	const [hasError, setHasError] = useState(false);
	const touchStartX = useRef<number>(0);
	const touchStartY = useRef<number>(0);
	const touchEndX = useRef<number>(0);
	const touchEndY = useRef<number>(0);
	const isHorizontalSwipe = useRef<boolean>(false);

	// Filter and validate media
	const validMedia = useMemo(() => {
		console.log("Raw media array:", media); // Debug log

		if (!media || !Array.isArray(media)) {
			console.warn("Invalid media array provided to ProductGallery");
			return [];
		}

		const filtered = media.filter((item): item is ShopifyMediaImage | ShopifyMediaVideo | ShopifyExternalVideo => {
			if (!item) {
				console.warn("Null or undefined media item found");
				return false;
			}

			console.log("Processing media item:", {
				type: item.mediaContentType,
				item: item,
			}); // Debug log

			const mediaType = item.mediaContentType as string;
			switch (mediaType) {
				case "IMAGE":
					const image = item as ShopifyMediaImage;
					const hasValidImage = Boolean(image.image?.url);
					console.log("Image media item:", { hasValidImage, url: image.image?.url });
					return hasValidImage;

				case "VIDEO":
					const video = item as ShopifyMediaVideo;
					const hasValidVideo = Boolean(video.sources?.[0]?.url);
					console.log("Video media item:", { hasValidVideo, sources: video.sources });
					return hasValidVideo;

				case "EXTERNAL_VIDEO":
					const externalVideo = item as ShopifyExternalVideo;
					const hasValidExternalVideo = Boolean(externalVideo.embedUrl);
					console.log("External video media item:", { hasValidExternalVideo, embedUrl: externalVideo.embedUrl });
					return hasValidExternalVideo;

				default:
					console.warn("Unknown media type:", mediaType);
					return false;
			}
		});

		console.log("Filtered valid media:", filtered); // Debug log
		return filtered;
	}, [media]);

	// Get YouTube videos
	const youtubeVideos = useMemo(() => {
		console.log("Processing YouTube videos from:", product?.youtubeVideos?.references?.edges); // Debug log

		if (!product?.youtubeVideos?.references?.edges) {
			return [];
		}

		try {
			const metaobjects = product.youtubeVideos.references.edges;
			const processedVideos = metaobjects
				.map((edge: { node: { type: string; fields: Array<{ key: string; value: string; type: string }> } }, index: number) => {
					console.log("Processing YouTube edge:", edge); // Debug log

					const fields = edge.node.fields;
					const urlField = fields.find((field) => field.key === "youtube_link");

					if (!urlField?.value) {
						console.warn(`No YouTube URL found for metaobject ${index + 1}`);
						return null;
					}

					try {
						const linkData = JSON.parse(urlField.value);
						const url = linkData.url;

						console.log("Parsed YouTube URL:", url); // Debug log

						if (!url) {
							console.warn(`No URL in JSON data for metaobject ${index + 1}`);
							return null;
						}

						const videoId = getYouTubeId(url);

						if (!videoId) {
							console.warn(`Invalid YouTube URL in metaobject: ${url}`);
							return null;
						}

						return {
							id: `youtube-${videoId}`,
							mediaContentType: "YOUTUBE" as const,
							url,
							embedUrl: getYouTubeEmbedUrl(url),
							thumbnail: {
								url: getYouTubeThumbnail(videoId),
								altText: `YouTube video thumbnail ${index + 1}`,
							},
						};
					} catch (error) {
						console.error(`Error parsing YouTube link JSON for metaobject ${index + 1}:`, error);
						return null;
					}
				})
				.filter(Boolean) as YouTubeVideo[];

			console.log("Processed YouTube videos:", processedVideos); // Debug log
			return processedVideos;
		} catch (error) {
			console.error("Error processing YouTube videos:", error);
			return [];
		}
	}, [product?.youtubeVideos?.references?.edges]);

	// Combine all media
	const allMedia = useMemo(() => {
		const combined = [...validMedia, ...youtubeVideos];
		if (combined.length === 0) {
			console.warn("No valid media found for product:", title);
		}
		return combined;
	}, [validMedia, youtubeVideos, title]);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted) {
			setActiveIndex(selectedIndex);
		}
	}, [selectedIndex, mounted]);

	const handleMediaSelect = useCallback(
		(index: number) => {
			setActiveIndex(index);
			setIsPlaying(false);
			if (onMediaSelect) {
				onMediaSelect(index);
			}
		},
		[onMediaSelect]
	);

	const handleVideoPlay = useCallback(() => {
		setIsPlaying(true);
		if (videoRef.current) {
			videoRef.current.play().catch((error) => {
				console.error("Error playing video:", error);
				setIsPlaying(false);
			});
		}
	}, []);

	const handleImageError = useCallback(() => {
		console.error("Error loading image for product:", title);
		setHasError(true);
	}, [title]);

	const handleTouchStart = (e: React.TouchEvent) => {
		touchStartX.current = e.touches[0].clientX;
		touchStartY.current = e.touches[0].clientY;
		isHorizontalSwipe.current = false;
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (e.touches.length !== 1) return;

		touchEndX.current = e.touches[0].clientX;
		touchEndY.current = e.touches[0].clientY;

		const deltaX = Math.abs(touchEndX.current - touchStartX.current);
		const deltaY = Math.abs(touchEndY.current - touchStartY.current);

		// Only mark as horizontal swipe if movement is significantly more horizontal than vertical
		if (deltaX > 10 && deltaX > deltaY * 1.5) {
			isHorizontalSwipe.current = true;
			e.preventDefault();
		}
	};

	const handleTouchEnd = () => {
		if (!isHorizontalSwipe.current) return;

		const swipeThreshold = 50; // minimum distance for a swipe
		const swipeDistance = touchEndX.current - touchStartX.current;

		if (Math.abs(swipeDistance) > swipeThreshold) {
			if (swipeDistance > 0 && activeIndex > 0) {
				// Swipe right - go to previous
				handleMediaSelect(activeIndex - 1);
			} else if (swipeDistance < 0 && activeIndex < allMedia.length - 1) {
				// Swipe left - go to next
				handleMediaSelect(activeIndex + 1);
			}
		}
	};

	if (!mounted || !allMedia.length || hasError) {
		return (
			<div className="w-full aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
				<div className="text-center p-4">
					<div className="text-4xl mb-2">🍄</div>
					<p className="text-sm text-neutral-600 dark:text-neutral-400">Product image coming soon</p>
				</div>
			</div>
		);
	}

	const activeMedia = allMedia[activeIndex];
	const isVideo = activeMedia?.mediaContentType === "VIDEO";
	const isYouTube = activeMedia?.mediaContentType === "YOUTUBE";
	const isExternalVideo = activeMedia?.mediaContentType === "EXTERNAL_VIDEO";

	return (
		<div className="flex flex-col gap-4">
			<div className="flex gap-4">
				{/* Desktop Thumbnails Column */}
				<div ref={thumbnailsRef} className="hidden md:flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-200px)] p-1">
					{allMedia.map((item, idx) => {
						if (!item) return null;
						return <ThumbnailButton key={`${item.id}-${idx}`} media={item} index={idx} isActive={activeIndex === idx} onClick={() => handleMediaSelect(idx)} onMouseEnter={() => handleMediaSelect(idx)} layout="desktop" />;
					})}
				</div>

				{/* Main Media Display */}
				<div className="flex-1">
					<div className="relative aspect-square group bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-foreground/10 [touch-action:pan-y_pinch-zoom] overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
						{activeMedia.mediaContentType === "VIDEO" ? (
							<div className="relative w-full h-full">
								<video ref={videoRef} src={(activeMedia as ShopifyMediaVideo).sources[0]?.url} poster={(activeMedia as ShopifyMediaVideo).previewImage?.url} className="w-full h-full object-contain rounded-lg" controls={isPlaying} playsInline onClick={handleVideoPlay}>
									{(activeMedia as ShopifyMediaVideo).sources.map((source, idx) => (
										<source key={`${source.url}-${idx}`} src={source.url} type={source.mimeType} />
									))}
									Your browser does not support the video tag.
								</video>
								{!isPlaying && (
									<div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer rounded-lg" onClick={handleVideoPlay}>
										<Play className="w-12 h-12 text-white" />
									</div>
								)}
							</div>
						) : activeMedia.mediaContentType === "YOUTUBE" ? (
							<div className="relative w-full h-full rounded-lg overflow-hidden">
								<iframe src={getYouTubeEmbedUrl((activeMedia as YouTubeVideo).url)} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen title={`YouTube video player - ${title}`} />
								{/* Transparent overlay for touch handling with pointer-events set to none by default */}
								<div
									className="absolute inset-0 z-10 touch-none"
									style={{ pointerEvents: isHorizontalSwipe.current ? "auto" : "none" }}
									onTouchStart={(e) => {
										handleTouchStart(e);
										e.currentTarget.style.pointerEvents = "auto";
									}}
									onTouchMove={handleTouchMove}
									onTouchEnd={(e) => {
										handleTouchEnd();
										e.currentTarget.style.pointerEvents = "none";
									}}
								/>
							</div>
						) : activeMedia.mediaContentType === "EXTERNAL_VIDEO" ? (
							<div className="relative w-full h-full rounded-lg overflow-hidden">
								<iframe src={(activeMedia as ShopifyExternalVideo).embedUrl} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={`External video player - ${title}`} />
								{/* Transparent overlay for touch handling with pointer-events set to none by default */}
								<div
									className="absolute inset-0 z-10 touch-none"
									style={{ pointerEvents: isHorizontalSwipe.current ? "auto" : "none" }}
									onTouchStart={(e) => {
										handleTouchStart(e);
										e.currentTarget.style.pointerEvents = "auto";
									}}
									onTouchMove={handleTouchMove}
									onTouchEnd={(e) => {
										handleTouchEnd();
										e.currentTarget.style.pointerEvents = "none";
									}}
								/>
							</div>
						) : (
							<>
								{(activeMedia as ShopifyMediaImage).image?.url && (
									<div className="relative w-full h-full [touch-action:pan-y_pinch-zoom]">
										<Image src={(activeMedia as ShopifyMediaImage).image.url} alt={(activeMedia as ShopifyMediaImage).image.altText || title} fill className="object-contain transition-transform duration-200 group-hover:scale-105 rounded-lg" priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px" onError={handleImageError} />
										<div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
									</div>
								)}
							</>
						)}
					</div>
				</div>
			</div>

			{/* Mobile Thumbnails Row */}
			<div className="md:hidden -mx-4">
				<div className="flex gap-3 overflow-x-auto py-2 pl-4 scrollbar-hide">
					{allMedia.map((item, idx) => {
						if (!item) return null;
						return (
							<div key={`${item.id}-${idx}`} className="snap-start flex-shrink-0">
								<ThumbnailButton media={item} index={idx} isActive={activeIndex === idx} onClick={() => handleMediaSelect(idx)} onMouseEnter={() => handleMediaSelect(idx)} layout="mobile" />
							</div>
						);
					})}
					{/* Add padding element at the end to ensure last thumbnail is fully visible */}
					<div className="w-4 flex-shrink-0" aria-hidden="true" />
				</div>
			</div>
		</div>
	);
}
