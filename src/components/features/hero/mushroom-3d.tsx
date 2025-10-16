"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import type { Group, Mesh } from "three";

function Mushroom({ isGrowing }: { isGrowing: boolean }) {
	const mushroomRef = useRef<Group>(null);
	const capRef = useRef<Mesh>(null);
	const stemRef = useRef<Mesh>(null);

	useFrame((state) => {
		if (!mushroomRef.current) {
			return;
		}

		// Gentle rotation
		mushroomRef.current.rotation.y += 0.005;

		// Breathing animation
		const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;

		if (capRef.current) {
			capRef.current.scale.x = 1 + breathe;
			capRef.current.scale.z = 1 + breathe;
		}

		if (stemRef.current) {
			stemRef.current.scale.y = 1 + breathe * 0.5;
		}

		// Growing animation
		if (isGrowing && mushroomRef.current.scale.x < 1.3) {
			mushroomRef.current.scale.x += 0.01;
			mushroomRef.current.scale.y += 0.01;
			mushroomRef.current.scale.z += 0.01;
		} else if (!isGrowing && mushroomRef.current.scale.x > 1) {
			mushroomRef.current.scale.x -= 0.01;
			mushroomRef.current.scale.y -= 0.01;
			mushroomRef.current.scale.z -= 0.01;
		}
	});

	return (
		<group ref={mushroomRef}>
			{/* Mushroom Cap */}
			<mesh castShadow position={[0, 1.5, 0]} ref={capRef}>
				<sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
				<meshStandardMaterial
					color="#2A6592"
					emissive="#2A6592"
					emissiveIntensity={0.2}
					metalness={0.8}
					roughness={0.3}
				/>
			</mesh>

			{/* Cap glow */}
			<mesh position={[0, 1.5, 0]}>
				<sphereGeometry args={[1.05, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
				<meshBasicMaterial color="#2A6592" opacity={0.1} transparent />
			</mesh>

			{/* Mushroom Stem */}
			<mesh castShadow position={[0, 0.5, 0]} ref={stemRef}>
				<cylinderGeometry args={[0.3, 0.4, 1, 32]} />
				<meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.6} />
			</mesh>

			{/* Gills under cap */}
			<mesh position={[0, 1.2, 0]} rotation={[Math.PI, 0, 0]}>
				<cylinderGeometry args={[0.95, 0.3, 0.1, 32, 1, true]} />
				<meshStandardMaterial color="#f0f0f0" roughness={0.8} side={2} />
			</mesh>

			{/* Particles around mushroom */}
			{[...new Array(20)].map((_, i) => {
				const angle = (i / 20) * Math.PI * 2;
				const radius = 2;
				const x = Math.cos(angle) * radius;
				const z = Math.sin(angle) * radius;
				const y = Math.random() * 2;

				return (
					<mesh key={i} position={[x, y, z]}>
						<sphereGeometry args={[0.03, 8, 8]} />
						<meshBasicMaterial color="#2A6592" opacity={0.6} transparent />
					</mesh>
				);
			})}
		</group>
	);
}

function Scene({ isGrowing }: { isGrowing: boolean }) {
	return (
		<>
			{/* Camera */}
			<PerspectiveCamera fov={50} makeDefault position={[0, 2, 5]} />

			{/* Lights */}
			<ambientLight intensity={0.4} />
			<pointLight color="#ffffff" intensity={1} position={[10, 10, 10]} />
			<pointLight color="#2A6592" intensity={0.5} position={[-10, -10, -10]} />
			<spotLight
				angle={0.3}
				castShadow
				intensity={1}
				penumbra={1}
				position={[0, 10, 0]}
				shadow-mapSize-height={1024}
				shadow-mapSize-width={1024}
			/>

			{/* Mushroom */}
			<Mushroom isGrowing={isGrowing} />

			{/* Ground plane */}
			<mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
				<planeGeometry args={[10, 10]} />
				<meshStandardMaterial color="#000000" metalness={0.2} roughness={0.8} />
			</mesh>

			{/* Controls */}
			<OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 4} />
		</>
	);
}

export function Mushroom3D() {
	const [isGrowing, setIsGrowing] = useState(false);

	return (
		<motion.div
			animate={{ opacity: 1, scale: 1 }}
			className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-black via-primary/10 to-black"
			initial={{ opacity: 0, scale: 0.8 }}
			transition={{ duration: 1, delay: 0.2 }}
		>
			{/* Canvas */}
			<Canvas className="h-full w-full" shadows>
				<Scene isGrowing={isGrowing} />
			</Canvas>

			{/* Overlay controls */}
			<div className="absolute right-4 bottom-4 left-4 z-10">
				<motion.button
					className="w-full rounded-xl bg-primary/90 px-6 py-3 font-semibold text-white backdrop-blur-xl transition-all hover:bg-primary"
					onClick={() => {
						setIsGrowing(!isGrowing);
					}}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					{isGrowing ? "Stop Growing" : "Click to Grow"}
				</motion.button>
			</div>

			{/* Corner label */}
			<div className="absolute top-4 left-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
				<p className="text-sm text-white/80">Interactive 3D Model</p>
			</div>

			{/* Instructions */}
			<motion.div
				animate={{ opacity: 1, x: 0 }}
				className="absolute top-4 right-4 max-w-[150px] rounded-xl border border-white/10 bg-black/50 p-3 backdrop-blur-xl"
				initial={{ opacity: 0, x: 20 }}
				transition={{ delay: 1.5, duration: 0.5 }}
			>
				<p className="text-white/70 text-xs">Drag to rotate • Click button to grow</p>
			</motion.div>
		</motion.div>
	);
}
