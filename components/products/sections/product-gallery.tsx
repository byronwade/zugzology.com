"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { ShopifyMediaImage, ShopifyMediaVideo, YouTubeVideo, ShopifyExternalVideo, ShopifyProduct } from "@/lib/types";

interface ProductMedia {
	url: string;
	altText: string | null;
	width: number;
	height: number;
	type: "image" | "video";
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
		<button onClick={onClick} onMouseEnter={onMouseEnter} className={cn("relative rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-foreground/10", "hover:border-foreground transition duration-200", layout === "desktop" ? "w-16 h-16" : "aspect-square w-full", isActive && (layout === "desktop" ? "border-foreground" : "ring-2 ring-offset-2 ring-primary"))}>
			<div className="absolute inset-0 overflow-hidden rounded-lg">
				<Image src={thumbnailUrl} alt={thumbnailAlt || ""} fill className="object-cover" sizes={layout === "desktop" ? "64px" : "(max-width: 768px) 25vw, 80px"} />
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

// Helper function to get YouTube thumbnail
const getYouTubeThumbnail = (videoId: string) => {
	return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export function ProductGallery({ media, title, selectedIndex = 0, onMediaSelect, product }: ProductGalleryProps) {
	const [activeIndex, setActiveIndex] = useState(selectedIndex);
	const [mounted, setMounted] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const thumbnailsRef = useRef<HTMLDivElement>(null);

	// Process YouTube videos from metafields
	const youtubeVideos = useMemo(() => {
		console.log("Product youtubeVideos metafield:", product?.youtubeVideos);

		if (!product?.youtubeVideos?.references?.edges) {
			console.log("No YouTube videos found in metafield references");
			return [];
		}

		try {
			const metaobjects = product.youtubeVideos.references.edges;
			console.log("YouTube video metaobjects:", metaobjects);

			const processedVideos = metaobjects
				.map((edge: { node: { type: string; fields: Array<{ key: string; value: string; type: string }> } }, index: number) => {
					console.log(`Processing metaobject ${index + 1}:`, edge.node);
					const fields = edge.node.fields;
					const urlField = fields.find((field) => field.key === "youtube_link");

					if (!urlField?.value) {
						console.log(`No YouTube URL found for metaobject ${index + 1}`);
						return null;
					}

					try {
						const linkData = JSON.parse(urlField.value);
						const url = linkData.url;
						console.log(`Found YouTube URL:`, url);

						if (!url) {
							console.log(`No URL in JSON data for metaobject ${index + 1}`);
							return null;
						}

						const videoId = getYouTubeId(url);
						console.log(`Extracted video ID:`, videoId);

						if (!videoId) {
							console.log(`Invalid YouTube URL in metaobject: ${url}`);
							return null;
						}

						return {
							id: `youtube-${videoId}`,
							mediaContentType: "YOUTUBE" as const,
							url,
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

			console.log("Final processed YouTube videos:", processedVideos);
			return processedVideos;
		} catch (error) {
			console.error("Error parsing YouTube videos:", error);
			return [];
		}
	}, [product?.youtubeVideos?.references?.edges]);

	// Combine all media
	const allMedia = useMemo(() => {
		const mediaItems = [];

		// Add Shopify media items if they exist
		if (product?.media?.edges) {
			console.log("Shopify media items:", product.media.edges.length);
			mediaItems.push(...product.media.edges.map(({ node }) => node));
		}

		// Add YouTube videos
		if (youtubeVideos.length > 0) {
			console.log("Adding YouTube videos to media:", youtubeVideos.length);
			mediaItems.push(...youtubeVideos);
		}

		console.log("Total media items:", mediaItems.length);
		return mediaItems;
	}, [product?.media?.edges, youtubeVideos]);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (mounted) {
			setActiveIndex(selectedIndex);
		}
	}, [selectedIndex, mounted]);

	const handleMediaSelect = (index: number) => {
		setActiveIndex(index);
		onMediaSelect?.(index);
		setIsPlaying(false);

		if (thumbnailsRef.current) {
			const thumbnails = thumbnailsRef.current.children;
			if (thumbnails[index]) {
				thumbnails[index].scrollIntoView({ behavior: "smooth", block: "nearest" });
			}
		}
	};

	const handleVideoPlay = () => {
		if (videoRef.current) {
			if (isPlaying) {
				videoRef.current.pause();
			} else {
				videoRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	if (!mounted) return null;

	const activeMedia = allMedia[activeIndex];
	const isVideo = activeMedia?.mediaContentType === "VIDEO";
	const isYouTube = activeMedia?.mediaContentType === "YOUTUBE";
	const isExternalVideo = activeMedia?.mediaContentType === "EXTERNAL_VIDEO";

	return (
		<div className="flex gap-4">
			{/* Desktop Thumbnails Column */}
			<div ref={thumbnailsRef} className="hidden md:flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-200px)] p-1">
				{allMedia.map((item, idx) => {
					if (!item) return null;

					const isVideo = item.mediaContentType === "VIDEO";
					const isYouTube = item.mediaContentType === "YOUTUBE";
					const isExternalVideo = item.mediaContentType === "EXTERNAL_VIDEO";
					const thumbnailUrl = isYouTube ? (item as YouTubeVideo).thumbnail?.url : isVideo ? (item as ShopifyMediaVideo).previewImage?.url : isExternalVideo ? (item as ShopifyExternalVideo).previewImage?.url : (item as ShopifyMediaImage).image?.url;
					const thumbnailAlt = isYouTube ? (item as YouTubeVideo).thumbnail?.altText : isVideo ? (item as ShopifyMediaVideo).previewImage?.altText : isExternalVideo ? (item as ShopifyExternalVideo).previewImage?.altText : (item as ShopifyMediaImage).image?.altText;

					if (!thumbnailUrl) return null;

					return <ThumbnailButton key={`${item.id}-${idx}`} media={item} index={idx} isActive={activeIndex === idx} onClick={() => handleMediaSelect(idx)} onMouseEnter={() => handleMediaSelect(idx)} layout="desktop" />;
				})}
			</div>

			{/* Main Media Display */}
			<div className="flex-1">
				<div className="relative aspect-square w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 group overflow-hidden max-h-[calc(100vh-200px)] border border-foreground/10 hover:border-foreground/20 transition-colors duration-200">
					{isYouTube ? (
						<div className="relative w-full h-full">
							<iframe src={`https://www.youtube.com/embed/${getYouTubeId((activeMedia as YouTubeVideo).url)}?autoplay=${isPlaying ? "1" : "0"}&rel=0`} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={`YouTube video for ${title}`} />
							{!isPlaying && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={() => setIsPlaying(true)}>
									<Play className="w-12 h-12 text-white" />
								</div>
							)}
						</div>
					) : isVideo ? (
						<div className="relative w-full h-full">
							<video ref={videoRef} src={(activeMedia as ShopifyMediaVideo).sources[0]?.url} poster={(activeMedia as ShopifyMediaVideo).previewImage?.url} className="w-full h-full object-contain" controls={isPlaying} playsInline onClick={handleVideoPlay}>
								{(activeMedia as ShopifyMediaVideo).sources.map((source, idx) => (
									<source key={`${source.url}-${idx}`} src={source.url} type={source.mimeType} />
								))}
								Your browser does not support the video tag.
							</video>
							{!isPlaying && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={handleVideoPlay}>
									<Play className="w-12 h-12 text-white" />
								</div>
							)}
						</div>
					) : isExternalVideo ? (
						<div className="relative w-full h-full">
							<iframe src={(activeMedia as ShopifyExternalVideo).embedUrl} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={`External video player - ${title}`} />
							{!isPlaying && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={() => setIsPlaying(true)}>
									<Play className="w-12 h-12 text-white" />
								</div>
							)}
						</div>
					) : (
						<>
							{(activeMedia as ShopifyMediaImage).image?.url && <Image src={(activeMedia as ShopifyMediaImage).image.url} alt={(activeMedia as ShopifyMediaImage).image.altText || title} fill className="object-contain transition-transform duration-200 group-hover:scale-105" priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px" />}
							<div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
						</>
					)}
				</div>
			</div>
		</div>
	);
}
