import { Suspense } from "react";
import { getMainMenu } from "@/actions/getMainMenu";
import { searchProducts } from "@/actions/search";
import { Header } from "./header";

// This is a Server Component
async function HeaderServer() {
	const menu = await getMainMenu();
	return <Header initialMenu={menu?.items || []} search={searchProducts} />;
}

// This is a Client Component wrapper
export function HeaderWrapper() {
	return (
		<Suspense
			fallback={
				<div className="h-16 bg-background border-b flex items-center px-4">
					<div className="w-24 h-6 bg-gray-200 rounded animate-pulse" />
				</div>
			}
		>
			<HeaderServer />
		</Suspense>
	);
}
