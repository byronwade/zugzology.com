import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		// Set up the timeout
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		// Clean up on value change or unmount
		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
}
