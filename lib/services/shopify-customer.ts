"use server";

import { shopifyFetch } from "@/lib/shopify";
import type { ShopifyCustomer } from "@/lib/types";
import { logAuthEvent } from "@/lib/config/auth";
import { headers } from "next/headers";

interface CustomerUserError {
	code: string;
	field: string[];
	message: string;
}

interface StorefrontAccessToken {
	accessToken: string;
	expiresAt: string;
}

interface StorefrontCustomerAccessTokenCreatePayload {
	customerAccessToken: StorefrontAccessToken | null;
	customerUserErrors: CustomerUserError[];
}

interface CustomerCreatePayload {
	customer: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		acceptsMarketing: boolean;
	} | null;
	customerUserErrors: CustomerUserError[];
}

interface CustomerEmailAddress {
	emailAddress: string;
}

interface CustomerPhoneNumber {
	phoneNumber: string;
}

interface CustomerAddress {
	id: string;
	address1: string;
	address2: string | null;
	city: string;
	province: string;
	zip: string;
	country: string;
}

interface Customer {
	id: string;
	firstName: string | null;
	lastName: string | null;
	displayName: string;
	emailAddress: CustomerEmailAddress | null;
	phoneNumber: CustomerPhoneNumber | null;
	creationDate: string;
	defaultAddress: CustomerAddress | null;
	addresses: {
		edges: Array<{
			node: CustomerAddress;
		}>;
	};
	tags: string[];
	imageUrl: string;
	acceptsMarketing: boolean;
}

const CUSTOMER_LOGIN_MUTATION = `
	mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
		customerAccessTokenCreate(input: $input) {
			customerAccessToken {
				accessToken
				expiresAt
			}
			customerUserErrors {
				code
				field
				message
			}
		}
	}
`;

const CUSTOMER_REGISTER_MUTATION = `
	mutation customerCreate($input: CustomerCreateInput!) {
		customerCreate(input: $input) {
			customer {
				id
				firstName
				lastName
				email
				acceptsMarketing
			}
			customerUserErrors {
				code
				field
				message
			}
		}
	}
`;

const CUSTOMER_UPDATE_MUTATION = `
	mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
		customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
			customer {
				id
				firstName
				lastName
				email
			}
			customerUserErrors {
				code
				field
				message
			}
		}
	}
`;

const CUSTOMER_ADDRESS_UPDATE_MUTATION = `
	mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
		customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
			customerAddress {
				id
				address1
				address2
				city
				province
				country
				zip
			}
			customerUserErrors {
				code
				field
				message
			}
		}
	}
`;

const CUSTOMER_ADDRESS_CREATE_MUTATION = `
	mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
		customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
			customerAddress {
				id
				address1
				address2
				city
				province
				country
				zip
			}
			customerUserErrors {
				code
				field
				message
			}
		}
	}
`;

const customerQuery = `
	query customer($customerAccessToken: String!) {
		customer(customerAccessToken: $customerAccessToken) {
			id
			firstName
			lastName
			email
			phone
			createdAt
			defaultAddress {
				id
				address1
				address2
				city
				province
				country
				zip
			}
			addresses(first: 10) {
				edges {
					node {
						id
						address1
						address2
						city
						province
						country
						zip
					}
				}
			}
			orders(first: 10) {
				edges {
					node {
						id
						orderNumber
						totalPrice {
							amount
							currencyCode
						}
						processedAt
						fulfillmentStatus
						lineItems(first: 50) {
							edges {
								node {
									title
									quantity
									originalTotalPrice {
										amount
										currencyCode
									}
									variant {
										id
										title
										sku
										price {
											amount
											currencyCode
										}
										image {
											url
											altText
										}
										product {
											handle
											images(first: 1) {
												edges {
													node {
														url
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
`;

// Function to handle errors in a standardized way
function handleShopifyError(error: unknown, context: string) {
	const errorMessage = error instanceof Error ? error.message : "Unknown error";

	logAuthEvent(`Error in ${context}`, { errorMessage });

	// Check if prerendering
	if (errorMessage.includes("prerendering")) {
		return null;
	}

	// Rethrow as a more structured error
	throw new Error(`Shopify customer API error (${context}): ${errorMessage}`);
}

/**
 * Get customer data using their access token
 */
