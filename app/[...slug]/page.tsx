import { getBlogs } from "@/lib/actions/getBlogs";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
	params: {
		slug: string[];
	};
}

export default async function SlugPage({ params }: Props) {
	try {
		const [type, handle] = params.slug;

		console.log("Route params:", { type, handle });

		const blogs = await getBlogs();
		console.log("Fetched blogs:", blogs?.length);

		if (!blogs?.length) {
			console.log("No blogs found");
			return notFound();
		}

		const blog = blogs.find((b) => b.handle === type);
		console.log("Looking for blog with handle:", type);
		console.log(
			"Available blog handles:",
			blogs.map((b) => b.handle)
		);

		if (!blog) {
			console.log("Blog not found:", type);
			return notFound();
		}

		const articles = blog.articles || [];

		if (handle) {
			const article = articles.find((a) => a.handle === handle);

			if (!article) {
				console.log("Article not found:", handle);
				return notFound();
			}

			return (
				<article className="max-w-4xl mx-auto py-8 px-4">
					<Link href={`/${blog.handle}`} className="text-blue-600 hover:text-blue-800 mb-4 block">
						← Back to {blog.title}
					</Link>
					<h1 className="text-4xl font-bold mb-4">{article.title}</h1>
					<div className="text-sm text-gray-500 mb-6">
						Published {new Date(article.publishedAt).toLocaleDateString()}
						{article.author?.name && ` by ${article.author.name}`}
					</div>
					{article.image && <img src={article.image.url} alt={article.image.altText || article.title} className="w-full h-auto mb-6 rounded-lg" />}
					<div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
				</article>
			);
		}

		return (
			<div className="max-w-4xl mx-auto py-8 px-4">
				<h1 className="text-4xl font-bold mb-8">{blog.title}</h1>
				<div className="grid gap-8">
					{articles.map((article) => (
						<article key={article.id} className="border-b pb-8">
							<Link href={`/${blog.handle}/${article.handle}`} className="group">
								<h2 className="text-2xl font-bold mb-4 group-hover:text-blue-600">{article.title}</h2>
								{article.excerpt && <p className="text-gray-600 mb-4">{article.excerpt}</p>}
								<div className="text-sm text-gray-500">
									Published {new Date(article.publishedAt).toLocaleDateString()}
									{article.author?.name && ` by ${article.author.name}`}
								</div>
							</Link>
						</article>
					))}
				</div>
			</div>
		);
	} catch (error) {
		console.error("Error in blog handling:", error);
		return notFound();
	}
}
