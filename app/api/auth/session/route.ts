import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/actions/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
	try {
		const session = await getSession();

		if (!session) {
			return NextResponse.json(
				{
					error: "No session found",
					user: null,
					expires: null,
				},
				{
					status: 200,
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "no-store, max-age=0",
					},
				}
			);
		}

		return NextResponse.json(session, {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "no-store, max-age=0",
			},
		});
	} catch (error) {
		console.error("[Session API] Error:", error);

		return NextResponse.json(
			{
				error: "Failed to get session",
				user: null,
				expires: null,
			},
			{
				status: 401,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store, max-age=0",
				},
			}
		);
	}
}
