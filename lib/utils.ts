import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatPrice(amount: string, currency: string) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency,
		minimumFractionDigits: 2,
	}).format(parseFloat(amount));
}

export function shimmer(w: number, h: number) {
	return `<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
		<defs>
			<linearGradient id="g">
				<stop stop-color="#f6f7f8" offset="0%" />
				<stop stop-color="#edeef1" offset="20%" />
				<stop stop-color="#f6f7f8" offset="40%" />
				<stop stop-color="#f6f7f8" offset="100%" />
			</linearGradient>
		</defs>
		<rect width="${w}" height="${h}" fill="#f6f7f8" />
		<rect id="r" width="${w}" height="${h}" fill="url(#g)" />
		<animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
	</svg>`;
}

export function toBase64(str: string) {
	return typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str);
}
