import React from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Sign In | Your Store Name",
	description: "Sign in to your account to view orders and manage your profile",
};

interface LoginPageProps {
	searchParams: Promise<{ registered?: string; from?: string }>;
}

export default async function LoginPage(props: LoginPageProps) {
    const searchParams = await props.searchParams;
    const isRegistered = Boolean(searchParams.registered);
    const from = searchParams.from;

    return (
		<div className="w-full max-w-[400px] mx-auto p-4">
			{isRegistered && (
				<Alert className="mb-8">
					<AlertDescription>Account created successfully! Please sign in with your credentials.</AlertDescription>
				</Alert>
			)}
			<LoginForm redirectTo={from} />
		</div>
	);
}
