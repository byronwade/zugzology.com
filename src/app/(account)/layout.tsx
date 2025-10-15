export default function AccountLayout({ children }: { children: React.ReactNode }) {
	// Account layout just renders children
	// Auth checks are handled by individual pages using requireCustomerSession
	return <>{children}</>;
}
