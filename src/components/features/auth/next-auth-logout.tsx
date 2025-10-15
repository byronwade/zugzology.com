"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type NextAuthLogoutProps = {
	onSignOut?: () => void;
};

export function NextAuthLogout({ onSignOut }: NextAuthLogoutProps) {
	const handleSignOut = async () => {
		await signOut({ redirect: false });
		if (onSignOut) {
			onSignOut();
		}
	};

	return (
		<DropdownMenuItem
			className="rounded-md text-foreground hover:bg-accent focus:bg-accent"
			onClick={handleSignOut}
		>
			<LogOut className="mr-2 h-4 w-4 text-muted-foreground" />
			Sign Out
		</DropdownMenuItem>
	);
}
