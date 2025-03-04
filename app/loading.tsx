import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
	return (
		<div className="min-h-screen">
			{/* Hero Section Skeleton */}
			<div className="w-full bg-gray-100 dark:bg-gray-900 py-12 md:py-24">
				<div className="container mx-auto px-4">
					<div className="flex flex-col items-center justify-center text-center">
						<Skeleton className="h-10 w-3/4 md:w-1/2 mb-4" />
						<Skeleton className="h-6 w-5/6 md:w-2/3 mb-2" />
						<Skeleton className="h-6 w-4/6 md:w-1/2 mb-8" />
						<div className="flex gap-4 justify-center">
							<Skeleton className="h-10 w-32" />
							<Skeleton className="h-10 w-32" />
						</div>
					</div>
				</div>
			</div>

			{/* Featured Collections Skeleton */}
			<div className="container mx-auto px-4 py-10 md:py-16">
				<Skeleton className="h-8 w-64 mb-8 mx-auto" />
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
					{Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="group">
							<div className="relative overflow-hidden rounded-lg">
								<Skeleton className="w-full h-64" />
							</div>
							<div className="mt-2">
								<Skeleton className="h-5 w-32" />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Best Sellers Skeleton */}
			<div className="container mx-auto px-4 py-10 md:py-16">
				<div className="flex justify-between items-center mb-6 md:mb-8">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-6 w-24" />
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="group">
							<Skeleton className="w-full h-64 rounded-lg mb-3" />
							<Skeleton className="h-5 w-full max-w-[180px] mb-2" />
							<Skeleton className="h-4 w-16" />
						</div>
					))}
				</div>
			</div>

			{/* Latest Products Skeleton */}
			<div className="container mx-auto px-4 py-10 md:py-16">
				<div className="flex justify-between items-center mb-6 md:mb-8">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-6 w-24" />
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="group">
							<Skeleton className="w-full h-64 rounded-lg mb-3" />
							<Skeleton className="h-5 w-full max-w-[180px] mb-2" />
							<Skeleton className="h-4 w-16" />
						</div>
					))}
				</div>
			</div>

			{/* Expert Resources Skeleton */}
			<div className="bg-gray-50 dark:bg-gray-900 py-10 md:py-16">
				<div className="container mx-auto px-4">
					<Skeleton className="h-8 w-80 mx-auto mb-8" />
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="group">
								<Skeleton className="w-full h-48 rounded-lg mb-3" />
								<Skeleton className="h-5 w-48 mb-2" />
								<Skeleton className="h-4 w-full" />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* FAQ Skeleton */}
			<div className="container mx-auto px-4 py-10 md:py-16">
				<Skeleton className="h-8 w-48 mx-auto mb-8" />
				<div className="max-w-3xl mx-auto">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="mb-4">
							<Skeleton className="h-6 w-full mb-2" />
							<Skeleton className="h-16 w-full" />
						</div>
					))}
				</div>
			</div>

			{/* Newsletter Skeleton */}
			<div className="bg-primary text-white py-10 md:py-16">
				<div className="container mx-auto px-4 text-center">
					<Skeleton className="h-8 w-64 mx-auto mb-4 bg-white/20" />
					<Skeleton className="h-5 w-full max-w-md mx-auto mb-6 bg-white/20" />
					<div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
						<Skeleton className="h-12 flex-grow bg-white/20" />
						<Skeleton className="h-12 w-32 bg-white/20" />
					</div>
				</div>
			</div>
		</div>
	);
}
