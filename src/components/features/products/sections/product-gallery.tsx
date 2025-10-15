"use client";

import { Box, Eye, Play, RotateCw } from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type {
	ShopifyExternalVideo,
	ShopifyMediaImage,
	ShopifyMediaVideo,
	ShopifyModel3d,
	ShopifyProduct,
} from "@/lib/types";
import { cn, debugLog } from "@/lib/utils";

type ModelViewerAttributes = {
	src: string;
	poster?: string;
	"camera-controls"?: boolean;
	"auto-rotate"?: boolean;
	"rotation-per-second"?: string;
	"field-of-view"?: string;
	"max-field-of-view"?: string;
	"min-field-of-view"?: string;
	"camera-orbit"?: string;
	"min-camera-orbit"?: string;
	"max-camera-orbit"?: string;
	exposure?: string;
	"shadow-intensity"?: string;
	"shadow-softness"?: string;
	ar?: boolean;
	"ar-modes"?: string;
	"ar-scale"?: string;
	"ar-placement"?: string;
	"interaction-prompt"?: string;
	"interaction-prompt-style"?: string;
	"interaction-prompt-threshold"?: string;
	loading?: "auto" | "lazy" | "eager";
	reveal?: "auto" | "interaction" | "manual";
	bounds?: string;
	"environment-image"?: string;
	"skybox-image"?: string;
	"animation-name"?: string;
	"animation-crossfade-duration"?: string;
	"touch-action"?: string;
	"mouse-controls"?: boolean;
	"orbit-sensitivity"?: string;
	style?: React.CSSProperties;
	className?: string;
	ref?: React.RefObject<ModelViewerElement>;
	children?: React.ReactNode;
};

interface ModelViewerElement extends HTMLElement {
	cameraControls: boolean;
	autoRotate: boolean;
	rotationPerSecond: string;
	fieldOfView: string;
	maxFieldOfView: string;
	minFieldOfView: string;
	cameraOrbit: string;
	minCameraOrbit: string;
	maxCameraOrbit: string;
	exposure: string;
	shadowIntensity: string;
	shadowSoftness: string;
	ar: boolean;
	arModes: string;
	arScale: string;
	arPlacement: string;
	interactionPrompt: string;
	interactionPromptStyle: string;
	interactionPromptThreshold: string;
	touchAction: string;
	mouseControls: boolean;
	orbitSensitivity: string;
}

export type ProductGalleryProps = {
	media?: MediaType[];
	title?: string;
	selectedIndex: number;
	onMediaSelect: (index: number) => void;
	product: ShopifyProduct;
};

type YouTubeMedia = {
	id: string;
	mediaContentType: "YOUTUBE";
	alt: string;
	embedUrl: string;
	previewImage: {
		url: string;
		altText: string;
		height: number;
		width: number;
	};
};

type MediaType = ShopifyMediaImage | ShopifyMediaVideo | ShopifyExternalVideo | ShopifyModel3d | YouTubeMedia;

function isMediaImage(media: MediaType): media is ShopifyMediaImage {
	return media.mediaContentType === "IMAGE";
}

function isMediaVideo(media: MediaType): media is ShopifyMediaVideo {
	return media.mediaContentType === "VIDEO";
}

function isExternalVideo(media: MediaType): media is ShopifyExternalVideo | YouTubeMedia {
	return media.mediaContentType === "EXTERNAL_VIDEO" || media.mediaContentType === "YOUTUBE";
}

function isModel3d(media: MediaType): media is ShopifyModel3d {
	return media.mediaContentType === "MODEL_3D";
}

function isValidModelFormat(media: ShopifyModel3d): boolean {
	const validFormats = ["gltf", "glb", "usdz"];
	return media.sources.some(
		(source) =>
			validFormats.includes(source.format.toLowerCase()) &&
			source.url.toLowerCase().endsWith(source.format.toLowerCase())
	);
}

