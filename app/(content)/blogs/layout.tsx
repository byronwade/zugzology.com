export default async function BlogsLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
	return (
		<div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900">
			<div className="w-full mx-auto">
				{children}
				{modal}
			</div>
		</div>
	);
}
