import { redirect } from "next/navigation";

export default function BlogsPage() {
	// Redirect to research by default
	redirect("/blogs/research");
}
