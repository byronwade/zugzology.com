"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatPrice } from "@/lib/utils/filter-utils";

type PriceRangeFilterProps = {
	min: number;
	max: number;
	currentMin: number;
	currentMax: number;
	onRangeChange: (min: number, max: number) => void;
};

export const PriceRangeFilter = memo(function PriceRangeFilter({
	min,
	max,
	currentMin,
	currentMax,
	onRangeChange,
}: PriceRangeFilterProps) {
	const [localMin, setLocalMin] = useState(currentMin);
	const [localMax, setLocalMax] = useState(currentMax);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Debounced update function
	const debouncedUpdate = useCallback(
		(newMin: number, newMax: number) => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}

			debounceTimerRef.current = setTimeout(() => {
				onRangeChange(newMin, newMax);
			}, 300); // Wait 300ms after user stops dragging
		},
		[onRangeChange]
	);

	// Cleanup on unmount
	useEffect(
		() => () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		},
		[]
	);

	const handleSliderChange = useCallback(
		(values: number[]) => {
			const [newMin, newMax] = values;
			setLocalMin(newMin);
			setLocalMax(newMax);
			// Debounce the actual filter update
			debouncedUpdate(newMin, newMax);
		},
		[debouncedUpdate]
	);

	const handleSliderCommit = useCallback(
		(values: number[]) => {
			const [newMin, newMax] = values;
			// Cancel debounce and update immediately on release
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
			onRangeChange(newMin, newMax);
		},
		[onRangeChange]
	);

	const handleMinInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Number.parseInt(e.target.value, 10) || min;
			const clampedValue = Math.max(min, Math.min(value, localMax));
			setLocalMin(clampedValue);
		},
		[min, localMax]
	);

	const handleMaxInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Number.parseInt(e.target.value, 10) || max;
			const clampedValue = Math.min(max, Math.max(value, localMin));
			setLocalMax(clampedValue);
		},
		[max, localMin]
	);

	const handleInputBlur = useCallback(() => {
		onRangeChange(localMin, localMax);
	}, [localMin, localMax, onRangeChange]);

	return (
		<div className="space-y-5">
			<div className="px-2 py-3">
				<Slider
					className="w-full touch-manipulation"
					max={max}
					min={min}
					onValueChange={handleSliderChange}
					onValueCommit={handleSliderCommit}
					step={1}
					value={[localMin, localMax]}
				/>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-2">
					<Label className="font-medium text-foreground text-xs" htmlFor="min-price">
						Min Price
					</Label>
					<div className="relative">
						<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">
							$
						</span>
						<Input
							className="h-11 touch-manipulation pl-7 text-base"
							id="min-price"
							inputMode="numeric"
							max={localMax}
							min={min}
							onBlur={handleInputBlur}
							onChange={handleMinInputChange}
							type="number"
							value={localMin}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label className="font-medium text-foreground text-xs" htmlFor="max-price">
						Max Price
					</Label>
					<div className="relative">
						<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">
							$
						</span>
						<Input
							className="h-11 touch-manipulation pl-7 text-base"
							id="max-price"
							inputMode="numeric"
							max={max}
							min={localMin}
							onBlur={handleInputBlur}
							onChange={handleMaxInputChange}
							type="number"
							value={localMax}
						/>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-muted-foreground text-sm">
				<span className="font-medium">{formatPrice(localMin)}</span>
				<span className="text-muted-foreground/50">to</span>
				<span className="font-medium">{formatPrice(localMax)}</span>
			</div>
		</div>
	);
});
