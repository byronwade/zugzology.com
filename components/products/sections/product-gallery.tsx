"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { cn, debugLog } from "@/lib/utils";
import { Play } from "lucide-react";
import { ShopifyMediaImage, ShopifyMediaVideo, ShopifyExternalVideo, ShopifyModel3d, ShopifyProduct } from "@/lib/types";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Eye, RotateCw, Box } from "lucide-react";

interface ModelViewerAttributes {
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
}

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

declare global {
	namespace JSX {
		interface IntrinsicElements {
			"model-viewer": ModelViewerAttributes;
		}
	}
}

export interface ProductGalleryProps {
	media?: MediaType[];
	title?: string;
	selectedIndex: number;
	onMediaSelect: (index: number) => void;
	product: ShopifyProduct;
}

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
	return media.sources.some((source) => validFormats.includes(source.format.toLowerCase()) && source.url.toLowerCase().endsWith(source.format.toLowerCase()));
}

function getValidModelUrl(model: ShopifyModel3d): string {
	const validFormats = ["gltf", "glb", "usdz"];
	const validSource = model.sources.find((source) => validFormats.includes(source.format.toLowerCase()) && source.url.toLowerCase().endsWith(source.format.toLowerCase()));
	return validSource?.url || "";
}

interface Model3DControlsProps {
	onAutoRotateChange: (enabled: boolean) => void;
	onCameraControlsChange: (enabled: boolean) => void;
	onARChange: (enabled: boolean) => void;
	autoRotate: boolean;
	cameraControls: boolean;
	arEnabled: boolean;
}

const Model3DControls = ({ onAutoRotateChange, onCameraControlsChange, onARChange, autoRotate, cameraControls, arEnabled }: Model3DControlsProps) => {
	return (
		<div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg">
			<Button variant={cameraControls ? "default" : "outline"} size="sm" onClick={() => onCameraControlsChange(!cameraControls)} className="gap-2">
				<Eye className="h-4 w-4" />
				Camera Controls
			</Button>
			<Button variant={autoRotate ? "default" : "outline"} size="sm" onClick={() => onAutoRotateChange(!autoRotate)} className="gap-2">
				<RotateCw className="h-4 w-4" />
				Auto-Rotate
			</Button>
			{typeof window !== "undefined" && "xr" in navigator && (
				<Button variant={arEnabled ? "default" : "outline"} size="sm" onClick={() => onARChange(!arEnabled)} className="gap-2">
					<Box className="h-4 w-4" />
					View in AR
				</Button>
			)}
		</div>
	);
};

function extractYouTubeVideoId(url: string): string | null {
	if (!url) return null;

	// Handle different YouTube URL formats
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
		/^([a-zA-Z0-9_-]{11})$/, // Direct video ID
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match && match[1]) {
			return match[1];
		}
	}

	return null;
}

