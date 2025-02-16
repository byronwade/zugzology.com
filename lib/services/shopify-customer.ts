import { shopifyFetch } from "@/lib/shopify";
import type { ShopifyCustomer } from "@/lib/types";

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

export async function getCustomer(customerAccessToken: string): Promise<ShopifyCustomer> {
	try {
		const response = await shopifyFetch<{
			customer: ShopifyCustomer;
		}>({
			query: customerQuery,
			variables: {
				customerAccessToken,
			},
			headers: {
				"X-Shopify-Storefront-Access-Token": process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
			},
		});

		if (response.errors) {
			console.error("❌ [Shopify API] Get customer error:", response.errors);
			throw new Error(response.errors[0].message);
		}

		return response.data.customer;
	} catch (error) {
		console.error("❌ [Shopify API] Error:", error);
		throw error;
	}
}

export async function updateCustomer(customerAccessToken: string, customer: { firstName?: string; lastName?: string; email?: string }) {
	try {
		const response = await shopifyFetch<{
			customerUpdate: {
				customer: {
					id: string;
					firstName: string;
					lastName: string;
					email: string;
				} | null;
				customerUserErrors: CustomerUserError[];
			};
		}>({
			query: CUSTOMER_UPDATE_MUTATION,
			variables: {
				customerAccessToken,
				customer,
			},
		});

		if (response.errors) {
			throw new Error(response.errors[0].message);
		}

		const { customerUpdate } = response.data;

		if (customerUpdate.customerUserErrors?.length > 0) {
			throw new Error(customerUpdate.customerUserErrors[0].message);
		}

		return customerUpdate.customer;
	} catch (error) {
		console.error("❌ [Shopify API] Error updating customer:", error);
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
