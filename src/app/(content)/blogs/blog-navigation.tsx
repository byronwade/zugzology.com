"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/components/ui/link";

type Category = {
	id: string;
	label: string;
	path: string;
};

export function BlogNavigation({ categories }: { categories: Category[] }) {
	const pathname = usePathname();

	return (
		<nav className="sticky top-98 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto max-w-full px-4">
				<ul className="scrollbar-hide flex space-x-4 overflow-x-auto">
					{categories.map((category) => {
						const isActive =
							pathname === category.path || (category.path !== "/blogs" && pathname.startsWith(category.path));

						return (
							<li key={category.id}>
								<Link
									className={`inline-block py-2 font-medium text-sm whitespace-nowrap${isActive ? "border-border border-b-2 text-foreground dark:border-foreground dark:text-foreground" : "border-transparent border-b-2 text-muted-foreground hover:border-foreground hover:text-foreground dark:text-muted-foreground dark:hover:border-foreground dark:hover:text-foreground"}
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
