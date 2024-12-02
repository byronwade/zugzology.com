import React from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Create Account | Your Store Name",
	description: "Create a new account to start shopping and track your orders",
};

export default async function RegisterPage() {
	return (
		<div className="w-full max-w-[400px] mx-auto p-4">
			<RegisterForm />
		</div>
	);
}
