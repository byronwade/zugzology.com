import { Header } from "@/components/header/header";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: {
		template: "%s | Zugzology",
		default: "Zugzology - Mushroom Cultivation Supplies",
	},
	description: "Premium mushroom cultivation supplies and equipment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body suppressHydrationWarning>
				<Header />
				<main className="min-h-screen">{children}</main>
			</body>
		</html>
	);
}