export async function getCustomer(customerAccessToken: string): Promise<ShopifyCustomer | null> {
	try {
		// Add headers() call to ensure this is not cached
		headers();

		logAuthEvent("Fetching customer data", { tokenExists: !!customerAccessToken });

		if (!customerAccessToken) {
			return null;
		}

		const { data, errors } = await shopifyFetch<{ customer: ShopifyCustomer }>({
			query: `
				query getCustomer($customerAccessToken: String!) {
					customer(customerAccessToken: $customerAccessToken) {
						id
						firstName
						lastName
						displayName
						email
						phone
						acceptsMarketing
						createdAt
						defaultAddress {
							id
							firstName
							lastName
							company
							address1
							address2
							city
							province
							country
							zip
							phone
						}
						addresses(first: 10) {
							edges {
								node {
									id
									firstName
									lastName
									company
									address1
									address2
									city
									province
									country
									zip
									phone
								}
							}
						}
						orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
							edges {
								node {
									id
									orderNumber
									processedAt
									financialStatus
									fulfillmentStatus
									statusUrl
									cancelReason
									canceledAt
									currencyCode
									totalPrice {
										amount
										currencyCode
									}
									subtotalPrice {
										amount
										currencyCode
									}
									totalShippingPrice {
										amount
										currencyCode
									}
									totalTax {
										amount
										currencyCode
									}
									lineItems(first: 10) {
										edges {
											node {
												id
												title
												quantity
									variant {
										id
										title
										sku
										price {
														amount
														currencyCode
													}
													image {
														url
														altText
													}
													product {
														id
														handle
														title
													}
												}
											}
										}
									}
									shippingAddress {
										firstName
										lastName
										address1
										address2
										city
										province
										country
										zip
										phone
									}
								}
							}
						}
					}
				}
			`,
			variables: { customerAccessToken },
			tags: ["customer"],
		});

		if (errors) {
			const errorMessage = errors[0]?.message || "GraphQL error";

			// Check if the token is invalid
			if (errorMessage.includes("invalid") || errorMessage.includes("expired")) {
				logAuthEvent("Invalid customer token", { error: errorMessage });
				return null;
			}

			throw new Error(errorMessage);
		}

		if (!data?.customer) {
			logAuthEvent("No customer data returned", { dataExists: !!data });
			return null;
		}

		logAuthEvent("Customer data fetched successfully", {
			customerId: data.customer.id,
			email: data.customer.email,
		});

		return data.customer;
	} catch (error) {
		return handleShopifyError(error, "getCustomer");
	}
}

/**
 * Validate if a customer access token is still valid
 */
export async function validateCustomerToken(token: string): Promise<boolean> {
	try {
		headers();

		if (!token) return false;

		const customer = await getCustomer(token);
		return !!customer;
	} catch (error) {
		logAuthEvent("Token validation failed", { error: String(error) });
		return false;
	}
}

/**
 * Update customer information
 */
export async function updateCustomer(
	customerAccessToken: string,
	customerInput: {
		firstName?: string;
		lastName?: string;
		email?: string;
		phone?: string;
		password?: string;
		acceptsMarketing?: boolean;
	}
): Promise<{ success: boolean; customer?: ShopifyCustomer; errors?: any[] }> {
	try {
		const { data, errors } = await shopifyFetch<{
			customerUpdate: {
				customer: ShopifyCustomer;
				customerUserErrors: Array<{ code: string; field: string; message: string }>;
			};
		}>({
			query: `
				mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
					customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
						customer {
							id
							firstName
							lastName
							displayName
							email
							phone
						}
						customerUserErrors {
							code
							field
							message
						}
					}
				}
			`,
			variables: {
				customerAccessToken,
				customer: customerInput,
			},
			tags: ["customer-update"],
		});

		if (errors) {
			throw new Error(errors[0]?.message || "GraphQL error");
		}

		const { customerUpdate } = data;

		if (customerUpdate.customerUserErrors?.length > 0) {
			return {
				success: false,
				errors: customerUpdate.customerUserErrors,
			};
		}

		return {
			success: true,
			customer: customerUpdate.customer,
		};
	} catch (error) {
		handleShopifyError(error, "updateCustomer");
		return { success: false };
	}
}

