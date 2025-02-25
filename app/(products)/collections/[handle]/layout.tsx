export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
	return children;
}
