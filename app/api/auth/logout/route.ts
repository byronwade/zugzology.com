import { cookies } from "next/headers";

export async function POST() {
	const cookieStore = cookies();
	await cookieStore.delete({
		name: "customerAccessToken",
		path: "/",
	});

	return Response.json({ success: true });
}
