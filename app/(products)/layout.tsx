import { Sidebar } from "@/components/sidebar/sidebar";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Sidebar />
			{children}
		</>
	);
}
