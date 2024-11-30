export function isEmptyResponse(data: any): boolean {
	if (!data) return true;
	if (Array.isArray(data)) return data.length === 0;
	if (typeof data === "object") return Object.keys(data).length === 0;
	return false;
}

export function handleEmptyResponse(data: any, type: string) {
	if (isEmptyResponse(data)) {
		return {
			notFound: true,
			props: {
				error: `No ${type} found`,
			},
		};
	}
	return { props: { data } };
}
