import { Keyboard } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type ShortcutGroup = {
	title: string;
	shortcuts: {
		keys: string[];
		description: string;
	}[];
};

const shortcutGroups: ShortcutGroup[] = [
	{
		title: "Navigation",
		shortcuts: [
			{ keys: ["Shift", "H"], description: "Go to Home page" },
			{ keys: ["Shift", "S"], description: "Go to Search" },
			{ keys: ["Shift", "A"], description: "Go to Account" },
			{ keys: ["Shift", "C"], description: "Go to Collections" },
			{ keys: ["Shift", "B"], description: "Go to Blogs" },
			{ keys: ["Shift", "?"], description: "Go to Help" },
		],
	},
	{
		title: "Actions",
		shortcuts: [
			{ keys: ["Shift", "K"], description: "Focus search" },
			{ keys: ["/"], description: "Focus search (alternative)" },
			{ keys: ["Shift", "O"], description: "Open cart" },
			{ keys: ["esc"], description: "Close dropdowns / Clear search" },
		],
	},
	{
		title: "Search Results",
		shortcuts: [
			{ keys: ["↑"], description: "Previous result" },
			{ keys: ["↓"], description: "Next result" },
			{ keys: ["enter"], description: "Select result" },
			{ keys: ["esc"], description: "Close search" },
		],
	},
];

function KeyboardKey({ children }: { children: React.ReactNode }) {
	return (
		<kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 font-semibold text-gray-800 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
			{children}
		</kbd>
	);
}

export function KeyboardShortcutsHelp() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					className="fixed right-4 bottom-4 h-10 w-10 rounded-full border bg-background shadow-lg"
					size="icon"
					variant="ghost"
				>
					<Keyboard className="h-4 w-4" />
					<span className="sr-only">Keyboard shortcuts</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Keyboard Shortcuts</DialogTitle>
					<DialogDescription>Use these keyboard shortcuts to navigate quickly through the site.</DialogDescription>
				</DialogHeader>
				<div className="grid gap-6 py-4">
					{shortcutGroups.map((group) => (
						<div key={group.title}>
							<h3 className="mb-2 font-medium">{group.title}</h3>
							<div className="space-y-2">
								{group.shortcuts.map((shortcut, index) => (
									<div className="flex items-center justify-between text-sm" key={index}>
										<span className="text-muted-foreground">{shortcut.description}</span>
										<div className="flex items-center gap-1">
											{shortcut.keys.map((key, keyIndex) => (
												<React.Fragment key={keyIndex}>
													<KeyboardKey>{key}</KeyboardKey>
													{keyIndex < shortcut.keys.length - 1 && (
														<span className="mx-1 text-muted-foreground">then</span>
													)}
												</React.Fragment>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
