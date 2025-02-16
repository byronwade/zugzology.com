"use client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface SignOutButtonProps {
	onSignOut?: () => void;
}

export function SignOutButton({ onSignOut }: SignOutButtonProps) {
	const router = useRouter();

	const handleSignOut = () => {
		// Remove the access token
		Cookies.remove("customerAccessToken");

		// Call the onSignOut callback if provided
		onSignOut?.();

		// Refresh the page to clear any cached state
		router.refresh();
	};

	return (
		<DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 dark:text-red-400">
			<LogOut className="h-4 w-4 mr-2" />
			Sign Out
		</DropdownMenuItem>
	);
}