export async function customerLogin(email: string, password: string) {
	console.log("Starting customer login process for:", email);

	try {
		const response = await shopifyFetch<{
			customerAccessTokenCreate: StorefrontCustomerAccessTokenCreatePayload;
		}>({
			query: CUSTOMER_LOGIN_MUTATION,
			variables: {
				input: {
					email,
					password,
				},
			},
			headers: {
				"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
			},
		});

		if (response.errors) {
			console.error("❌ [Shopify API] Login error:", response.errors);
			throw new Error(response.errors[0].message);
		}

		const { customerAccessTokenCreate } = response.data;

		if (customerAccessTokenCreate.customerUserErrors?.length > 0) {
			const error = customerAccessTokenCreate.customerUserErrors[0];
			console.error("❌ [Shopify API] Login user error:", error);
			throw new Error(error.message);
		}

		const token = customerAccessTokenCreate.customerAccessToken;
		if (!token) {
			throw new Error("No access token returned");
		}

		console.log("✅ [Shopify API] Login successful, token expires:", token.expiresAt);

		return {
			accessToken: token.accessToken,
			expiresAt: token.expiresAt,
		};
	} catch (error) {
		console.error("❌ [Shopify API] Error:", error);
		throw error;
	}
}

export async function customerRegister(firstName: string, lastName: string, email: string, password: string) {
	console.log("Starting customer registration process for:", email);

	try {
		const response = await shopifyFetch<{
			customerCreate: CustomerCreatePayload;
		}>({
			query: CUSTOMER_REGISTER_MUTATION,
			variables: {
				input: {
					firstName,
					lastName,
					email,
					password,
					acceptsMarketing: true,
				},
			},
			headers: {
				"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
			},
		});

		if (response.errors) {
			console.error("❌ [Shopify API] Customer registration error:", response.errors);
			throw new Error(response.errors[0].message);
		}

		const { customerCreate } = response.data;

		if (customerCreate.customerUserErrors?.length > 0) {
			const error = customerCreate.customerUserErrors[0];
			console.error("❌ [Shopify API] Customer user error:", error);
			throw new Error(error.message);
		}

		const customer = customerCreate.customer;
		if (!customer) {
			throw new Error("No customer data returned");
		}

		console.log("✅ [Shopify API] Customer registered successfully:", customer.id);
		return customer;
	} catch (error) {
		console.error("❌ [Shopify API] Error:", error);
		throw error;
	}
}

export async function updateCustomerAddress(
	customerAccessToken: string,
	addressId: string,
	address: {
		address1: string;
		address2?: string;
		city: string;
		province: string;
		country: string;
		zip: string;
	}
) {
	try {
		const response = await shopifyFetch<{
			customerAddressUpdate: {
				customerAddress: {
					id: string;
					address1: string;
					address2: string | null;
					city: string;
					province: string;
					country: string;
					zip: string;
				} | null;
				customerUserErrors: CustomerUserError[];
			};
		}>({
			query: CUSTOMER_ADDRESS_UPDATE_MUTATION,
			variables: {
				customerAccessToken,
				id: addressId,
				address,
			},
		});

		if (response.errors) {
			throw new Error(response.errors[0].message);
		}

		const { customerAddressUpdate } = response.data;

		if (customerAddressUpdate.customerUserErrors?.length > 0) {
			throw new Error(customerAddressUpdate.customerUserErrors[0].message);
		}

		return customerAddressUpdate.customerAddress;
	} catch (error) {
		console.error("❌ [Shopify API] Error updating address:", error);
		throw error;
	}
}

export async function createCustomerAddress(
	customerAccessToken: string,
	address: {
		address1: string;
		address2?: string;
		city: string;
		province: string;
		country: string;
		zip: string;
	}
) {
	try {
		const response = await shopifyFetch<{
			customerAddressCreate: {
				customerAddress: {
					id: string;
					address1: string;
					address2: string | null;
					city: string;
					province: string;
					country: string;
					zip: string;
				} | null;
				customerUserErrors: CustomerUserError[];
			};
		}>({
			query: CUSTOMER_ADDRESS_CREATE_MUTATION,
			variables: {
				customerAccessToken,
				address,
			},
		});

		if (response.errors) {
			throw new Error(response.errors[0].message);
		}

		const { customerAddressCreate } = response.data;

		if (customerAddressCreate.customerUserErrors?.length > 0) {
			throw new Error(customerAddressCreate.customerUserErrors[0].message);
		}

		return customerAddressCreate.customerAddress;
	} catch (error) {
		console.error("❌ [Shopify API] Error creating address:", error);
		throw error;
	}
}
