"use client";

import { useState, useCallback } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, User, MapPin, ShoppingBag, Edit, Plus, Menu, X } from "lucide-react";

// Mock customer data
const mockCustomerData = {
	id: "gid://shopify/Customer/12345",
	firstName: "John",
	lastName: "Developer",
	email: "john.dev@example.com",
	phone: "+1 (555) 123-4567",
	defaultAddress: {
		id: "gid://shopify/MailingAddress/67890",
		address1: "123 Dev Street",
		address2: "Suite 404",
		city: "San Francisco",
		province: "CA",
		country: "United States",
		zip: "94105",
	},
	addresses: {
		edges: [
			{
				node: {
					id: "gid://shopify/MailingAddress/67890",
					address1: "123 Dev Street",
					address2: "Suite 404",
					city: "San Francisco",
					province: "CA",
					country: "United States",
					zip: "94105",
				},
			},
			{
				node: {
					id: "gid://shopify/MailingAddress/67891",
					address1: "456 Test Ave",
					address2: null,
					city: "New York",
					province: "NY",
					country: "United States",
					zip: "10001",
				},
			},
		],
	},
	orders: {
		edges: [
			{
				node: {
					id: "gid://shopify/Order/111",
					orderNumber: 1001,
					processedAt: new Date().toISOString(),
					financialStatus: "PENDING",
					fulfillmentStatus: "UNFULFILLED",
					currentTotalPrice: {
						amount: "599.99",
						currencyCode: "USD",
					},
				},
			},
			{
				node: {
					id: "gid://shopify/Order/112",
					orderNumber: 1002,
					processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
					financialStatus: "PAID",
					fulfillmentStatus: "IN_PROGRESS",
					currentTotalPrice: {
						amount: "149.99",
						currencyCode: "USD",
					},
				},
			},
			{
				node: {
					id: "gid://shopify/Order/113",
					orderNumber: 1003,
					processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
					financialStatus: "PAID",
					fulfillmentStatus: "FULFILLED",
					currentTotalPrice: {
						amount: "299.99",
						currencyCode: "USD",
					},
				},
			},
			{
				node: {
					id: "gid://shopify/Order/114",
					orderNumber: 1004,
					processedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
					financialStatus: "REFUNDED",
					fulfillmentStatus: "FULFILLED",
					currentTotalPrice: {
						amount: "199.99",
						currencyCode: "USD",
					},
				},
			},
			{
				node: {
					id: "gid://shopify/Order/115",
					orderNumber: 1005,
					processedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
					financialStatus: "PARTIALLY_REFUNDED",
					fulfillmentStatus: "FULFILLED",
					currentTotalPrice: {
						amount: "899.99",
						currencyCode: "USD",
					},
				},
			},
		],
	},
};

function getStatusColor(status: string): "default" | "secondary" | "destructive" | "outline" {
	switch (status.toLowerCase()) {
		case "fulfilled":
		case "paid":
			return "default";
		case "in_progress":
		case "pending":
			return "secondary";
		case "unfulfilled":
		case "refunded":
		case "partially_refunded":
			return "destructive";
		default:
			return "outline";
	}
}

