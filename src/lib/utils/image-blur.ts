/**
 * Image Blur Placeholder Utilities
 * Generates blur placeholders for better perceived performance
 */

/**
 * Generate a blur data URL for an image
 * This is a simple base64-encoded SVG blur placeholder
 */
export function getBlurDataURL(width = 40, height = 40): string {
	const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="20"/>
        <feComponentTransfer>
          <feFuncA type="discrete" tableValues="1 1"/>
        </feComponentTransfer>
      </filter>
      <rect width="${width}" height="${height}" fill="#f3f4f6" filter="url(#b)"/>
    </svg>
  `;

	const base64 = Buffer.from(svg).toString("base64");
	return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate a shimmer effect data URL
 * Better visual experience during image loading
 */
export function getShimmerDataURL(width = 700, height = 475): string {
	const shimmer = `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f3f4f6" offset="20%" />
          <stop stop-color="#e5e7eb" offset="50%" />
          <stop stop-color="#f3f4f6" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="#f3f4f6" />
      <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${width}" to="${width}" dur="1s" repeatCount="indefinite"  />
    </svg>
  `;

	const base64 = Buffer.from(shimmer).toString("base64");
	return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate a colored blur placeholder based on theme
 */
export function getColoredBlurDataURL(color = "#2A6592"): string {
	const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="20"/>
      </filter>
      <rect width="40" height="40" fill="${color}" filter="url(#b)"/>
    </svg>
  `;

	const base64 = Buffer.from(svg).toString("base64");
	return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Get product image blur placeholder
 * Uses product's primary color if available
 */
export function getProductImageBlur(primaryColor?: string): string {
	if (primaryColor) {
		return getColoredBlurDataURL(primaryColor);
	}
	return getShimmerDataURL();
}

/**
 * Get collection image blur placeholder
 */
export function getCollectionImageBlur(): string {
	return getShimmerDataURL(800, 450);
}

/**
 * Get blog image blur placeholder
 */
export function getBlogImageBlur(): string {
	return getShimmerDataURL(1200, 630);
}
