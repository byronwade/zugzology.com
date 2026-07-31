import { Suspense } from "react";

import { getHeaderBlogs } from "@/lib/api/shopify/actions";

import { HeaderClient } from "./header-client";
import { getMenuItems } from "./menu-items";

/**
 * This is the fallback that actually renders — the one in the root layout only
 * covers this whole component failing to resolve.
 *
 * It has to be exactly as tall as HeaderClient, hence the same two rows built
 * from the same variables plus the same 1px bottom border, rather than a round
 * number. It was a single `h-16` (64px) against a real header of 101px, so the
 * status banner and the whole of <main> dropped 37px when the header resolved —
 * the last remaining layout shift on the site, and the only one whose trace
 * showed a node moving rather than resizing.
 */
function HeaderLoading(): React.ReactElement {
	return (
		<div className="safe-area-top w-full animate-pulse border-b bg-background">
			<div className="flex h-[var(--header-top-height)] items-center border-b">
				<div className="container mx-auto flex w-full items-center justify-between px-4">
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
			<div className="h-[var(--header-nav-height)]" />
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
