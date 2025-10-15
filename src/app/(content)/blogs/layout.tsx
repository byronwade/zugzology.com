export default async function BlogsLayout({ children }: { children: React.ReactNode }) {
	return <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900">{children}</div>;
}