function getValidModelUrl(model: ShopifyModel3d): string {
	const validFormats = ["gltf", "glb", "usdz"];
	const validSource = model.sources.find(
		(source) =>
			validFormats.includes(source.format.toLowerCase()) &&
			source.url.toLowerCase().endsWith(source.format.toLowerCase())
	);
	return validSource?.url || "";
}

type Model3DControlsProps = {
	onAutoRotateChange: (enabled: boolean) => void;
	onCameraControlsChange: (enabled: boolean) => void;
	onARChange: (enabled: boolean) => void;
	autoRotate: boolean;
	cameraControls: boolean;
	arEnabled: boolean;
};

const Model3DControls = ({
	onAutoRotateChange,
	onCameraControlsChange,
	onARChange,
	autoRotate,
	cameraControls,
	arEnabled,
}: Model3DControlsProps) => (
	<div className="absolute right-4 bottom-4 left-4 flex items-center justify-center gap-2 rounded-lg bg-background/80 p-2 backdrop-blur-sm">
		<Button
			className="gap-2"
			onClick={() => onCameraControlsChange(!cameraControls)}
			size="sm"
			variant={cameraControls ? "default" : "outline"}
		>
			<Eye className="h-4 w-4" />
			Camera Controls
		</Button>
		<Button
			className="gap-2"
			onClick={() => onAutoRotateChange(!autoRotate)}
			size="sm"
			variant={autoRotate ? "default" : "outline"}
		>
			<RotateCw className="h-4 w-4" />
			Auto-Rotate
		</Button>
		{typeof window !== "undefined" && "xr" in navigator && (
			<Button
				className="gap-2"
				onClick={() => onARChange(!arEnabled)}
				size="sm"
				variant={arEnabled ? "default" : "outline"}
			>
				<Box className="h-4 w-4" />
				View in AR
			</Button>
		)}
	</div>
);

function extractYouTubeVideoId(url: string): string | null {
	if (!url) {
		return null;
	}

	// Handle different YouTube URL formats
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
		/^([a-zA-Z0-9_-]{11})$/, // Direct video ID
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match?.[1]) {
			return match[1];
		}
	}

	return null;
}

