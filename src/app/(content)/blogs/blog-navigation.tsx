"use client";

import { Link } from "@/components/ui/link";
import { usePathname } from "next/navigation";

type Category = {
	id: string;
	label: string;
	path: string;
};

export function BlogNavigation({ categories }: { categories: Category[] }) {
	const pathname = usePathname();

	return (
		<nav className="sticky top-98 z-10 border-b bg-neutral-50/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
			<div className="mx-auto max-w-full px-4">
				<ul className="scrollbar-hide flex space-x-4 overflow-x-auto">
					{categories.map((category) => {
						const isActive =
							pathname === category.path || (category.path !== "/blogs" && pathname.startsWith(category.path));

						return (
							<li key={category.id}>
								<Link
									className={`inline-block py-2 font-medium text-sm whitespace-nowrap${isActive ? "border-neutral-900 border-b-2 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100" : "border-transparent border-b-2 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-100 dark:hover:text-neutral-100"}
									`}
									href={category.path}
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
