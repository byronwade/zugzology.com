import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the framing of HeroVideoCinematic so the swap-in is not a jump cut. */
export function HeroVideoSkeleton() {
	return (
		<section className="relative flex h-[calc(100vh-var(--header-height))] w-full flex-col overflow-hidden bg-[hsl(205_45%_3%)]">
			<div className="absolute inset-0 bg-[radial-gradient(75%_65%_at_35%_35%,hsl(202_35%_14%)_0%,hsl(205_45%_4%)_70%)]" />

			{/* Top letterbox bar */}
			<div className="absolute inset-x-0 top-0 z-20 h-[clamp(12px,3vh,30px)] bg-[hsl(205_55%_2%)]" />

			<div className="relative z-10 flex flex-1 items-center">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-3xl lg:max-w-4xl">
						<div className="mb-6 flex items-center gap-3 sm:mb-8">
							<span className="h-px w-8 bg-white/20 sm:w-12" />
							<Skeleton className="h-2.5 w-40 rounded-sm bg-white/10" />
						</div>

						<div className="mb-6 space-y-3 sm:mb-8">
							<Skeleton className="h-[clamp(2.5rem,10vw,7.5rem)] w-40 rounded-sm bg-white/10" />
							<Skeleton className="h-[clamp(2.5rem,10vw,7.5rem)] w-[26rem] max-w-full rounded-sm bg-white/10" />
							<Skeleton className="h-[clamp(2.5rem,10vw,7.5rem)] w-80 max-w-full rounded-sm bg-white/10" />
						</div>

						<div className="mb-8 space-y-2 sm:mb-10">
							<Skeleton className="h-5 w-full max-w-xl rounded-sm bg-white/10" />
							<Skeleton className="h-5 w-2/3 max-w-xl rounded-sm bg-white/10" />
						</div>

						<div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
							<Skeleton className="h-12 w-full rounded-sm bg-white/10 sm:h-14 sm:w-52" />
							<Skeleton className="h-12 w-full rounded-sm bg-white/10 sm:h-14 sm:w-52" />
						</div>
					</div>
				</div>
			</div>

			{/* Bottom letterbox bar, carrying the slate */}
			<div className="relative z-20 border-white/10 border-t bg-[hsl(205_55%_2%)]">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-2 divide-x divide-white/10 sm:grid-cols-4">
						{["a", "b", "c", "d"].map((slot) => (
							<div className="px-4 py-4 first:pl-0 sm:py-5" key={slot}>
								<Skeleton className="h-2.5 w-20 rounded-sm bg-white/10" />
								<Skeleton className="mt-3 h-4 w-16 rounded-sm bg-white/10" />
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
