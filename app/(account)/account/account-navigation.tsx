import { Link } from '@/components/ui/link';
import { cn } from "@/lib/utils";

interface AccountNavigationProps {
	active: "dashboard" | "orders" | string;
}

const NAV_ITEMS = [
	{ id: "dashboard", href: "/account", label: "Dashboard" },
	{ id: "orders", href: "/account/orders", label: "Orders" },
];

export function AccountNavigation({ active }: AccountNavigationProps) {
	return (
		<div className="px-4 pb-4">
			<nav aria-label="Account" className="flex gap-2 text-sm font-medium">
				{NAV_ITEMS.map((item) => {
					const isActive = item.id === active;
					return (
						<Link
							key={item.id}
							href={item.href}
							className={cn(
								"rounded-full px-4 py-2 transition-colors",
								isActive
									? "bg-primary text-primary-foreground shadow"
									: "text-muted-foreground hover:text-foreground hover:bg-muted"
							)}
							aria-current={isActive ? "page" : undefined}
						>
							{item.label}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
