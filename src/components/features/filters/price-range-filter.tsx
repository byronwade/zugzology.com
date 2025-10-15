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
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

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
			const value = Number.parseInt(e.target.value) || min;
			const clampedValue = Math.max(min, Math.min(value, localMax));
			setLocalMin(clampedValue);
		},
		[min, localMax]
	);

	const handleMaxInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Number.parseInt(e.target.value) || max;
			const clampedValue = Math.min(max, Math.max(value, localMin));
			setLocalMax(clampedValue);
		},
		[max, localMin]
	);

	const handleInputBlur = useCallback(() => {
		onRangeChange(localMin, localMax);
	}, [localMin, localMax, onRangeChange]);

	return (
		<div className="space-y-4">
			<div className="px-1">
				<Slider
					min={min}
					max={max}
					step={1}
					value={[localMin, localMax]}
					onValueChange={handleSliderChange}
					onValueCommit={handleSliderCommit}
					className="w-full"
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="min-price" className="text-xs text-muted-foreground">
						Min Price
					</Label>
					<div className="relative">
						<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">
							$
						</span>
						<Input
							id="min-price"
							type="number"
							min={min}
							max={localMax}
							value={localMin}
							onChange={handleMinInputChange}
							onBlur={handleInputBlur}
							className="pl-7"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="max-price" className="text-xs text-muted-foreground">
						Max Price
					</Label>
					<div className="relative">
						<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">
							$
						</span>
						<Input
							id="max-price"
							type="number"
							min={localMin}
							max={max}
							value={localMax}
							onChange={handleMaxInputChange}
							onBlur={handleInputBlur}
							className="pl-7"
						/>
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between text-muted-foreground text-xs">
				<span>{formatPrice(localMin)}</span>
				<span className="text-muted-foreground/50">to</span>
				<span>{formatPrice(localMax)}</span>
			</div>
		</div>
	);
});
