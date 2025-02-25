"use client";

import type React from "react";
import { useState } from "react";
import { User, Mail, MapPin, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ShopifyCustomer } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateCustomer, updateCustomerAddress, createCustomerAddress } from "@/lib/services/shopify-customer";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface Address {
	id: string;
	street: string;
	city: string;
	state: string;
	zip: string;
	country: string;
}

interface AccountInfoProps {
	customer: ShopifyCustomer;
}

export default function AccountInfo({ customer }: AccountInfoProps) {
	const router = useRouter();

	const [profile, setProfile] = useState({
		name: `${customer.firstName} ${customer.lastName}`,
		email: customer.email,
		addresses: customer.addresses.edges.map(({ node }) => ({
			id: node.id,
			street: node.address1,
			city: node.city,
			state: node.province,
			zip: node.zip,
			country: node.country,
		})),
	});

	const [isEditingName, setIsEditingName] = useState(false);
	const [isEditingEmail, setIsEditingEmail] = useState(false);
	const [newName, setNewName] = useState(profile.name);
	const [newEmail, setNewEmail] = useState(profile.email);
	const [isAddingAddress, setIsAddingAddress] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [newAddress, setNewAddress] = useState<Omit<Address, "id">>({
		street: "",
		city: "",
		state: "",
		zip: "",
		country: "",
	});

	const handleNameEdit = async () => {
		setIsUpdating(true);
		try {
			const [firstName, ...lastNameParts] = newName.trim().split(" ");
			const lastName = lastNameParts.join(" ");

			const customerAccessToken = Cookies.get("customerAccessToken");
			if (!customerAccessToken) {
				toast.error("Please log in again to update your information");
				return;
			}

			await updateCustomer(customerAccessToken, {
				firstName,
				lastName,
			});

			setProfile({ ...profile, name: newName });
			setIsEditingName(false);
			toast.success("Name updated successfully");
		} catch (error) {
			console.error("Error updating name:", error);
			if (error instanceof Error && error.message === "Not authenticated") {
				toast.error("Your session has expired. Please log in again.");
			} else {
				toast.error("Failed to update name. Please try again.");
			}
		} finally {
			setIsUpdating(false);
		}
	};

	const handleEmailEdit = async () => {
		setIsUpdating(true);
		try {
			const customerAccessToken = Cookies.get("customerAccessToken");
			if (!customerAccessToken) {
				toast.error("Please log in again to update your information");
				return;
			}

			await updateCustomer(customerAccessToken, {
				email: newEmail,
			});

			setProfile({ ...profile, email: newEmail });
			setIsEditingEmail(false);
			toast.success("Email updated successfully");
		} catch (error) {
			console.error("Error updating email:", error);
			if (error instanceof Error && error.message === "Not authenticated") {
				toast.error("Your session has expired. Please log in again.");
			} else {
				toast.error("Failed to update email. Please try again.");
			}
		} finally {
			setIsUpdating(false);
		}
	};

	const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setNewAddress((prev) => ({ ...prev, [name]: value }));
	};

	const handleAddAddress = async () => {
		setIsUpdating(true);
		try {
			const customerAccessToken = Cookies.get("customerAccessToken");
			if (!customerAccessToken) {
				toast.error("Please log in again to update your information");
				return;
			}

			const result = await createCustomerAddress(customerAccessToken, {
				address1: newAddress.street,
				city: newAddress.city,
				province: newAddress.state,
				zip: newAddress.zip,
				country: newAddress.country,
			});

			if (result) {
				const newAddressWithId = {
					id: result.id,
					...newAddress,
				};

				setProfile((prev) => ({
					...prev,
					addresses: [...prev.addresses, newAddressWithId],
				}));
				setIsAddingAddress(false);
				setNewAddress({ street: "", city: "", state: "", zip: "", country: "" });
				toast.success("Address added successfully");
			}
		} catch (error) {
			console.error("Error adding address:", error);
			if (error instanceof Error && error.message === "Not authenticated") {
				toast.error("Your session has expired. Please log in again.");
			} else {
				toast.error("Failed to add address. Please try again.");
			}
		} finally {
			setIsUpdating(false);
		}
	};

	const handleUpdateAddress = async (addressId: string, address: Address) => {
		setIsUpdating(true);
		try {
			const customerAccessToken = Cookies.get("customerAccessToken");
			if (!customerAccessToken) {
				toast.error("Please log in again to update your information");
				return;
			}

			await updateCustomerAddress(customerAccessToken, addressId, {
				address1: address.street,
				city: address.city,
				province: address.state,
				zip: address.zip,
				country: address.country,
			});

			setProfile((prev) => ({
				...prev,
				addresses: prev.addresses.map((a) => (a.id === addressId ? address : a)),
			}));
			toast.success("Address updated successfully");
		} catch (error) {
			console.error("Error updating address:", error);
			if (error instanceof Error && error.message === "Not authenticated") {
				toast.error("Your session has expired. Please log in again.");
			} else {
				toast.error("Failed to update address. Please try again.");
			}
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div>
			<div className="mb-6">
				<h2 className="text-2xl font-bold">Account Information</h2>
				<p className="text-muted-foreground">View and manage your account information</p>
			</div>

			<div className="space-y-6">
				<Card className="p-6">
					<div className="flex justify-between items-start mb-6">
						<div>
							<h3 className="text-lg font-medium">Personal Information</h3>
							<p className="text-sm text-muted-foreground">Update your personal details</p>
						</div>
						<SignOutButton />
					</div>
					<Separator className="mb-6" />
					<div className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="name" className="text-base font-medium">
								Name
							</Label>
							<div className="flex items-center space-x-2">
								<User className="h-5 w-5 text-muted-foreground" />
								{isEditingName ? (
									<div className="flex-grow flex items-center space-x-2">
										<Input type="text" id="name" value={newName} onChange={(e) => setNewName(e.target.value)} />
										<Button onClick={handleNameEdit} variant="outline" disabled={isUpdating}>
											{isUpdating ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Saving...
												</>
											) : (
												"Save"
											)}
										</Button>
									</div>
								) : (
									<div className="flex-grow flex items-center justify-between">
										<span className="text-foreground">{profile.name}</span>
										<Button onClick={() => setIsEditingName(true)} variant="ghost" size="sm">
											Edit
										</Button>
									</div>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email" className="text-base font-medium">
								Email
							</Label>
							<div className="flex items-center space-x-2">
								<Mail className="h-5 w-5 text-muted-foreground" />
								{isEditingEmail ? (
									<div className="flex-grow flex items-center space-x-2">
										<Input type="email" id="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
										<Button onClick={handleEmailEdit} variant="outline" disabled={isUpdating}>
											{isUpdating ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Saving...
												</>
											) : (
												"Save"
											)}
										</Button>
									</div>
								) : (
									<div className="flex-grow flex items-center justify-between">
										<span className="text-foreground">{profile.email}</span>
										<Button onClick={() => setIsEditingEmail(true)} variant="ghost" size="sm">
											Edit
										</Button>
									</div>
								)}
							</div>
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<div className="space-y-6">
						<div>
							<h3 className="text-lg font-medium mb-1">Addresses</h3>
							<p className="text-sm text-muted-foreground">Manage your shipping addresses</p>
						</div>

						<div className="space-y-4">
							{profile.addresses.length === 0 && !isAddingAddress ? (
								<p className="text-muted-foreground">No addresses added</p>
							) : (
								<ul className="space-y-4">
									{profile.addresses.map((address) => (
										<li key={address.id} className="flex items-center justify-between p-4 border rounded-lg">
											<div className="flex items-center space-x-2">
												<MapPin className="h-5 w-5 text-muted-foreground" />
												<span className="text-foreground">
													{address.street}, {address.city}, {address.state} {address.zip}, {address.country}
												</span>
											</div>
											<Button variant="ghost" size="sm" onClick={() => handleUpdateAddress(address.id, address)} disabled={isUpdating}>
												{isUpdating ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Updating...
													</>
												) : (
													"Edit"
												)}
											</Button>
										</li>
									))}
								</ul>
							)}

							{isAddingAddress && (
								<div className="mt-4 space-y-4">
									<Input name="street" placeholder="Street Address" value={newAddress.street} onChange={handleAddressChange} />
									<div className="grid grid-cols-2 gap-4">
										<Input name="city" placeholder="City" value={newAddress.city} onChange={handleAddressChange} />
										<Input name="state" placeholder="State" value={newAddress.state} onChange={handleAddressChange} />
									</div>
									<div className="grid grid-cols-2 gap-4">
										<Input name="zip" placeholder="ZIP Code" value={newAddress.zip} onChange={handleAddressChange} />
										<Input name="country" placeholder="Country" value={newAddress.country} onChange={handleAddressChange} />
									</div>
									<div className="flex justify-end space-x-2">
										<Button onClick={() => setIsAddingAddress(false)} variant="outline" disabled={isUpdating}>
											Cancel
										</Button>
										<Button onClick={handleAddAddress} disabled={isUpdating}>
											{isUpdating ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Saving...
												</>
											) : (
												"Save Address"
											)}
										</Button>
									</div>
								</div>
							)}

							{!isAddingAddress && (
								<Button onClick={() => setIsAddingAddress(true)} className="w-full" disabled={isUpdating}>
									<Plus className="h-5 w-5 mr-2" />
									Add New Address
								</Button>
							)}
						</div>
					</div>
				</Card>

				{/* Purchase History & Store Credit Section */}
				<Card className="p-6 mt-6">
					<div className="space-y-6">
						<div>
							<h3 className="text-lg font-medium mb-1">Purchase History & Store Credit</h3>
							<p className="text-sm text-muted-foreground">View your spending history and available store credit</p>
						</div>

						<div className="space-y-4">
							{/* Total Spent Card */}
							<div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
								<div className="flex items-center space-x-2">
									<div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
										<span className="text-blue-600 font-medium">$</span>
									</div>
									<div>
										<p className="font-medium">Total Spent</p>
										<p className="text-sm text-muted-foreground">Lifetime purchases</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-2xl font-bold text-blue-600">${customer.orders.edges.reduce((total, { node }) => total + parseFloat(node.totalPrice.amount), 0).toFixed(2)}</p>
									<p className="text-sm text-muted-foreground">All time</p>
								</div>
							</div>

							{/* Store Credit Card */}
							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div className="flex items-center space-x-2">
									<div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
										<span className="text-green-600 font-medium">$</span>
									</div>
									<div>
										<p className="font-medium">Store Credit</p>
										<p className="text-sm text-muted-foreground">Contact support for details</p>
									</div>
								</div>
								<div className="text-right">
									<Button variant="outline" size="sm" asChild>
										<Link href="/help">Contact Support</Link>
									</Button>
								</div>
							</div>

							<div className="bg-muted/50 rounded-lg p-4">
								<h4 className="font-medium mb-2">About Store Credit</h4>
								<ul className="text-sm text-muted-foreground space-y-2">
									<li>• Store credit can be used for any purchase on our store</li>
									<li>• Credit is automatically applied at checkout when available</li>
									<li>• Contact our support team to check your store credit balance</li>
									<li>• Store credit never expires</li>
								</ul>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
