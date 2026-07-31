"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type * as React from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = ({
	className,
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
	ref?: React.RefObject<React.ElementRef<typeof TabsPrimitive.List> | null>;
}) => (
	<TabsPrimitive.List
		className={cn(
			"inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
			className
		)}
		ref={ref}
		{...props}
	/>
);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = ({
	className,
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
	ref?: React.RefObject<React.ElementRef<typeof TabsPrimitive.Trigger> | null>;
}) => (
	<TabsPrimitive.Trigger
		className={cn(
			"inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 font-medium text-sm outline-none ring-offset-background transition-all hover:bg-background/50 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
			className
		)}
		ref={ref}
		{...props}
	/>
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = ({
	className,
	ref,
	...props
}: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
	ref?: React.RefObject<React.ElementRef<typeof TabsPrimitive.Content> | null>;
}) => (
	<TabsPrimitive.Content
		className={cn(
			"mt-2 outline-none ring-offset-background focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
			className
		)}
		ref={ref}
		{...props}
	/>
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
