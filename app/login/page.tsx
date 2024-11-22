"use client";

import { useState } from "react";
import { useCustomer } from "@/lib/context/CustomerContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const { login } = useCustomer();
	const router = useRouter();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		try {
			await login(email, password);
			router.push("/account");
		} catch (err) {
			setError("Invalid credentials");
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
				<h1 className="text-2xl font-bold mb-6">Login</h1>

				{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

				<form onSubmit={handleSubmit} suppressHydrationWarning>
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
						<input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" required autoComplete="current-password" />
					</div>

					<button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
						Login
					</button>
				</form>

				<div className="mt-4 text-center">
					<p className="text-gray-600">
						Don't have an account?{" "}
						<a href="/register" className="text-blue-600 hover:underline">
							Create one
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
