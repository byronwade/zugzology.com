"use client";

import { LogOut } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers/auth-provider";

interface SignOutButtonProps {
	onSignOut?: () => void;
}

export function SignOutButton({ onSignOut }: SignOutButtonProps) {
	const router = useRouter();
	const { logout } = useAuthContext();

	const handleSignOut = async () => {
		try {
			// Use the auth context logout method
			await logout();

			// Call the onSignOut callback if provided
			onSignOut?.();

			// Router push and refresh handled by the auth context logout
		} catch (error) {
			console.error("Logout error:", error);
			// Still try to redirect to login even if the logout fails
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
