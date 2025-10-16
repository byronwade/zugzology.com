import { Skeleton } from "@/components/ui/skeleton";

export function HeroVideoSkeleton() {
	return (
		<section className="relative h-[calc(100vh-var(--header-height))] w-full overflow-hidden bg-black">
			{/* Gradient background placeholder */}
			<div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

			{/* Animated mycelium pattern overlay */}
			<div className="absolute inset-0 opacity-30">
				<div
					className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_20%_30%,hsl(206_55_37/0.15)_0%,transparent_50%)]"
					style={{ animationDuration: "8s" }}
				/>
				<div
					className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_80%_70%,hsl(206_55_37/0.1)_0%,transparent_50%)]"
					style={{ animationDuration: "10s", animationDelay: "2s" }}
				/>
			</div>

			{/* Content skeleton */}
			<div className="relative z-10 flex h-full items-center">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-3xl lg:max-w-4xl">
						{/* Small badge */}
						<div className="mb-4 sm:mb-6">
							<Skeleton className="h-9 w-48 rounded-full" />
						</div>

						{/* Main headline */}
						<div className="mb-4 space-y-2 sm:mb-6">
							<Skeleton className="h-12 w-32 bg-white/10 sm:h-16 md:h-20 lg:h-24" />
							<Skeleton className="h-12 w-64 bg-white/10 sm:h-16 md:h-20 lg:h-24" />
							<Skeleton className="h-12 w-56 bg-white/10 sm:h-16 md:h-20 lg:h-24" />
						</div>

						{/* Tagline */}
						<div className="mb-6 space-y-2 sm:mb-8">
							<Skeleton className="h-6 w-full max-w-2xl bg-white/10 sm:h-7 lg:h-8" />
							<Skeleton className="h-6 w-3/4 max-w-2xl bg-white/10 sm:h-7 lg:h-8" />
						</div>

						{/* CTA Buttons */}
						<div className="mb-8 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:gap-4">
							<Skeleton className="h-12 w-full bg-white/10 sm:h-14 sm:w-48" />
							<Skeleton className="h-12 w-full bg-white/10 sm:h-14 sm:w-48" />
						</div>

						{/* Social proof */}
						<div className="flex flex-wrap items-center gap-4 sm:gap-6">
							<Skeleton className="h-8 w-40 bg-white/10" />
							<Skeleton className="h-4 w-px bg-white/20" />
							<Skeleton className="h-8 w-32 bg-white/10" />
							<Skeleton className="h-4 w-px bg-white/20" />
							<Skeleton className="h-8 w-36 bg-white/10" />
						</div>
					</div>
				</div>
			</div>

			{/* Scroll indicator skeleton */}
			<div className="absolute right-0 bottom-8 left-0 z-20 flex justify-center">
				<div className="flex flex-col items-center gap-2">
					<Skeleton className="h-3 w-12 bg-white/10" />
					<Skeleton className="h-8 w-5 rounded-full bg-white/10" />
				</div>
			</div>
		</section>
	);
}
