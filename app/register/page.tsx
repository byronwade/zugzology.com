import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { getSiteSettings } from "@/lib/actions/shopify";

export default async function RegisterPage() {
	const siteSettings = await getSiteSettings();
	const storeName = siteSettings?.name || "Zugzology";

	return (
		<Suspense
			fallback={
				<div className="container relative flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
					<div className="animate-pulse space-y-4 p-4 lg:p-8">
						<div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
						<div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded" />
						<div className="space-y-2">
							<div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded" />
							<div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded" />
							<div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded" />
						</div>
					</div>
				</div>
			}
		>
			<RegisterForm storeName={storeName} />
		</Suspense>
	);
}
