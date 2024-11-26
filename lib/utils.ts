import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | undefined | null | false)[]) {
	return inputs.filter(Boolean).join(" ");
}

export function formatPrice(amount: number, currencyCode: string = "USD") {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currencyCode,
		minimumFractionDigits: 2,
	}).format(amount);
}

export function shimmer(w: number, h: number) {
	return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<linearGradient id="g">
				<stop stop-color="#f6f7f8" offset="0%"/>
				<stop stop-color="#edeef1" offset="20%"/>
				<stop stop-color="#f6f7f8" offset="40%"/>
				<stop stop-color="#f6f7f8" offset="100%"/>
			</linearGradient>
		</defs>
		<rect width="${w}" height="${h}" fill="#f6f7f8"/>
		<rect width="${w}" height="${h}" fill="url(#g)"/>
	</svg>`;
}

export function toBase64(str: string) {
	return typeof window === "undefined" ? Buffer.from(str).toString("base64") : window.btoa(str);
}

export function getValidNumber(value: string | number | undefined | null): number {
	if (typeof value === "undefined" || value === null) return 0;
	if (typeof value === "number") return value;
	const num = parseFloat(value);
	return isNaN(num) ? 0 : num;
}
