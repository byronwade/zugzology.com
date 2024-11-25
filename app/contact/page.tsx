export const runtime = "edge";
export const preferredRegion = "auto";
export const revalidate = 0;

import { Suspense } from "react";

export default async function ContactPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<div>Contact</div>
		</Suspense>
	);
}
