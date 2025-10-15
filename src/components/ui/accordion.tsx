"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

type AccordionProps = {
	children: React.ReactNode;
	type?: "single" | "multiple";
	defaultValue?: string | string[];
	className?: string;
};

type AccordionItemProps = {
	children: React.ReactNode;
	value: string;
	className?: string;
};

type AccordionTriggerProps = {
	children: React.ReactNode;
	className?: string;
};

type AccordionContentProps = {
	children: React.ReactNode;
	className?: string;
};

const AccordionContext = React.createContext<{
	openItems: string[];
	toggleItem: (value: string) => void;
	type: "single" | "multiple";
}>({
	openItems: [],
	toggleItem: () => {},
	type: "single",
});

const AccordionItemContext = React.createContext<{
	value: string;
	isOpen: boolean;
}>({
	value: "",
	isOpen: false,
});

export const Accordion = ({
	children,
	type = "single",
	defaultValue = "",
	className,
	ref,
}: AccordionProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
	const [openItems, setOpenItems] = React.useState<string[]>(
		Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
	);

	const toggleItem = React.useCallback(
		(value: string) => {
			setOpenItems((prev) => {
				if (type === "single") {
					return prev.includes(value) ? [] : [value];
				}
				return prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value];
			});
		},
		[type]
	);

	return (
		<AccordionContext.Provider value={{ openItems, toggleItem, type }}>
			<div className={cn("space-y-2", className)} ref={ref}>
				{children}
			</div>
		</AccordionContext.Provider>
	);
};
Accordion.displayName = "Accordion";

export const AccordionItem = ({
	children,
	value,
	className,
	ref,
}: AccordionItemProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
	const { openItems } = React.useContext(AccordionContext);
	const isOpen = openItems.includes(value);

	return (
		<AccordionItemContext.Provider value={{ value, isOpen }}>
			<div className={cn("rounded-lg border", className)} ref={ref}>
				{children}
			</div>
		</AccordionItemContext.Provider>
	);
};
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = ({
	children,
	className,
	ref,
}: AccordionTriggerProps & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
	const { toggleItem } = React.useContext(AccordionContext);
	const { value, isOpen } = React.useContext(AccordionItemContext);

	return (
		<button
			className={cn(
				"flex w-full items-center justify-between px-4 py-3 text-left font-medium transition-all",
				className
			)}
			onClick={() => toggleItem(value)}
			ref={ref}
			type="button"
		>
			{children}
			<ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
		</button>
	);
};
AccordionTrigger.displayName = "AccordionTrigger";

export const AccordionContent = ({
	children,
	className,
	ref,
}: AccordionContentProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
	const { isOpen } = React.useContext(AccordionItemContext);

	if (!isOpen) {
		return null;
	}

	return (
		<div className={cn("slide-in-from-top-2 animate-in px-4 pt-0 pb-4", className)} ref={ref}>
			{children}
		</div>
	);
};
AccordionContent.displayName = "AccordionContent";
