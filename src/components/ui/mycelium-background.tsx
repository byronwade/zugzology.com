"use client";

import { useEffect, useRef } from "react";

export type CollisionBox = {
	id: string;
	position: { x: number; y: number; z: number };
	size: { width: number; height: number; depth: number };
};

export type MyceliumBackgroundProps = {
	color?: string;
	nodeCount?: number;
	interactive?: boolean;
	className?: string;
	density?: "low" | "medium" | "high" | "ultra";
	collisionBoxes?: CollisionBox[];
};

type Point = { x: number; y: number };
type Strand = {
	points: Point[];
	opacity: number;
	phase: number;
};

// Density configurations
const DENSITY_CONFIG = {
	low: { origins: 3, strandsPerOrigin: 8, segmentsPerStrand: 15, branches: 1 },
	medium: { origins: 5, strandsPerOrigin: 12, segmentsPerStrand: 20, branches: 2 },
	high: { origins: 8, strandsPerOrigin: 15, segmentsPerStrand: 25, branches: 3 },
	ultra: { origins: 12, strandsPerOrigin: 20, segmentsPerStrand: 30, branches: 4 },
} as const;

// Generate mycelium network using efficient algorithm
function generateMyceliumNetwork(
	width: number,
	height: number,
	config: typeof DENSITY_CONFIG.ultra
): Strand[] {
	const strands: Strand[] = [];
	const origins: Point[] = [];

	// Create spore origin points (clustered in lower right for growth effect)
	for (let i = 0; i < config.origins; i++) {
		origins.push({
			x: width * 0.6 + Math.random() * width * 0.3,
			y: height * 0.6 + Math.random() * height * 0.3,
		});
	}

	// Generate main strands from each origin
	for (const origin of origins) {
		for (let i = 0; i < config.strandsPerOrigin; i++) {
			const angle = (i / config.strandsPerOrigin) * Math.PI * 2 + Math.random() * 0.5;
			generateStrand(origin, angle, config.segmentsPerStrand, strands, config.branches, 0);
		}
	}

	return strands;
}

// Check if a point is inside a collision box (2D screen space)
function isPointInCollisionBox(point: Point, boxes: CollisionBox[]): boolean {
	for (const box of boxes) {
		// For canvas 2D, we just need the screen position
		// The collision boxes come from DOM elements, so we use their screen coordinates
		const boxLeft = box.position.x - box.size.width / 2;
		const boxRight = box.position.x + box.size.width / 2;
		const boxTop = box.position.y - box.size.height / 2;
		const boxBottom = box.position.y + box.size.height / 2;

		if (point.x >= boxLeft && point.x <= boxRight && point.y >= boxTop && point.y <= boxBottom) {
			return true;
		}
	}
	return false;
}

// Recursively generate branching strands
function generateStrand(
	start: Point,
	initialAngle: number,
	segments: number,
	strands: Strand[],
	branchesRemaining: number,
	depth: number
) {
	const points: Point[] = [{ ...start }];
	let currentX = start.x;
	let currentY = start.y;
	let currentAngle = initialAngle;

	const segmentLength = 8 + Math.random() * 12;
	const curviness = 0.15 + Math.random() * 0.15;

	for (let i = 0; i < segments; i++) {
		// Add organic curve
		currentAngle += (Math.random() - 0.5) * curviness;

		// Move forward
		currentX += Math.cos(currentAngle) * segmentLength;
		currentY += Math.sin(currentAngle) * segmentLength;

		points.push({ x: currentX, y: currentY });

		// Branching logic - create sub-strands at intervals
		if (branchesRemaining > 0 && i > 5 && i % 8 === 0 && Math.random() > 0.6) {
			const branchAngle = currentAngle + (Math.random() - 0.5) * Math.PI * 0.6;
			const branchSegments = Math.floor(segments * 0.6);
			generateStrand(
				{ x: currentX, y: currentY },
				branchAngle,
				branchSegments,
				strands,
				branchesRemaining - 1,
				depth + 1
			);
		}
	}

	strands.push({
		points,
		opacity: 0.3 + Math.random() * 0.4,
		phase: Math.random() * Math.PI * 2,
	});
}

export function MyceliumBackground({
	color = "#f5f5dc",
	className = "",
	density = "medium",
	collisionBoxes = [],
}: MyceliumBackgroundProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationRef = useRef<number>();
	const strandsRef = useRef<Strand[]>([]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d", { alpha: true });
		if (!ctx) return;

		// Set canvas size
		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			const rect = canvas.getBoundingClientRect();
			canvas.width = rect.width * dpr;
			canvas.height = rect.height * dpr;
			ctx.scale(dpr, dpr);
			canvas.style.width = `${rect.width}px`;
			canvas.style.height = `${rect.height}px`;

			// Regenerate strands on resize
			const config = DENSITY_CONFIG[density];
			strandsRef.current = generateMyceliumNetwork(rect.width, rect.height, config);
		};

		resize();
		window.addEventListener("resize", resize);

		// Animation loop
		let time = 0;
		const animate = () => {
			if (!ctx || !canvas) return;

			time += 0.01;

			// Clear with slight fade for trail effect
			ctx.fillStyle = "rgba(10, 10, 10, 0.03)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Draw all strands
			ctx.lineWidth = 0.8;
			ctx.lineCap = "round";
			ctx.lineJoin = "round";

			for (const strand of strandsRef.current) {
				// Gentle pulsing opacity
				const pulse = Math.sin(time * 0.5 + strand.phase) * 0.15 + 0.85;
				const opacity = strand.opacity * pulse;

				ctx.strokeStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, "0")}`;

				// Draw strand with collision detection
				let isDrawing = false;
				for (let i = 0; i < strand.points.length; i++) {
					const point = strand.points[i];
					const inCollision = isPointInCollisionBox(point, collisionBoxes);

					if (!inCollision) {
						if (!isDrawing) {
							// Start new path segment
							ctx.beginPath();
							ctx.moveTo(point.x, point.y);
							isDrawing = true;
						} else {
							// Continue drawing
							ctx.lineTo(point.x, point.y);
						}
					} else if (isDrawing) {
						// Hit collision, stroke what we have and stop
						ctx.stroke();
						isDrawing = false;
					}
				}

				// Stroke any remaining path
				if (isDrawing) {
					ctx.stroke();
				}
			}

			animationRef.current = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener("resize", resize);
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [color, density, collisionBoxes]);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden="true"
			className={`pointer-events-none absolute inset-0 z-[1] ${className}`}
			style={{
				background: "linear-gradient(to bottom right, #0a0a0a, #0f0f0f)",
			}}
		/>
	);
}
