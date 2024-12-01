import { Suspense } from "react";
import { getMenuItems } from "./menu-items";
import { HeaderClient } from "./header-client";

function HeaderLoading() {
	return (
		<div className="w-full h-16 bg-background animate-pulse">
			<div className="max-w-screen-xl mx-auto px-4 h-full flex items-center justify-between">
				<div className="w-32 h-8 bg-muted rounded" />
				<div className="flex-1 mx-4">
					<div className="w-full h-10 bg-muted rounded" />
				</div>
				<div className="flex space-x-2">
					<div className="w-10 h-10 bg-muted rounded" />
					<div className="w-10 h-10 bg-muted rounded" />
				</div>
			</div>
		</div>
	);
}

export async function Header() {
	const menuItems = await getMenuItems();

	return (
		<Suspense fallback={<HeaderLoading />}>
			<HeaderClient initialMenuItems={menuItems} />
		</Suspense>
	);
}
