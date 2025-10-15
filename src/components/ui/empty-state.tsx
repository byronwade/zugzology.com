import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
	icon?: LucideIcon;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
	return (
		<div className={cn("flex flex-col items-center justify-center px-4 py-12", className)}>
			{Icon && (
				<div className="mb-4 rounded-full bg-muted p-3">
					<Icon className="h-6 w-6 text-muted-foreground" />
				</div>
			)}
			<h3 className="text-center font-semibold text-lg">{title}</h3>
			{description && <p className="mt-2 max-w-md text-center text-muted-foreground text-sm">{description}</p>}
			{action && <div className="mt-6">{action}</div>}
		</div>
	);
}
