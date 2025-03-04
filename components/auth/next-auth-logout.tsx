"use client";

import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

interface NextAuthLogoutProps {
	onSignOut?: () => void;
}

export function NextAuthLogout({ onSignOut }: NextAuthLogoutProps) {
	const handleSignOut = async () => {
		await signOut({ redirect: false });
		if (onSignOut) {
			onSignOut();
		}
	};

	return (
		<DropdownMenuItem
			onClick={handleSignOut}
			className="rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
		>
			<LogOut className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
			Sign Out
		</DropdownMenuItem>
	);
}
