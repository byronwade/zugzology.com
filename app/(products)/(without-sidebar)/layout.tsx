// This layout will be used for pages that don't need the sidebar
export default function WithoutSidebarLayout({ children }: { children: React.ReactNode }) {
	return <div className="min-h-screen bg-background">{children}</div>;
}
