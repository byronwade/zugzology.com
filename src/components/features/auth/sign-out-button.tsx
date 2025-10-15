"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/providers/auth-provider";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type SignOutButtonProps = {
	onSignOut?: () => void;
};

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
		} catch (_error) {
			// Still try to redirect to login even if the logout fails
			router.push("/login");
		}
	};

	return (
		<DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400" onClick={handleSignOut}>
			<LogOut className="mr-2 h-4 w-4" />
			Sign Out
		</DropdownMenuItem>
	);
}