function getYouTubeThumbnail(videoId: string, quality: "default" | "hqdefault" | "mqdefault" | "sddefault" | "maxresdefault" = "maxresdefault"): string {
	return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export function ProductGallery({ media: mediaProp, title: titleProp, selectedIndex, onMediaSelect, product }: ProductGalleryProps) {
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
		if (modelViewerRef.current) {
			const modelViewer = modelViewerRef.current;

			// Set initial properties
			modelViewer.touchAction = "pan-y";
			modelViewer.mouseControls = true;
			modelViewer.orbitSensitivity = "1";
			modelViewer.interactionPrompt = "auto";
			modelViewer.interactionPromptStyle = "basic";

			// Add load event listener
			const handleLoad = () => {
				console.log("3D Model loaded successfully");
			};

			modelViewer.addEventListener("load", handleLoad);

			return () => {
				modelViewer.removeEventListener("load", handleLoad);
			};
		}
	}, [modelViewerRef.current]);

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
			videoRef.current.play().catch((error) => {
				console.error("Error playing video:", error);
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
					if (!items.some((media) => media.mediaContentType === "IMAGE" && (media as ShopifyMediaImage).image?.url === node.url)) {
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
		const youtubeMetafield = product?.metafields?.find((metafield) => metafield?.namespace === "custom" && metafield?.key === "youtube_videos");

		debugLog("ProductGallery", "Found YouTube metafield:", youtubeMetafield);

		if (youtubeMetafield?.value) {
			try {
				// Parse the metaobject references
				const metaobjectRefs = JSON.parse(youtubeMetafield.value);
				debugLog("ProductGallery", "Parsed metaobject refs:", metaobjectRefs);

				// Find all URL metafields that contain YouTube links
				const youtubeUrls = product.metafields?.filter((metafield) => metafield?.type === "url" && metafield?.value && metafield.value.toLowerCase().includes("youtube")) || [];

				debugLog("ProductGallery", "Found YouTube URL metafields:", youtubeUrls);

				// Create video objects for each YouTube URL
				const youtubeVideos = youtubeUrls
					.map((metafield) => {
						if (!metafield?.value) return null;

						const videoId = extractYouTubeVideoId(metafield.value);
						if (!videoId) {
							console.warn("Could not extract video ID from URL:", metafield.value);
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
						console.log("Created YouTube video object:", video);
						return video;
					})
					.filter((video): video is YouTubeMedia => Boolean(video));

				debugLog("ProductGallery", "Final YouTube videos array:", youtubeVideos.length);
				return [...items, ...youtubeVideos];
			} catch (error) {
				console.error("Error processing YouTube videos:", error);
				console.error("Raw metafield value:", youtubeMetafield.value);
				return items;
			}
		}

		debugLog("ProductGallery", "No YouTube videos to process");
		return items;
	}, [mediaProp, title, product?.metafields]);

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
	if (!mounted || !validMedia.length) {
		debugLog("ProductGallery", `No media or not mounted yet. Mounted: ${mounted}, Media length: ${validMedia.length}`);
		return (
			<div className="w-full">
				{mediaItems.length === 0 ? (
					<div className="w-full aspect-square bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700">
						<div className="text-center p-4">
							<div className="text-4xl mb-2">🍄</div>
							<p className="text-sm text-neutral-600 dark:text-neutral-400">No product images available</p>
						</div>
					</div>
				) : (
					<>
						{/* Main Image/Video Display */}
						<div className="relative w-full aspect-square bg-neutral-100 dark:bg-neutral-800 mb-4 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
							{validMedia[selectedMediaIndex] && isMediaImage(validMedia[selectedMediaIndex]) && <Image src={validMedia[selectedMediaIndex].image.url} alt={validMedia[selectedMediaIndex].image.altText ?? validMedia[selectedMediaIndex].alt ?? title} fill priority className="object-contain" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />}

							{validMedia[selectedMediaIndex] && isMediaVideo(validMedia[selectedMediaIndex]) && (
								<div className="relative w-full h-full">
									{!isPlaying && (
										<div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
											<button onClick={handleVideoPlay} className="bg-white/90 hover:bg-white rounded-full p-3 transition-colors">
												<Play className="h-8 w-8 text-primary" />
											</button>
										</div>
									)}
									<video ref={videoRef} src={validMedia[selectedMediaIndex].sources[0]?.url} poster={validMedia[selectedMediaIndex].previewImage?.url} controls={isPlaying} loop muted playsInline className="w-full h-full object-contain" />
								</div>
							)}

							{validMedia[selectedMediaIndex] && isExternalVideo(validMedia[selectedMediaIndex]) && (
								<div className="relative w-full h-full">
									<iframe src={validMedia[selectedMediaIndex].embedUrl} title={validMedia[selectedMediaIndex].alt || "Product video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" />
								</div>
							)}

							{validMedia[selectedMediaIndex] && isModel3d(validMedia[selectedMediaIndex]) && isValidModelFormat(validMedia[selectedMediaIndex] as ShopifyModel3d) && (
								<div className="relative w-full h-full">
									<Script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js" />
									<model-viewer ref={modelViewerRef} src={getValidModelUrl(validMedia[selectedMediaIndex] as ShopifyModel3d)} poster={validMedia[selectedMediaIndex].previewImage?.url} camera-controls={cameraControls} auto-rotate={autoRotate} ar={arEnabled} ar-modes="webxr scene-viewer quick-look" environment-image="neutral" shadow-intensity="1" exposure="0.5" className="w-full h-full">
										<div slot="progress-bar"></div>
										<div slot="ar-button"></div>
										<div slot="ar-prompt"></div>
									</model-viewer>
									<Model3DControls autoRotate={autoRotate} cameraControls={cameraControls} arEnabled={arEnabled} onAutoRotateChange={setAutoRotate} onCameraControlsChange={setCameraControls} onARChange={setAREnabled} />
								</div>
							)}
						</div>

						{/* Thumbnail Navigation */}
						{validMedia.length > 1 && (
							<div className="grid grid-cols-5 gap-2">
								{validMedia.map((item, index) => (
									<button
										key={item.id}
										onClick={() => {
											setSelectedMediaIndex(index);
											onMediaSelect(index);
										}}
										className={cn("relative aspect-square border rounded overflow-hidden transition-all", selectedMediaIndex === index ? "border-primary ring-1 ring-primary" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600")}
										aria-label={`View product image ${index + 1}`}
									>
										{isMediaImage(item) && <Image src={item.image.url} alt={item.alt || `${title} thumbnail ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 20vw, 10vw" priority={index === 0} />}
										{isMediaVideo(item) && (
											<div className="relative w-full h-full">
												<Image src={item.previewImage?.url || ""} alt={item.alt || `${title} video thumbnail ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 20vw, 10vw" priority={index === 0} />
												<div className="absolute inset-0 flex items-center justify-center">
													<Play className="h-6 w-6 text-white drop-shadow-md" />
												</div>
											</div>
										)}
										{isExternalVideo(item) && (
											<div className="relative w-full h-full">
												<Image src={item.previewImage?.url || ""} alt={item.alt || `${title} video thumbnail ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 20vw, 10vw" priority={index === 0} />
												<div className="absolute inset-0 flex items-center justify-center">
													<Play className="h-6 w-6 text-white drop-shadow-md" />
												</div>
											</div>
										)}
										{isModel3d(item) && (
											<div className="relative w-full h-full">
												<Image src={item.previewImage?.url || ""} alt={item.alt || `${title} 3D model thumbnail ${index + 1}`} fill className="object-cover" sizes="(max-width: 768px) 20vw, 10vw" priority={index === 0} />
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
			<Script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js" crossOrigin="anonymous" />
			<div className="flex flex-col gap-4">
				<div className="flex gap-4">
					{/* Desktop Thumbnails Column */}
					<div className="hidden md:flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-200px)] p-1">
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

							if (!thumbnailUrl) return null;

							return (
								<button key={media.id} className={`relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 border ${selectedMediaIndex === index ? "border-purple-600 ring-2 ring-purple-600" : "border-neutral-200 dark:border-neutral-700 hover:border-purple-300 dark:hover:border-neutral-600"}`} onClick={() => setSelectedMediaIndex(index)}>
									<Image src={thumbnailUrl} alt={altText} fill sizes="64px" className="object-cover" />
									{(isMediaVideo(media) || isExternalVideo(media)) && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/30">
											<Play className="w-4 h-4 text-white" />
										</div>
									)}
									{isModel3d(media) && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/30">
											<span className="text-white text-xs font-medium">3D</span>
										</div>
									)}
								</button>
							);
						})}
					</div>

					{/* Main Media Display */}
					<div className="flex-1">
						<div className="relative aspect-square group bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
							{isMediaImage(activeMedia) && <Image src={activeMedia.image.url} alt={activeMedia.image.altText ?? activeMedia.alt ?? title} fill priority={true} sizes="(min-width: 1024px) 66vw, 100vw" className="object-contain" />}
							{isMediaVideo(activeMedia) && (
								<div className="relative w-full h-full">
									<video ref={videoRef} controls={isPlaying} playsInline className="w-full h-full object-contain" poster={activeMedia.previewImage?.url}>
										{activeMedia.sources.map((source, index) => (
											<source key={index} src={source.url} type={source.mimeType} />
										))}
									</video>
									{!isPlaying && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={handleVideoPlay}>
											<Play className="w-12 h-12 text-white" />
										</div>
									)}
								</div>
							)}
							{isExternalVideo(activeMedia) && <iframe src={activeMedia.embedUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
							{isModel3d(activeMedia) && isValidModelFormat(activeMedia) && (
								<>
									<model-viewer
										ref={modelViewerRef}
										src={activeMedia.sources[0].url}
										poster={activeMedia.previewImage.url}
										camera-controls
										auto-rotate
										rotation-per-second="30deg"
										ar
										ar-modes="webxr scene-viewer quick-look"
										environment-image="neutral"
										shadow-intensity="1"
										exposure="1"
										camera-orbit="0deg 75deg 105%"
										field-of-view="30deg"
										min-camera-orbit="auto auto auto"
										max-camera-orbit="auto auto 105%"
										interaction-prompt="auto"
										interaction-prompt-style="basic"
										interaction-prompt-threshold="0"
										touch-action="pan-y"
										mouse-controls
										orbit-sensitivity="1"
										style={{ width: "100%", height: "100%" }}
										className="w-full h-full"
									/>
									<Model3DControls autoRotate={autoRotate} cameraControls={cameraControls} arEnabled={arEnabled} onAutoRotateChange={setAutoRotate} onCameraControlsChange={setCameraControls} onARChange={setAREnabled} />
								</>
							)}
						</div>
					</div>
				</div>;
				{
					/* Mobile Thumbnails Row */
				}
				<div className="md:hidden -mx-4">
					<div className="flex gap-3 overflow-x-auto py-2 pl-4 scrollbar-hide">
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

							if (!thumbnailUrl) return null;

							return (
								<button key={media.id} className={`relative aspect-square w-[70px] flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 ${selectedMediaIndex === index ? "ring-2 ring-purple-600 ring-offset-2" : "hover:ring-2 hover:ring-purple-300 dark:hover:ring-neutral-600"}`} onClick={() => setSelectedMediaIndex(index)}>
									<Image src={thumbnailUrl} alt={altText} fill sizes="70px" className="object-cover" />
									{(isMediaVideo(media) || isExternalVideo(media)) && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/30">
											<Play className="w-4 h-4 text-white" />
										</div>
									)}
									{isModel3d(media) && (
										<div className="absolute inset-0 flex items-center justify-center bg-black/30">
											<span className="text-white text-xs font-medium">3D</span>
										</div>
									)}
								</button>
							);
						})}
						<div className="w-4 flex-shrink-0" aria-hidden="true" />
					</div>
				</div>;
			</div>
		</>
	);
}
