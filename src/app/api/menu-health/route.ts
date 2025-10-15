import { NextResponse } from "next/server";
import { checkMenuHealth } from "@/lib/api/shopify/menu-fetcher";
import { getStoreConfigSafe } from "@/lib/config/store-config";
import { loadStoreConfiguration } from "@/lib/config/store-data-loader";

export async function GET() {
	try {
		await loadStoreConfiguration();
		const config = getStoreConfigSafe();
		const mainMenuHandle = config.navigation?.mainMenu || "main-menu";

		const health = await checkMenuHealth(mainMenuHandle);

		return NextResponse.json({
			timestamp: new Date().toISOString(),
			handle: mainMenuHandle,
			...health,
			status: health.healthy ? "healthy" : "unhealthy",
			recommendation: health.healthy
				? "Menu is working correctly"
				: "Menu may have issues - check Shopify admin for menu configuration",
		});
	} catch (error) {
		return NextResponse.json(
			{
				timestamp: new Date().toISOString(),
				healthy: false,
				status: "error",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
