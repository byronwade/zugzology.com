"use client";

import { Link } from "@/components/ui/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface BlogBreadcrumbProps {
	blogHandle: string;
	blogTitle: string;
	articleTitle?: string;
}

export function BlogBreadcrumb({ blogHandle, blogTitle, articleTitle }: BlogBreadcrumbProps) {
	return (
		<Breadcrumb className="mb-4">
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href="/">Home</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>

				<BreadcrumbSeparator />

				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href="/blogs">Blogs</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>

				<BreadcrumbSeparator />

				<BreadcrumbItem>
					<BreadcrumbLink asChild>
						<Link href={`/blogs/${blogHandle}`}>{blogTitle}</Link>
					</BreadcrumbLink>
				</BreadcrumbItem>

				{articleTitle && (
					<>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>{articleTitle}</BreadcrumbPage>
						</BreadcrumbItem>
					</>
				)}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
