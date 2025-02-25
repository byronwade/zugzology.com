"use client";

import { LogOut, Loader2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { signOut } from "next-auth/react";

interface NextAuthLogoutProps {
	onSignOut?: () => void;
}

export function NextAuthLogout({ onSignOut }: NextAuthLogoutProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handleSignOut = async () => {
		try {
			setIsLoading(true);
			// Sign out and redirect to home page
			await signOut({ callbackUrl: "/" });

			// Call the onSignOut callback if provided
			onSignOut?.();
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 dark:text-red-400" disabled={isLoading}>
			{isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
			Sign Out
		</DropdownMenuItem>
	);
}
