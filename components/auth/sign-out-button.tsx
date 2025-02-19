"use client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface SignOutButtonProps {
	onSignOut?: () => void;
}

export function SignOutButton({ onSignOut }: SignOutButtonProps) {
	const router = useRouter();

	const handleSignOut = async () => {
		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
				credentials: "include",
			});

			if (!response.ok) {
				throw new Error("Logout failed");
			}

			// Call the onSignOut callback if provided
			onSignOut?.();

			// Refresh the page to clear any cached state
			router.refresh();
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
			// Still try to redirect to login even if the API call fails
			router.push("/login");
		}
	};

	return (
		<DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 dark:text-red-400">
			<LogOut className="h-4 w-4 mr-2" />
			Sign Out
		</DropdownMenuItem>
	);
}
