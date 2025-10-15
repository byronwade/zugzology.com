/**
 * Advanced Connection Management System
 * Adapts prefetching behavior based on network conditions and device capabilities
 */

type NetworkInfo = {
	effectiveType: "slow-2g" | "2g" | "3g" | "4g";
	downlink: number;
	rtt: number;
	saveData: boolean;
};

type DeviceCapabilities = {
	memory: number;
	cores: number;
	connectionType: string;
	isMobile: boolean;
	supportsWebP: boolean;
	supportsAVIF: boolean;
};

type AdaptiveSettings = {
	maxConcurrentRequests: number;
	prefetchDelay: number;
	maxImageSize: number;
	enablePrefetch: boolean;
	quality: "low" | "medium" | "high";
	format: "jpg" | "webp" | "avif";
	enableIntersectionPrefetch: boolean;
	enableIdlePrefetch: boolean;
};

class ConnectionManager {
	private networkInfo: NetworkInfo | null = null;
	private deviceCapabilities: DeviceCapabilities | null = null;
	private adaptiveSettings: AdaptiveSettings;
	private readonly connectionChangeCallbacks: Array<(settings: AdaptiveSettings) => void> = [];

	constructor() {
		this.adaptiveSettings = this.getDefaultSettings();
		this.initialize();
	}

	private async initialize(): Promise<void> {
		if (typeof window === "undefined") {
			return;
		}

		// Detect network capabilities
		await this.detectNetworkInfo();

		// Detect device capabilities
		await this.detectDeviceCapabilities();

		// Calculate optimal settings
		this.adaptiveSettings = this.calculateOptimalSettings();

		// Listen for network changes
		this.setupNetworkListeners();

		// Notify listeners of initial settings
		this.notifyListeners();
	}

	private async detectNetworkInfo(): Promise<void> {
		if ("connection" in navigator) {
			const connection = (navigator as any).connection;
			this.networkInfo = {
				effectiveType: connection.effectiveType || "4g",
				downlink: connection.downlink || 10,
				rtt: connection.rtt || 100,
				saveData: connection.saveData,
			};
		}
	}

	private async detectDeviceCapabilities(): Promise<void> {
		const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

		this.deviceCapabilities = {
			memory: (navigator as any).deviceMemory || (isMobile ? 2 : 8),
			cores: navigator.hardwareConcurrency || (isMobile ? 4 : 8),
			connectionType: this.networkInfo?.effectiveType || "4g",
			isMobile,
			supportsWebP: await this.detectImageFormat("webp"),
			supportsAVIF: await this.detectImageFormat("avif"),
		};
	}

