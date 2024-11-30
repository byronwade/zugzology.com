import Link from "next/link";

const categories = [
	{ id: "research", label: "Research" },
	{ id: "lifestyle", label: "Lifestyle" },
	{ id: "tech", label: "Technology" },
];

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<nav className="mb-8">
					<ul className="flex space-x-4">
						{categories.map((category) => (
							<li key={category.id}>
								<Link href={`/blogs/${category.id}`} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
									{category.label}
								</Link>
							</li>
						))}
					</ul>
				</nav>
				{children}
			</div>
		</div>
	);
}
