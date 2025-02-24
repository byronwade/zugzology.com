import { useEffect } from "react";

export function useIntersectionObserver(ref: React.RefObject<Element>, callback: (entries: IntersectionObserverEntry[]) => void, options: IntersectionObserverInit = {}): void {
	useEffect(() => {
		if (!ref.current) return;

		const observer = new IntersectionObserver(callback, options);
		observer.observe(ref.current);

		return () => {
			observer.disconnect();
		};
	}, [ref, callback, options]);
}
