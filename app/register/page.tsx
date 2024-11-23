"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dedupedRequest, customerCreateMutation } from "@/lib/shopify";

interface CustomerCreateResponse {
	customerCreate: {
		customer: {
			id: string;
			email: string;
			firstName: string;
			lastName: string;
		} | null;
		customerUserErrors: Array<{
			code: string;
			field: string[];
			message: string;
		}>;
	};
}

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		try {
			const { data } = await dedupedRequest<CustomerCreateResponse>(customerCreateMutation, {
				input: {
					email,
					password,
					firstName,
					lastName,
				},
			});

			if (data?.customerCreate?.customerUserErrors?.length > 0) {
				setError(data.customerCreate.customerUserErrors[0].message);
				return;
			}

			// If registration successful, redirect to login
			router.push("/login");
		} catch (err) {
			setError("Registration failed. Please try again.");
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
				<h1 className="text-2xl font-bold mb-6">Create Account</h1>

				{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

				<form onSubmit={handleSubmit} suppressHydrationWarning>
					<div className="mb-4">
						<label htmlFor="firstName" className="block text-gray-700 mb-2">
							First Name
						</label>
						<input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-2 border rounded" required />
					</div>

					<div className="mb-4">
						<label htmlFor="lastName" className="block text-gray-700 mb-2">
							Last Name
						</label>
						<input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-2 border rounded" required />
					</div>

					<div className="mb-4">
						<label htmlFor="email" className="block text-gray-700 mb-2">
							Email
						</label>
						<input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" required autoComplete="username" />
					</div>

					<div className="mb-6">
						<label htmlFor="password" className="block text-gray-700 mb-2">
							Password
						</label>
						<input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" required autoComplete="new-password" />
					</div>

					<button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
						Create Account
					</button>
				</form>
			</div>
		</div>
	);
}
