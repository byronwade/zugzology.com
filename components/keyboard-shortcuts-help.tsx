import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

interface ShortcutGroup {
	title: string;
	shortcuts: {
		keys: string[];
		description: string;
	}[];
}

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
	return <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">{children}</kbd>;
}

export function KeyboardShortcutsHelp() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="fixed bottom-4 right-4 h-10 w-10 rounded-full shadow-lg border bg-background">
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
							<h3 className="font-medium mb-2">{group.title}</h3>
							<div className="space-y-2">
								{group.shortcuts.map((shortcut, index) => (
									<div key={index} className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">{shortcut.description}</span>
										<div className="flex items-center gap-1">
											{shortcut.keys.map((key, keyIndex) => (
												<React.Fragment key={keyIndex}>
													<KeyboardKey>{key}</KeyboardKey>
													{keyIndex < shortcut.keys.length - 1 && <span className="text-muted-foreground mx-1">then</span>}
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
