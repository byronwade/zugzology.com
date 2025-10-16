import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

/**
 * 404 Not Found page for dynamic pages
 */
export default function PageNotFound() {
	return (
		<div className="flex min-h-[60vh] w-full items-center justify-center bg-background">
			<div className="container mx-auto px-4 py-16 text-center">
				<div className="mx-auto max-w-md">
					<FileQuestion className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
					<h1 className="mb-2 font-bold text-3xl text-foreground">Page not found</h1>
					<p className="mb-6 text-muted-foreground">
						Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
					</p>
					<div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
						<Button asChild size="lg">
							<Link href="/">Return home</Link>
						</Button>
						<Button asChild size="lg" variant="outline">
							<Link href="/products">Browse products</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
