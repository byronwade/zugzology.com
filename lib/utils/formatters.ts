export function formatMoney(amount?: string | number | null, currencyCode: string = "USD") {
	// Add safety checks
	if (amount == null) return "$0.00";

	const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

	if (isNaN(numericAmount)) return "$0.00";

	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currencyCode || "USD", // Ensure fallback
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(numericAmount);
	} catch (error) {
		console.error("Price formatting error:", { amount, currencyCode, error });
		return `$${numericAmount.toFixed(2)}`;
	}
}
