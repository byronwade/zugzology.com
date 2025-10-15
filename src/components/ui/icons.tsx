import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
	return (
		<svg className={cn("animate-spin", className)} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path
				className="opacity-75"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				fill="currentColor"
			/>
		</svg>
	);
}

export function Logo({ className }: { className?: string }) {
	return (
		<svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M12 2L2 7L12 12L22 7L12 2Z"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
			/>
			<path d="M2 17L12 22L22 17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
			<path d="M2 12L12 17L22 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
		</svg>
	);
}