	private async detectImageFormat(format: "webp" | "avif"): Promise<boolean> {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => resolve(true);
			img.onerror = () => resolve(false);

			const testImages = {
				webp: "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA",
				avif: "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=",
			};

			img.src = testImages[format];
		});
	}

	private calculateOptimalSettings(): AdaptiveSettings {
		const network = this.networkInfo;
		const device = this.deviceCapabilities;

		if (!(network && device)) {
			return this.getDefaultSettings();
		}

		// Start with base settings
		let settings = this.getDefaultSettings();

		// Adjust based on network speed
		switch (network.effectiveType) {
			case "slow-2g":
			case "2g":
				settings = {
					...settings,
					maxConcurrentRequests: 1,
					prefetchDelay: 500,
					maxImageSize: 50_000, // 50KB
					enablePrefetch: false,
					quality: "low",
					enableIntersectionPrefetch: false,
					enableIdlePrefetch: false,
				};
				break;

			case "3g":
				settings = {
					...settings,
					maxConcurrentRequests: 2,
					prefetchDelay: 200,
					maxImageSize: 200_000, // 200KB
					enablePrefetch: true,
					quality: "medium",
					enableIntersectionPrefetch: false,
					enableIdlePrefetch: true,
				};
				break;

			case "4g":
				settings = {
					...settings,
					maxConcurrentRequests: device.isMobile ? 4 : 6,
					prefetchDelay: device.isMobile ? 100 : 50,
					maxImageSize: 1_000_000, // 1MB
					enablePrefetch: true,
					quality: "high",
					enableIntersectionPrefetch: true,
					enableIdlePrefetch: true,
				};
				break;
		}

		// Adjust for data saver mode
		if (network.saveData) {
			settings = {
				...settings,
				maxConcurrentRequests: Math.min(settings.maxConcurrentRequests, 2),
				enablePrefetch: false,
				quality: "low",
				maxImageSize: Math.min(settings.maxImageSize, 100_000),
			};
		}

		// Adjust for low memory devices
		if (device.memory < 4) {
			settings = {
				...settings,
				maxConcurrentRequests: Math.min(settings.maxConcurrentRequests, 3),
				maxImageSize: Math.min(settings.maxImageSize, 500_000),
			};
		}

		// Choose optimal image format
		if (device.supportsAVIF) {
			settings.format = "avif";
		} else if (device.supportsWebP) {
			settings.format = "webp";
		} else {
			settings.format = "jpg";
		}

		return settings;
	}

	private getDefaultSettings(): AdaptiveSettings {
		return {
			maxConcurrentRequests: 6,
			prefetchDelay: 50,
			maxImageSize: 1_000_000,
			enablePrefetch: true,
			quality: "high",
			format: "jpg",
			enableIntersectionPrefetch: true,
			enableIdlePrefetch: true,
		};
	}

	private setupNetworkListeners(): void {
		if ("connection" in navigator) {
			const connection = (navigator as any).connection;
			connection.addEventListener("change", () => {
				this.detectNetworkInfo().then(() => {
					this.adaptiveSettings = this.calculateOptimalSettings();
					this.notifyListeners();
				});
			});
		}

		// Listen for online/offline changes
		window.addEventListener("online", () => {
			this.adaptiveSettings.enablePrefetch = true;
			this.notifyListeners();
		});

		window.addEventListener("offline", () => {
			this.adaptiveSettings.enablePrefetch = false;
			this.notifyListeners();
		});
	}

	private notifyListeners(): void {
		this.connectionChangeCallbacks.forEach((callback) => {
			callback(this.adaptiveSettings);
		});
	}

	/**
	 * Get current adaptive settings
	 */
	getSettings(): AdaptiveSettings {
		return { ...this.adaptiveSettings };
	}

	/**
	 * Subscribe to connection changes
	 */
	onSettingsChange(callback: (settings: AdaptiveSettings) => void): () => void {
		this.connectionChangeCallbacks.push(callback);

		// Return unsubscribe function
		return () => {
			const index = this.connectionChangeCallbacks.indexOf(callback);
			if (index > -1) {
				this.connectionChangeCallbacks.splice(index, 1);
			}
		};
	}

	/**
	 * Get optimized image URL with format and quality
	 */
	getOptimizedImageUrl(originalUrl: string): string {
		if (!originalUrl.includes("cdn.shopify.com")) {
			return originalUrl;
		}

		const settings = this.getSettings();
		const url = new URL(originalUrl);

		// Add quality parameter
		const qualityMap = { low: 50, medium: 75, high: 90 };
		url.searchParams.set("quality", qualityMap[settings.quality].toString());

		// Add format parameter
		if (settings.format !== "jpg") {
			url.searchParams.set("format", settings.format);
		}

		// Add max size constraint
		const maxDimension = Math.sqrt(settings.maxImageSize / 0.8); // Rough estimate
		url.searchParams.set("width", Math.round(maxDimension).toString());

		return url.toString();
	}

	/**
	 * Check if prefetching should be enabled for current conditions
	 */
	shouldPrefetch(): boolean {
		return this.adaptiveSettings.enablePrefetch && navigator.onLine;
	}

	/**
	 * Get performance metrics
	 */
	getPerformanceMetrics() {
		return {
			networkInfo: this.networkInfo,
			deviceCapabilities: this.deviceCapabilities,
			adaptiveSettings: this.adaptiveSettings,
			isOnline: navigator.onLine,
			timestamp: typeof window !== "undefined" ? Date.now() : 0,
		};
	}
}

// Global instance
export const connectionManager = new ConnectionManager();

/**
 * React hook for connection-aware behavior
 */
export function useConnectionAware() {
	const [settings, setSettings] = React.useState(connectionManager.getSettings());

	React.useEffect(() => {
		const unsubscribe = connectionManager.onSettingsChange(setSettings);
		return unsubscribe;
	}, []);

	return {
		settings,
		shouldPrefetch: connectionManager.shouldPrefetch(),
		getOptimizedImageUrl: connectionManager.getOptimizedImageUrl.bind(connectionManager),
		getPerformanceMetrics: connectionManager.getPerformanceMetrics.bind(connectionManager),
	};
}

// Import React for the hook
import React from "react";
