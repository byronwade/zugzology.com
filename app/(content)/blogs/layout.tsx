import { getBlogs } from "@/lib/actions/shopify";
import { BlogNavigation } from "./blog-navigation";

export const metadata = {
	title: "Blog | Zugzology",
	description: "Read our latest articles about mushroom cultivation and research",
};

export default async function BlogsLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
	const blogs = await getBlogs();

	const categories = [
		{ id: "all", label: "All Posts", path: "/blogs" },
		...blogs.map((blog) => ({
			id: blog.handle,
			label: blog.title,
			path: `/blogs/${blog.handle}`,
		})),
	];

	return (
		<div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900">
			<div className="w-full mx-auto">
				<BlogNavigation categories={categories} />
				{children}
				{modal}
			</div>
		</div>
	);
}
