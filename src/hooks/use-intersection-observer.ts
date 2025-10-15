import { type RefObject, useEffect, useState } from "react";

interface IntersectionObserverOptions extends IntersectionObserverInit {
	freezeOnceVisible?: boolean;
	skip?: boolean;
}

type IntersectionObserverResult = {
	entry: IntersectionObserverEntry | null;
	isIntersecting: boolean;
};

export function useIntersectionObserver(
	targetRef: RefObject<Element>,
	options: IntersectionObserverOptions = {}
): IntersectionObserverResult {
	const { freezeOnceVisible = false, skip = false, root = null, rootMargin, threshold } = options;

	const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

	useEffect(() => {
		const node = targetRef.current;
		if (!node || skip) {
			return;
		}

		let frozen = false;

		const observer = new IntersectionObserver(
			([observerEntry]) => {
				if (frozen) {
					return;
				}
				setEntry(observerEntry);
				if (freezeOnceVisible && observerEntry.isIntersecting) {
					frozen = true;
					observer.disconnect();
				}
			},
			{ root, rootMargin, threshold }
		);

		observer.observe(node);

		return () => {
			observer.disconnect();
		};
	}, [targetRef, freezeOnceVisible, root, rootMargin, threshold, skip]);

	return {
		entry,
		isIntersecting: !!entry?.isIntersecting,
	};
}
