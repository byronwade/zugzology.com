// Global type declarations for the application
// This file consolidates all Window interface extensions to avoid duplicate declarations

/// <reference types="react" />

declare global {
	interface Window {
		// Google AdSense
		adsbygoogle?: any[];

		// Google Analytics / Tag Manager
		gtag?: (...args: any[]) => void;
		dataLayer?: any[];

		// Next.js
		next?: {
			prefetch?: (url: string) => void;
		};

		// Trustoo Reviews
		trustoo?: {
			init?: () => void;
			refresh?: () => void;
		};

		// Model Viewer (3D Models)
		// Custom element for <model-viewer> tag
	}
}

// Declare model-viewer custom element for react-jsx mode
declare module "react/jsx-runtime" {
	namespace JSX {
		interface IntrinsicElements {
			"model-viewer": {
				src?: string;
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
				ref?: React.RefObject<any>;
				children?: React.ReactNode;
			};
		}
	}
}

export {};