function getYouTubeThumbnail(
	videoId: string,
	quality: "default" | "hqdefault" | "mqdefault" | "sddefault" | "maxresdefault" = "maxresdefault"
): string {
	return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export function ProductGallery({
	media: mediaProp,
	title: titleProp,
	selectedIndex,
	onMediaSelect,
	product,
}: ProductGalleryProps) {
	const [selectedMediaIndex, setSelectedMediaIndex] = useState(selectedIndex || 0);
	const [mounted, setMounted] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [autoRotate, setAutoRotate] = useState(true);
	const [cameraControls, setCameraControls] = useState(true);
	const [arEnabled, setAREnabled] = useState(false);
	const videoRef = useRef<HTMLVideoElement>(null);
	const modelViewerRef = useRef<ModelViewerElement>(null);

	// Use title from props or fallback to product title
	const title = titleProp || product.title;

	useEffect(() => {
		const modelViewer = modelViewerRef.current;
		if (!modelViewer) {
			return;
		}

		// Set initial properties
		modelViewer.touchAction = "pan-y";
		modelViewer.mouseControls = true;
		modelViewer.orbitSensitivity = "1";
		modelViewer.interactionPrompt = "auto";
		modelViewer.interactionPromptStyle = "basic";

		// Add load event listener
		const handleLoad = () => {};

		modelViewer.addEventListener("load", handleLoad);

		return () => {
			modelViewer.removeEventListener("load", handleLoad);
		};
	}, []);

	// Update model viewer controls when states change
	useEffect(() => {
		if (modelViewerRef.current) {
			const modelViewer = modelViewerRef.current;
			modelViewer.cameraControls = cameraControls;
			modelViewer.autoRotate = autoRotate;
			modelViewer.ar = arEnabled;
		}
	}, [cameraControls, autoRotate, arEnabled]);

	const handleVideoPlay = useCallback(() => {
		setIsPlaying(true);
		if (videoRef.current) {
			videoRef.current.play().catch((_error) => {
				setIsPlaying(false);
			});
		}
	}, []);

	// More detailed debug logs
	debugLog("ProductGallery", "Raw product data:", product);
	debugLog("ProductGallery", "Media nodes:", product?.media?.nodes);
	debugLog("ProductGallery", "First media item:", product?.media?.nodes?.[0]);
	debugLog("ProductGallery", "Metafields:", product?.metafields);

	useEffect(() => {
		setMounted(true);
		// Debug mounted state
		debugLog("ProductGallery", "Component mounted");
	}, []);

	// Get media items from product
	const mediaItems = useMemo(() => {
		const items: MediaType[] = mediaProp || [];
		debugLog("ProductGallery", "Initial media items:", items);

		// If no media prop is provided, extract media from product
		if (items.length === 0 && product) {
			debugLog("ProductGallery", "Extracting media from product:", product);

			// Add media items if they exist
			if (product.media?.nodes) {
				product.media.nodes.forEach((node) => {
					if (node.mediaContentType === "IMAGE") {
						items.push(node as ShopifyMediaImage);
					} else if (node.mediaContentType === "VIDEO") {
						items.push(node as ShopifyMediaVideo);
					} else if (node.mediaContentType === "EXTERNAL_VIDEO") {
						items.push(node as ShopifyExternalVideo);
					} else if (node.mediaContentType === "MODEL_3D") {
						items.push(node as ShopifyModel3d);
					}
				});
			}

			// Add any images that might not be in media
			if (product.images?.nodes && (!product.media?.nodes || product.media.nodes.length === 0)) {
				product.images.nodes.forEach((node) => {
					// Only add if there isn't already media for this image
					if (
						!items.some(
							(media) => media.mediaContentType === "IMAGE" && (media as ShopifyMediaImage).image?.url === node.url
						)
					) {
						items.push({
							id: `image-${node.url}`,
							mediaContentType: "IMAGE",
							alt: node.altText || product.title,
							image: node,
						} as ShopifyMediaImage);
					}
				});
			}
		}

		// Process YouTube videos from metafields
		const youtubeMetafield = product?.metafields?.find(
			(metafield) => metafield?.namespace === "custom" && metafield?.key === "youtube_videos"
		);

		debugLog("ProductGallery", "Found YouTube metafield:", youtubeMetafield);

		if (youtubeMetafield?.value) {
			try {
				// Parse the metaobject references
				const metaobjectRefs = JSON.parse(youtubeMetafield.value);
				debugLog("ProductGallery", "Parsed metaobject refs:", metaobjectRefs);

				// Find all URL metafields that contain YouTube links
				const youtubeUrls =
					product.metafields?.filter(
						(metafield) =>
							metafield?.type === "url" && metafield?.value && metafield.value.toLowerCase().includes("youtube")
					) || [];

				debugLog("ProductGallery", "Found YouTube URL metafields:", youtubeUrls);

				// Create video objects for each YouTube URL
				const youtubeVideos = youtubeUrls
					.map((metafield) => {
						if (!metafield?.value) {
							return null;
						}

						const videoId = extractYouTubeVideoId(metafield.value);
						if (!videoId) {
							return null;
						}

						const video: YouTubeMedia = {
							id: `youtube-${videoId}`,
							mediaContentType: "YOUTUBE",
							alt: title,
							embedUrl: `https://www.youtube.com/embed/${videoId}`,
							previewImage: {
								url: getYouTubeThumbnail(videoId),
								altText: title,
								height: 720,
								width: 1280,
							},
						};
						return video;
					})
					.filter((video): video is YouTubeMedia => Boolean(video));

				debugLog("ProductGallery", "Final YouTube videos array:", youtubeVideos.length);
				return [...items, ...youtubeVideos];
			} catch (_error) {
				return items;
			}
		}

		debugLog("ProductGallery", "No YouTube videos to process");
		return items;
	}, [mediaProp, title, product]);

	// Only log media items in development, not in production
	if (process.env.NODE_ENV === "development") {
		debugLog("ProductGallery", "Final combined mediaItems:", mediaItems.length);
	}

	// Filter out invalid 3D models
	const validMedia = mediaItems.filter((media): media is MediaType => {
		if (isModel3d(media)) {
			return isValidModelFormat(media);
		}
		return true;
	});

	// Only log in development
	if (process.env.NODE_ENV === "development") {
		debugLog("ProductGallery", "Combined media array:", validMedia.length);
	}

	// Early return with debug message if no media
	if (!(mounted && validMedia.length)) {
		debugLog("ProductGallery", `No media or not mounted yet. Mounted: ${mounted}, Media length: ${validMedia.length}`);
		return (
			<div className="w-full">
				{mediaItems.length === 0 ? (
					<div className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-muted">
						<div className="p-4 text-center">
							<div className="mb-2 text-4xl">🍄</div>
							<p className="text-muted-foreground text-sm">No product images available</p>
						</div>
					</div>
				) : (
					<>
						{/* Main Image/Video Display */}
						<div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
							{validMedia[selectedMediaIndex] && isMediaImage(validMedia[selectedMediaIndex]) && (
								<Image
									alt={validMedia[selectedMediaIndex].image.altText ?? validMedia[selectedMediaIndex].alt ?? title}
									className="object-contain"
									fill
									priority
									sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
									src={validMedia[selectedMediaIndex].image.url}
								/>
							)}

							{validMedia[selectedMediaIndex] && isMediaVideo(validMedia[selectedMediaIndex]) && (
								<div className="relative h-full w-full">
									{!isPlaying && (
										<div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
											<button
												className="rounded-full bg-white/90 p-3 transition-colors hover:bg-white"
												onClick={handleVideoPlay}
											>
												<Play className="h-8 w-8 text-primary" />
											</button>
										</div>
									)}
									<video
										className="h-full w-full object-contain"
										controls={isPlaying}
										loop
										muted
										playsInline
										poster={validMedia[selectedMediaIndex].previewImage?.url}
										ref={videoRef}
										src={validMedia[selectedMediaIndex].sources[0]?.url}
									/>
								</div>
							)}

							{validMedia[selectedMediaIndex] && isExternalVideo(validMedia[selectedMediaIndex]) && (
								<div className="relative h-full w-full">
									<iframe
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
										className="absolute inset-0 h-full w-full"
										src={validMedia[selectedMediaIndex].embedUrl}
										title={validMedia[selectedMediaIndex].alt || "Product video"}
									/>
								</div>
							)}

							{validMedia[selectedMediaIndex] &&
								isModel3d(validMedia[selectedMediaIndex]) &&
								isValidModelFormat(validMedia[selectedMediaIndex] as ShopifyModel3d) && (
									<div className="relative h-full w-full">
										<Script src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js" type="module" />
										<model-viewer
											ar={arEnabled}
											ar-modes="webxr scene-viewer quick-look"
											auto-rotate={autoRotate}
											camera-controls={cameraControls}
											className="h-full w-full"
											environment-image="neutral"
											exposure="0.5"
											poster={validMedia[selectedMediaIndex].previewImage?.url}
											ref={modelViewerRef}
											shadow-intensity="1"
											src={getValidModelUrl(validMedia[selectedMediaIndex] as ShopifyModel3d)}
										>
											<div slot="progress-bar" />
											<div slot="ar-button" />
											<div slot="ar-prompt" />
										</model-viewer>
										<Model3DControls
											arEnabled={arEnabled}
											autoRotate={autoRotate}
											cameraControls={cameraControls}
											onARChange={setAREnabled}
											onAutoRotateChange={setAutoRotate}
											onCameraControlsChange={setCameraControls}
										/>
									</div>
								)}
						</div>

						{/* Thumbnail Navigation */}
						{validMedia.length > 1 && (
							<div className="grid grid-cols-5 gap-2">
								{validMedia.map((item, index) => (
									<button
										aria-label={`View product image ${index + 1}`}
										className={cn(
											"relative aspect-square overflow-hidden rounded border transition-all",
											selectedMediaIndex === index
												? "border-primary ring-1 ring-primary"
												: "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
										)}
										key={item.id}
										onClick={() => {
											setSelectedMediaIndex(index);
											onMediaSelect(index);
										}}
									>
										{isMediaImage(item) && (
											<Image
												alt={item.alt || `${title} thumbnail ${index + 1}`}
												className="object-cover"
												fill
												priority={index === 0}
												sizes="(max-width: 768px) 20vw, 10vw"
												src={item.image.url}
											/>
										)}
										{isMediaVideo(item) && (
											<div className="relative h-full w-full">
												<Image
													alt={item.alt || `${title} video thumbnail ${index + 1}`}
													className="object-cover"
													fill
													priority={index === 0}
													sizes="(max-width: 768px) 20vw, 10vw"
													src={item.previewImage?.url || ""}
												/>
												<div className="absolute inset-0 flex items-center justify-center">
													<Play className="h-6 w-6 text-white drop-shadow-md" />
												</div>
											</div>
										)}
										{isExternalVideo(item) && (
											<div className="relative h-full w-full">
												<Image
													alt={item.alt || `${title} video thumbnail ${index + 1}`}
													className="object-cover"
													fill
													priority={index === 0}
													sizes="(max-width: 768px) 20vw, 10vw"
													src={item.previewImage?.url || ""}
												/>
												<div className="absolute inset-0 flex items-center justify-center">
													<Play className="h-6 w-6 text-white drop-shadow-md" />
												</div>
											</div>
										)}
										{isModel3d(item) && (
											<div className="relative h-full w-full">
												<Image
													alt={item.alt || `${title} 3D model thumbnail ${index + 1}`}
													className="object-cover"
													fill
													priority={index === 0}
													sizes="(max-width: 768px) 20vw, 10vw"
													src={item.previewImage?.url || ""}
												/>
												<div className="absolute inset-0 flex items-center justify-center">
													<Box className="h-6 w-6 text-white drop-shadow-md" />
												</div>
											</div>
										)}
									</button>
								))}
							</div>
						)}
					</>
				)}
			</div>
		);
	}

	const activeMedia = validMedia[selectedMediaIndex];
	debugLog("ProductGallery", "Active media:", activeMedia);

	return (
		<>
			<Script
				crossOrigin="anonymous"
				src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
				type="module"
			/>
			<div className="flex flex-col gap-4">
				<div className="flex gap-4">
					{/* Desktop Thumbnails Column - Only show if more than 1 image */}
					{validMedia.length > 1 && (
						<div className="hidden max-h-[calc(100vh-200px)] flex-col gap-2 overflow-y-auto p-1 md:flex">
							{validMedia.map((media, index) => {
							let thumbnailUrl = "";
							let altText = media.alt || title;

							if (isMediaImage(media)) {
								thumbnailUrl = media.image.url;
								altText = media.image.altText ?? title;
							} else if (media.previewImage) {
								thumbnailUrl = media.previewImage.url;
								altText = media.previewImage.altText ?? title;
							}

							if (!thumbnailUrl) {
								return null;
							}

							return (
								<button
									className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-muted ${selectedMediaIndex === index ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"}`}
									key={media.id}
									onClick={() => setSelectedMediaIndex(index)}
								>
									<Image alt={altText} className="object-cover" fill sizes="64px" src={thumbnailUrl} />
									{(isMediaVideo(media) || isExternalVideo(media)) && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/30">
											<Play className="h-4 w-4 text-white" />
										</div>
									)}
									{isModel3d(media) && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/30">
											<span className="font-medium text-white text-xs">3D</span>
										</div>
									)}
								</button>
							);
						})}
						</div>
					)}

					{/* Main Media Display */}
					<div className="flex-1">
						<div className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
							{isMediaImage(activeMedia) && (
								<Image
									alt={activeMedia.image.altText ?? activeMedia.alt ?? title}
									className="object-contain"
									fill
									priority={true}
									sizes="(min-width: 1024px) 66vw, 100vw"
									src={activeMedia.image.url}
								/>
							)}
							{isMediaVideo(activeMedia) && (
								<div className="relative h-full w-full">
									<video
										className="h-full w-full object-contain"
										controls={isPlaying}
										playsInline
										poster={activeMedia.previewImage?.url}
										ref={videoRef}
									>
										{activeMedia.sources.map((source, index) => (
											<source key={index} src={source.url} type={source.mimeType} />
										))}
									</video>
									{!isPlaying && (
										<div
											className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30"
											onClick={handleVideoPlay}
										>
											<Play className="h-12 w-12 text-white" />
										</div>
									)}
								</div>
							)}
							{isExternalVideo(activeMedia) && (
								<iframe
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
									className="h-full w-full"
									src={activeMedia.embedUrl}
								/>
							)}
							{isModel3d(activeMedia) && isValidModelFormat(activeMedia) && (
								<>
									<model-viewer
										ar
										ar-modes="webxr scene-viewer quick-look"
										auto-rotate
										camera-controls
										camera-orbit="0deg 75deg 105%"
										className="h-full w-full"
										environment-image="neutral"
										exposure="1"
										field-of-view="30deg"
										interaction-prompt="auto"
										interaction-prompt-style="basic"
										interaction-prompt-threshold="0"
										max-camera-orbit="auto auto 105%"
										min-camera-orbit="auto auto auto"
										mouse-controls
										orbit-sensitivity="1"
										poster={activeMedia.previewImage.url}
										ref={modelViewerRef}
										rotation-per-second="30deg"
										shadow-intensity="1"
										src={activeMedia.sources[0].url}
										style={{ width: "100%", height: "100%" }}
										touch-action="pan-y"
									/>
									<Model3DControls
										arEnabled={arEnabled}
										autoRotate={autoRotate}
										cameraControls={cameraControls}
										onARChange={setAREnabled}
										onAutoRotateChange={setAutoRotate}
										onCameraControlsChange={setCameraControls}
									/>
								</>
							)}
						</div>
					</div>
				</div>
				{/* Mobile Thumbnails Row - Only show if more than 1 image */}
				{validMedia.length > 1 && (
					<div className="-mx-4 md:hidden">
						<div className="scrollbar-hide flex gap-3 overflow-x-auto py-2 pl-4">
							{validMedia.map((media, index) => {
							let thumbnailUrl = "";
							let altText = media.alt || title;

							if (isMediaImage(media)) {
								thumbnailUrl = media.image.url;
								altText = media.image.altText ?? title;
							} else if (media.previewImage) {
								thumbnailUrl = media.previewImage.url;
								altText = media.previewImage.altText ?? title;
							}

							if (!thumbnailUrl) {
								return null;
							}

							return (
								<button
									className={`relative aspect-square w-[70px] flex-shrink-0 overflow-hidden rounded-lg bg-muted ${selectedMediaIndex === index ? "ring-2 ring-primary ring-offset-2" : "hover:ring-2 hover:ring-primary/50"}`}
									key={media.id}
									onClick={() => setSelectedMediaIndex(index)}
								>
									<Image alt={altText} className="object-cover" fill sizes="70px" src={thumbnailUrl} />
									{(isMediaVideo(media) || isExternalVideo(media)) && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/30">
											<Play className="h-4 w-4 text-white" />
										</div>
									)}
									{isModel3d(media) && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/30">
											<span className="font-medium text-white text-xs">3D</span>
										</div>
									)}
								</button>
							);
						})}
							<div aria-hidden="true" className="w-4 flex-shrink-0" />
						</div>
					</div>
				)}

			</div>
		</>
	);
}
