"use client";

import { useCustomer } from "@/lib/context/CustomerContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountPage() {
	const { isAuthenticated, customer, logout } = useCustomer();
	const router = useRouter();

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/login");
		}
	}, [isAuthenticated, router]);

	if (!isAuthenticated || !customer) {
		return null;
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">My Account</h1>

			<div className="grid gap-6">
				<div className="bg-white p-6 rounded-lg shadow">
					<h2 className="text-xl font-semibold mb-4">Account Details</h2>
					<p>
						Name: {customer.firstName} {customer.lastName}
					</p>
					<p>Email: {customer.email}</p>
				</div>

				<div className="bg-white p-6 rounded-lg shadow">
					<h2 className="text-xl font-semibold mb-4">Order History</h2>
					{customer.orders?.edges?.length > 0 ? (
						<ul className="divide-y">
							{customer.orders.edges.map(({ node: order }: any) => (
								<li key={order.id} className="py-4">
									<p>Order #{order.orderNumber}</p>
									<p>Total: {order.totalPrice}</p>
									<p>Status: {order.fulfillmentStatus}</p>
								</li>
							))}
						</ul>
					) : (
						<p>No orders found</p>
					)}
				</div>

				<button onClick={() => logout()} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
					Logout
				</button>
			</div>
		</div>
	);
}