export default function AccountPage() {
	const [activeTab, setActiveTab] = useState("profile");
	const [customer, setCustomer] = useState(mockCustomerData);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const tabs = [
		{ id: "profile", label: "Profile", icon: User },
		{ id: "addresses", label: "Addresses", icon: MapPin },
		{ id: "orders", label: "Orders", icon: ShoppingBag },
	];

	const handleProfileUpdate = useCallback((updatedProfile: Partial<typeof customer>) => {
		setCustomer((prevCustomer) => ({ ...prevCustomer, ...updatedProfile }));
	}, []);

	const handleAddressUpdate = useCallback((updatedAddress: (typeof customer.addresses.edges)[0]["node"]) => {
		setCustomer((prevCustomer) => ({
			...prevCustomer,
			addresses: {
				edges: prevCustomer.addresses.edges.map((edge) => (edge.node.id === updatedAddress.id ? { node: updatedAddress } : edge)),
			},
		}));
	}, []);

	const handleAddAddress = useCallback((newAddress: Omit<(typeof customer.addresses.edges)[0]["node"], "id">) => {
		const newId = `gid://shopify/MailingAddress/${Date.now()}`;
		setCustomer((prevCustomer) => ({
			...prevCustomer,
			addresses: {
				edges: [...prevCustomer.addresses.edges, { node: { ...newAddress, id: newId } }],
			},
		}));
	}, []);

	return (
		<div className="flex h-[calc(100vh-106px)] overflow-hidden bg-background">
			{/* Sidebar */}
			<aside className={`bg-muted w-64 h-full fixed left-0 top-[106px] z-40 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
				<div className="flex flex-col h-full">
					<div className="flex items-center justify-between p-4 border-b">
						<h1 className="text-2xl font-bold">Account</h1>
						<Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
							<X className="h-6 w-6" />
							<span className="sr-only">Close sidebar</span>
						</Button>
					</div>
					<nav className="flex-1 overflow-y-auto p-4">
						<ul className="space-y-2">
							{tabs.map((tab) => (
								<li key={tab.id}>
									<Button
										variant={activeTab === tab.id ? "secondary" : "ghost"}
										className="w-full justify-start"
										onClick={() => {
											setActiveTab(tab.id);
											setIsSidebarOpen(false);
										}}
									>
										<tab.icon className="mr-2 h-4 w-4" />
										{tab.label}
									</Button>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</aside>

			{/* Main content */}
			<main className="overflow-x-hidden overflow-y-auto bg-background md:ml-64 pt-[106px]">
				<div className="w-full mx-auto px-4 py-8">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center space-x-4">
							<Button variant="outline" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
								<Menu className="h-6 w-6" />
								<span className="sr-only">Toggle sidebar</span>
							</Button>
							<h2 className="text-3xl font-bold">{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
						</div>
					</div>

					{activeTab === "profile" && (
						<div className="space-y-6">
							<div className="flex justify-between items-center">
								<h3 className="text-xl font-semibold">Profile Information</h3>
								<Dialog>
									<DialogTrigger asChild>
										<Button variant="outline" size="sm">
											<Edit className="w-4 h-4 mr-2" />
											Edit Profile
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Edit Profile</DialogTitle>
										</DialogHeader>
										<form
											onSubmit={(e) => {
												e.preventDefault();
												const formData = new FormData(e.currentTarget);
												handleProfileUpdate({
													firstName: formData.get("firstName") as string,
													lastName: formData.get("lastName") as string,
													email: formData.get("email") as string,
													phone: formData.get("phone") as string,
												});
											}}
											className="space-y-4"
										>
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="firstName">First Name</Label>
													<Input id="firstName" name="firstName" defaultValue={customer.firstName} />
												</div>
												<div className="space-y-2">
													<Label htmlFor="lastName">Last Name</Label>
													<Input id="lastName" name="lastName" defaultValue={customer.lastName} />
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="email">Email</Label>
												<Input id="email" name="email" type="email" defaultValue={customer.email} />
											</div>
											<div className="space-y-2">
												<Label htmlFor="phone">Phone</Label>
												<Input id="phone" name="phone" type="tel" defaultValue={customer.phone} />
											</div>
											<Button type="submit">Save Changes</Button>
										</form>
									</DialogContent>
								</Dialog>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<h4 className="text-sm font-medium text-muted-foreground mb-1">Name</h4>
									<p className="text-lg">{`${customer.firstName} ${customer.lastName}`}</p>
								</div>
								<div>
									<h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
									<p className="text-lg">{customer.email}</p>
								</div>
								<div>
									<h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
									<p className="text-lg">{customer.phone || "Not provided"}</p>
								</div>
							</div>
						</div>
					)}

					{activeTab === "addresses" && (
						<div className="space-y-6">
							<div className="flex justify-between items-center">
								<h3 className="text-xl font-semibold">Addresses</h3>
								<Dialog>
									<DialogTrigger asChild>
										<Button variant="outline" size="sm">
											<Plus className="w-4 h-4 mr-2" />
											Add New Address
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Add New Address</DialogTitle>
										</DialogHeader>
										<form
											onSubmit={(e) => {
												e.preventDefault();
												const formData = new FormData(e.currentTarget);
												handleAddAddress({
													address1: formData.get("address1") as string,
													address2: formData.get("address2") as string,
													city: formData.get("city") as string,
													province: formData.get("province") as string,
													country: formData.get("country") as string,
													zip: formData.get("zip") as string,
												});
											}}
											className="space-y-4"
										>
											<div className="space-y-2">
												<Label htmlFor="address1">Address Line 1</Label>
												<Input id="address1" name="address1" required />
											</div>
											<div className="space-y-2">
												<Label htmlFor="address2">Address Line 2</Label>
												<Input id="address2" name="address2" />
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="city">City</Label>
													<Input id="city" name="city" required />
												</div>
												<div className="space-y-2">
													<Label htmlFor="province">State/Province</Label>
													<Input id="province" name="province" required />
												</div>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="country">Country</Label>
													<Input id="country" name="country" required />
												</div>
												<div className="space-y-2">
													<Label htmlFor="zip">ZIP/Postal Code</Label>
													<Input id="zip" name="zip" required />
												</div>
											</div>
											<Button type="submit">Add Address</Button>
										</form>
									</DialogContent>
								</Dialog>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{customer.addresses.edges.map(({ node: address }) => (
									<div key={address.id} className="p-4 border rounded-lg bg-card shadow-sm">
										<div className="flex justify-between items-start mb-2">
											<p className="font-medium">
												{address.id === customer.defaultAddress?.id && "(Default) "}
												{address.address1}
											</p>
											<Dialog>
												<DialogTrigger asChild>
													<Button variant="ghost" size="sm">
														<Edit className="w-4 h-4" />
														<span className="sr-only">Edit address</span>
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Edit Address</DialogTitle>
													</DialogHeader>
													<form
														onSubmit={(e) => {
															e.preventDefault();
															const formData = new FormData(e.currentTarget);
															handleAddressUpdate({
																...address,
																address1: formData.get("address1") as string,
																address2: formData.get("address2") as string,
																city: formData.get("city") as string,
																province: formData.get("province") as string,
																country: formData.get("country") as string,
																zip: formData.get("zip") as string,
															});
														}}
														className="space-y-4"
													>
														<div className="space-y-2">
															<Label htmlFor="address1">Address Line 1</Label>
															<Input id="address1" name="address1" defaultValue={address.address1} />
														</div>
														<div className="space-y-2">
															<Label htmlFor="address2">Address Line 2</Label>
															<Input id="address2" name="address2" defaultValue={address.address2 || ""} />
														</div>
														<div className="grid grid-cols-2 gap-4">
															<div className="space-y-2">
																<Label htmlFor="city">City</Label>
																<Input id="city" name="city" defaultValue={address.city} />
															</div>
															<div className="space-y-2">
																<Label htmlFor="province">State/Province</Label>
																<Input id="province" name="province" defaultValue={address.province} />
															</div>
														</div>
														<div className="grid grid-cols-2 gap-4">
															<div className="space-y-2">
																<Label htmlFor="country">Country</Label>
																<Input id="country" name="country" defaultValue={address.country} />
															</div>
															<div className="space-y-2">
																<Label htmlFor="zip">ZIP/Postal Code</Label>
																<Input id="zip" name="zip" defaultValue={address.zip} />
															</div>
														</div>
														<Button type="submit">Save Changes</Button>
													</form>
												</DialogContent>
											</Dialog>
										</div>
										<p className="text-sm text-muted-foreground">
											{address.address2 && `${address.address2}, `}
											{address.city}, {address.province} {address.zip}
										</p>
										<p className="text-sm text-muted-foreground">{address.country}</p>
									</div>
								))}
							</div>
						</div>
					)}

					{activeTab === "orders" && (
						<div className="space-y-6">
							<h3 className="text-xl font-semibold">Recent Orders</h3>
							<div className="space-y-4">
								{customer.orders.edges.map(({ node: order }) => (
									<Dialog key={order.id}>
										<DialogTrigger asChild>
											<div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
												<div>
													<p className="font-medium">Order #{order.orderNumber}</p>
													<p className="text-sm text-muted-foreground">{format(new Date(order.processedAt), "PPP")}</p>
												</div>
												<div className="flex items-center space-x-2">
													<Badge variant={getStatusColor(order.fulfillmentStatus)}>{order.fulfillmentStatus.toLowerCase().replace(/_/g, " ")}</Badge>
													<Badge variant={getStatusColor(order.financialStatus)}>{order.financialStatus.toLowerCase().replace(/_/g, " ")}</Badge>
													<p className="font-medium">
														{new Intl.NumberFormat("en-US", {
															style: "currency",
															currency: order.currentTotalPrice.currencyCode,
														}).format(parseFloat(order.currentTotalPrice.amount))}
													</p>
													<ChevronRight className="w-4 h-4 text-muted-foreground" />
												</div>
											</div>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Order Details</DialogTitle>
											</DialogHeader>
											<div className="space-y-4">
												<div>
													<h4 className="font-medium">Order Information</h4>
													<p>Order Number: {order.orderNumber}</p>
													<p>Date: {format(new Date(order.processedAt), "PPP")}</p>
													<p>
														Total:{" "}
														{new Intl.NumberFormat("en-US", {
															style: "currency",
															currency: order.currentTotalPrice.currencyCode,
														}).format(parseFloat(order.currentTotalPrice.amount))}
													</p>
												</div>
												<div>
													<h4 className="font-medium">Status</h4>
													<div className="flex space-x-2 mt-1">
														<Badge variant={getStatusColor(order.fulfillmentStatus)}>{order.fulfillmentStatus.toLowerCase().replace(/_/g, " ")}</Badge>
														<Badge variant={getStatusColor(order.financialStatus)}>{order.financialStatus.toLowerCase().replace(/_/g, " ")}</Badge>
													</div>
												</div>
											</div>
										</DialogContent>
									</Dialog>
								))}
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
