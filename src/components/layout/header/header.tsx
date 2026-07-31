import { Suspense } from "react";

import { getHeaderBlogs } from "@/lib/api/shopify/actions";

import { HeaderClient } from "./header-client";
import { getMenuItems } from "./menu-items";

function HeaderLoading(): React.ReactElement {
	return (
		<div className="safe-area-top h-16 w-full animate-pulse bg-background">
			<div className="mx-auto flex h-full max-w-screen-xl items-center justify-between px-4">
				<div className="h-8 w-32 rounded bg-muted" />
				<div className="mx-4 flex-1">
					<div className="h-10 w-full rounded bg-muted" />
				</div>
				<div className="flex space-x-2">
					<div className="h-10 w-10 rounded bg-muted" />
					<div className="h-10 w-10 rounded bg-muted" />
				</div>
			</div>
		</div>
	);
}

async function HeaderContent(): Promise<React.ReactElement> {
	const [menuItems, blogs] = await Promise.all([getMenuItems().catch(() => []), getHeaderBlogs().catch(() => [])]);

	// Auth is resolved client-side via NextAuth — avoid cookies()/headers() so the shell can cache.
	return <HeaderClient blogs={blogs} initialMenuItems={menuItems} />;
}

export default async function Header(): Promise<React.ReactElement> {
	return (
		<div className="sticky top-0 z-50">
			<Suspense fallback={<HeaderLoading />}>
				<HeaderContent />
			</Suspense>
		</div>
	);
}
