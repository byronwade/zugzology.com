"use client";

import Cookies from "js-cookie";
import { Loader2, Mail, MapPin, Plus, User } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { SignOutButton } from "@/components/features/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { createCustomerAddress, updateCustomer, updateCustomerAddress } from "@/lib/services/shopify-customer";
import type { ShopifyCustomer } from "@/lib/types";

type Address = {
	id: string;
	street: string;
	city: string;
	state: string;
	zip: string;
	country: string;
};

type AccountInfoProps = {
	customer: ShopifyCustomer;
};

export default function AccountInfo({ customer }: AccountInfoProps) {
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
				<h2 className="font-bold text-2xl">Account Information</h2>
				<p className="text-muted-foreground">View and manage your account information</p>
			</div>

			<div className="space-y-6">
				<Card className="p-6">
					<div className="mb-6 flex items-start justify-between">
						<div>
							<h3 className="font-medium text-lg">Personal Information</h3>
							<p className="text-muted-foreground text-sm">Update your personal details</p>
						</div>
						<SignOutButton />
					</div>
					<Separator className="mb-6" />
					<div className="space-y-6">
						<div className="space-y-2">
							<Label className="font-medium text-base" htmlFor="name">
								Name
							</Label>
							<div className="flex items-center space-x-2">
								<User className="h-5 w-5 text-muted-foreground" />
								{isEditingName ? (
									<div className="flex flex-grow items-center space-x-2">
										<Input id="name" onChange={(e) => setNewName(e.target.value)} type="text" value={newName} />
										<Button disabled={isUpdating} onClick={handleNameEdit} variant="outline">
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
									<div className="flex flex-grow items-center justify-between">
										<span className="text-foreground">{profile.name}</span>
										<Button onClick={() => setIsEditingName(true)} size="sm" variant="ghost">
											Edit
										</Button>
									</div>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<Label className="font-medium text-base" htmlFor="email">
								Email
							</Label>
							<div className="flex items-center space-x-2">
								<Mail className="h-5 w-5 text-muted-foreground" />
								{isEditingEmail ? (
									<div className="flex flex-grow items-center space-x-2">
										<Input id="email" onChange={(e) => setNewEmail(e.target.value)} type="email" value={newEmail} />
										<Button disabled={isUpdating} onClick={handleEmailEdit} variant="outline">
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
									<div className="flex flex-grow items-center justify-between">
										<span className="text-foreground">{profile.email}</span>
										<Button onClick={() => setIsEditingEmail(true)} size="sm" variant="ghost">
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
							<h3 className="mb-1 font-medium text-lg">Addresses</h3>
							<p className="text-muted-foreground text-sm">Manage your shipping addresses</p>
						</div>

						<div className="space-y-4">
							{profile.addresses.length === 0 && !isAddingAddress ? (
								<p className="text-muted-foreground">No addresses added</p>
							) : (
								<ul className="space-y-4">
									{profile.addresses.map((address) => (
										<li className="flex items-center justify-between rounded-lg border p-4" key={address.id}>
											<div className="flex items-center space-x-2">
												<MapPin className="h-5 w-5 text-muted-foreground" />
												<span className="text-foreground">
													{address.street}, {address.city}, {address.state} {address.zip}, {address.country}
												</span>
											</div>
											<Button
												disabled={isUpdating}
												onClick={() => handleUpdateAddress(address.id, address)}
												size="sm"
												variant="ghost"
											>
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
									<Input
										name="street"
										onChange={handleAddressChange}
										placeholder="Street Address"
										value={newAddress.street}
									/>
									<div className="grid grid-cols-2 gap-4">
										<Input name="city" onChange={handleAddressChange} placeholder="City" value={newAddress.city} />
										<Input name="state" onChange={handleAddressChange} placeholder="State" value={newAddress.state} />
									</div>
									<div className="grid grid-cols-2 gap-4">
										<Input name="zip" onChange={handleAddressChange} placeholder="ZIP Code" value={newAddress.zip} />
										<Input
											name="country"
											onChange={handleAddressChange}
											placeholder="Country"
											value={newAddress.country}
										/>
									</div>
									<div className="flex justify-end space-x-2">
										<Button disabled={isUpdating} onClick={() => setIsAddingAddress(false)} variant="outline">
											Cancel
										</Button>
										<Button disabled={isUpdating} onClick={handleAddAddress}>
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
								<Button className="w-full" disabled={isUpdating} onClick={() => setIsAddingAddress(true)}>
									<Plus className="mr-2 h-5 w-5" />
									Add New Address
								</Button>
							)}
						</div>
					</div>
				</Card>

				{/* Purchase History & Store Credit Section */}
				<Card className="mt-6 p-6">
					<div className="space-y-6">
						<div>
							<h3 className="mb-1 font-medium text-lg">Purchase History & Store Credit</h3>
							<p className="text-muted-foreground text-sm">View your spending history and available store credit</p>
						</div>

						<div className="space-y-4">
							{/* Total Spent Card */}
							<div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
								<div className="flex items-center space-x-2">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
										<span className="font-medium text-blue-600 dark:text-blue-400">$</span>
									</div>
									<div>
										<p className="font-medium">Total Spent</p>
										<p className="text-muted-foreground text-sm">Lifetime purchases</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-bold text-2xl text-blue-600 dark:text-blue-400">
										$
										{customer.orders.edges
											.reduce((total, { node }) => total + Number.parseFloat(node.totalPrice.amount), 0)
											.toFixed(2)}
									</p>
									<p className="text-muted-foreground text-sm">All time</p>
								</div>
							</div>

							{/* Store Credit Card */}
							<div className="flex items-center justify-between rounded-lg border p-4">
								<div className="flex items-center space-x-2">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
										<span className="font-medium text-green-600 dark:text-green-400">$</span>
									</div>
									<div>
										<p className="font-medium">Store Credit</p>
										<p className="text-muted-foreground text-sm">Contact support for details</p>
									</div>
								</div>
								<div className="text-right">
									<Button asChild size="sm" variant="outline">
										<Link href="/help">Contact Support</Link>
									</Button>
								</div>
							</div>

							<div className="rounded-lg bg-muted/50 p-4">
								<h4 className="mb-2 font-medium">About Store Credit</h4>
								<ul className="space-y-2 text-muted-foreground text-sm">
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
