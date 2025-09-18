import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Performance utilities inspired by NextMaster patterns
 */

// Stable reference hook - prevents unnecessary re-renders
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
	const callbackRef = useRef(callback);
	
	useEffect(() => {
		callbackRef.current = callback;
	});
	
	return useCallback((...args: any[]) => {
		return callbackRef.current(...args);
	}, []) as T;
}

// Memoization helper for expensive computations
export function useExpensiveMemo<T>(
	factory: () => T,
	deps: React.DependencyList,
	debugName?: string
): T {
	return useMemo(() => {
		const start = performance.now();
		const result = factory();
		const end = performance.now();
		
		if (debugName && process.env.NODE_ENV === 'development') {
			console.log(`[Performance] ${debugName} computed in ${end - start}ms`);
		}
		
		return result;
	}, deps);
}

// Smart memo wrapper with display name preservation
export function smartMemo<T extends React.ComponentType<any>>(
	Component: T,
	propsAreEqual?: (
		prevProps: React.ComponentProps<T>,
		nextProps: React.ComponentProps<T>
	) => boolean
): T {
	const MemoizedComponent = memo(Component, propsAreEqual);
	
	// Preserve display name for debugging
	MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name || 'Anonymous'})`;
	
	return MemoizedComponent as T;
}

// Debounce hook for performance-critical operations
export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

	React.useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
	targetRef: React.RefObject<Element>,
	options: IntersectionObserverInit = {}
) {
	const [isIntersecting, setIsIntersecting] = React.useState(false);

	React.useEffect(() => {
		const target = targetRef.current;
		if (!target) return;

		const observer = new IntersectionObserver(([entry]) => {
			setIsIntersecting(entry.isIntersecting);
		}, options);

		observer.observe(target);

		return () => {
			observer.unobserve(target);
		};
	}, [targetRef, options]);

	return isIntersecting;
}

// Virtual scrolling helper for large lists
export function useVirtualizedList<T>(
	items: T[],
	itemHeight: number,
	containerHeight: number
) {
	const [scrollTop, setScrollTop] = React.useState(0);

	const visibleItems = useMemo(() => {
		const startIndex = Math.floor(scrollTop / itemHeight);
		const endIndex = Math.min(
			startIndex + Math.ceil(containerHeight / itemHeight) + 1,
			items.length
		);

		return {
			startIndex,
			endIndex,
			visibleItems: items.slice(startIndex, endIndex),
			totalHeight: items.length * itemHeight,
		};
	}, [items, itemHeight, containerHeight, scrollTop]);

	const handleScroll = useStableCallback((e: React.UIEvent<HTMLDivElement>) => {
		setScrollTop(e.currentTarget.scrollTop);
	});

	return {
		...visibleItems,
		handleScroll,
	};
}

// Performance-optimized state updater
export function useOptimisticState<T>(
	initialState: T,
	updateFn: (newState: T) => Promise<T>
) {
	const [state, setState] = React.useState(initialState);
	const [optimisticState, setOptimisticState] = React.useState(initialState);
	const [isUpdating, setIsUpdating] = React.useState(false);

	const updateState = useCallback(async (newState: T) => {
		setOptimisticState(newState);
		setIsUpdating(true);

		try {
			const result = await updateFn(newState);
			setState(result);
			setOptimisticState(result);
		} catch (error) {
			// Revert optimistic update on error
			setOptimisticState(state);
			throw error;
		} finally {
			setIsUpdating(false);
		}
	}, [state, updateFn]);

	return {
		state: optimisticState,
		actualState: state,
		isUpdating,
		updateState,
	};
}

// Bundle analyzer helper (development only)
export function logBundleSize(componentName: string) {
	if (process.env.NODE_ENV === 'development') {
		console.log(`[Bundle] ${componentName} rendered`);
	}
}

export { memo, useMemo, useCallback } from 'react';