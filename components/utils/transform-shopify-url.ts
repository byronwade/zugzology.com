export function transformShopifyUrl(shopifyUrl: string): string {
	if (!shopifyUrl) return "/";

	let url = shopifyUrl.replace(/^https?:\/\/[^\/]+/, "");

	url = url.replace(/\/collections\/([^\/]+)/, "/collections/$1");
	url = url.replace(/\/products\/([^\/]+)/, "/products/$1");
	url = url.replace(/\/blogs\/([^\/]+)/, "/blogs/$1");
	url = url.replace(/\/blogs\/([^\/]+)\/([^\/]+)/, "/blogs/$1/$2");
	url = url.replace(/\/pages\/([^\/]+)/, "/$1");

	if (!url || url === "/") {
		return "/";
	}

	return url;
}
