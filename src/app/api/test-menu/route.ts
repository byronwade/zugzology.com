import { NextResponse } from "next/server";
import { getMenu } from "@/lib/api/shopify/actions";

export async function GET() {
	try {
		const menuItems = await getMenu("main-menu");

		return NextResponse.json({
			success: true,
			menuItems,
			count: menuItems.length,
		});
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
