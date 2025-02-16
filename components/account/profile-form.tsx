"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save } from "lucide-react";
import type { ShopifyCustomer } from "@/lib/types";

interface ProfileFormProps {
	customer: ShopifyCustomer;
}

export function ProfileForm({ customer }: ProfileFormProps) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setSuccess(null);
		setLoading(true);

		const formData = new FormData(event.currentTarget);
		const data = {
			firstName: formData.get("firstName") as string,
			lastName: formData.get("lastName") as string,
			email: formData.get("email") as string,
			phone: formData.get("phone") as string,
		};

		try {
			const response = await fetch("/api/account/update", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.message || "Failed to update profile");
			}

			setSuccess("Profile updated successfully!");
			router.refresh(); // Refresh the page to show updated data
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update profile");
		} finally {
			setLoading(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4">
			{error && (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{success && (
				<Alert className="bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900">
					<AlertDescription className="text-green-800 dark:text-green-300">{success}</AlertDescription>
				</Alert>
			)}

			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="firstName">First Name</Label>
					<Input id="firstName" name="firstName" defaultValue={customer.firstName || ""} required disabled={loading} />
				</div>

				<div className="space-y-2">
					<Label htmlFor="lastName">Last Name</Label>
					<Input id="lastName" name="lastName" defaultValue={customer.lastName || ""} required disabled={loading} />
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input id="email" name="email" type="email" defaultValue={customer.email} required disabled={loading} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="phone">Phone (optional)</Label>
				<Input id="phone" name="phone" type="tel" defaultValue={customer.phone || ""} disabled={loading} />
			</div>

			<Button type="submit" disabled={loading} className="w-full sm:w-auto">
				{loading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Saving changes...
					</>
				) : (
					<>
						<Save className="mr-2 h-4 w-4" />
						Save Changes
					</>
				)}
			</Button>
		</form>
	);
}
