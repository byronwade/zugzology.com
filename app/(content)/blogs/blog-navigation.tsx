"use client";

import { Link } from '@/components/ui/link';
import { usePathname } from "next/navigation";

interface Category {
	id: string;
	label: string;
	path: string;
}

export function BlogNavigation({ categories }: { categories: Category[] }) {
	const pathname = usePathname();

	return (
		<nav className="sticky top-98 z-10 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b dark:border-neutral-800">
			<div className="max-w-full mx-auto px-4">
				<ul className="flex space-x-4 overflow-x-auto scrollbar-hide">
					{categories.map((category) => {
						const isActive = pathname === category.path || (category.path !== "/blogs" && pathname.startsWith(category.path));

						return (
							<li key={category.id}>
								<Link
									href={category.path}
									className={`
										inline-block py-2 text-sm font-medium whitespace-nowrap
										${isActive ? "text-neutral-900 dark:text-neutral-100 border-b-2 border-neutral-900 dark:border-neutral-100" : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 border-b-2 border-transparent hover:border-neutral-900 dark:hover:border-neutral-100"}
									`}
								>
									{category.label}
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</nav>
	);
}
