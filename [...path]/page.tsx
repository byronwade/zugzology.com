import { ErrorBoundary } from "@/components/error-boundary";

return (
	<ErrorBoundary fallback={<div>Something went wrong</div>}>
		<div className="min-h-screen bg-background flex flex-col">{/* ... rest of the JSX ... */}</div>
	</ErrorBoundary>
);
