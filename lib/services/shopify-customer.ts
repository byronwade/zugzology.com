import { shopifyFetch } from "../shopify";

interface CustomerAccessToken {
	accessToken: string;
	expiresAt: string;
}

interface CustomerUserError {
	code: string;
	field: string[];
	message: string;
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
	mutation customerCreate($input: CustomerInput!) {
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

const CUSTOMER_QUERY = `
	query customer($customerAccessToken: String!) {
		customer(customerAccessToken: $customerAccessToken) {
			id
			firstName
			lastName
			email
			phone
			acceptsMarketing
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
						processedAt
						financialStatus
						fulfillmentStatus
						currentTotalPrice {
							amount
							currencyCode
						}
					}
				}
			}
		}
	}
`;

export async function customerLogin(email: string, password: string): Promise<CustomerAccessToken> {
	console.log("Starting customer login process for:", email);

	try {
		const response = await shopifyFetch<{
			customerAccessTokenCreate: {
				customerAccessToken: CustomerAccessToken | null;
				customerUserErrors: CustomerUserError[];
			};
		}>({
			query: CUSTOMER_LOGIN_MUTATION,
			variables: {
				input: {
					email,
					password,
				},
			},
			isCustomerAccount: false,
		});

		const { customerAccessToken, customerUserErrors } = response.data.customerAccessTokenCreate;

		if (customerUserErrors?.length > 0) {
			const error = customerUserErrors[0];
			console.error("Customer login failed with user error:", error);
			throw new Error(error.message);
		}

		if (!customerAccessToken) {
			console.error("Customer login failed: No access token returned");
			throw new Error("Failed to create access token");
		}

		console.log("Customer login successful");
		return customerAccessToken;
	} catch (error) {
		console.error("Customer login error:", {
			error,
			stack: error instanceof Error ? error.stack : undefined,
		});
		throw error;
	}
}

export async function customerRegister(firstName: string, lastName: string, email: string, password: string) {
	console.log("Starting customer registration process for:", email);

	try {
		const response = await shopifyFetch<{
			customerCreate: {
				customer: {
					id: string;
					firstName: string;
					lastName: string;
					email: string;
					acceptsMarketing: boolean;
				} | null;
				customerUserErrors: CustomerUserError[];
			};
		}>({
			query: CUSTOMER_REGISTER_MUTATION,
			variables: {
				input: {
					firstName,
					lastName,
					email,
					password,
					acceptsMarketing: true,
					phone: "",
				},
			},
			isCustomerAccount: false,
		});

		const { customerCreate } = response.data;

		if (customerCreate.customerUserErrors?.length > 0) {
			const error = customerCreate.customerUserErrors[0];
			console.error("Customer registration failed with user error:", error);
			throw new Error(`Customer creation failed: ${error.message}`);
		}

		if (!customerCreate.customer) {
			console.error("Customer registration failed: No customer data returned");
			throw new Error("Customer creation failed: No customer data returned");
		}

		console.log("Customer registration successful:", customerCreate.customer);
		return customerCreate.customer;
	} catch (error) {
		console.error("Customer registration error:", {
			error,
			stack: error instanceof Error ? error.stack : undefined,
		});
		throw error;
	}
}

// Define the customer data type
interface CustomerData {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string | null;
	acceptsMarketing: boolean;
	defaultAddress: {
		id: string;
		address1: string;
		address2: string | null;
		city: string;
		province: string;
		country: string;
		zip: string;
	} | null;
	addresses: {
		edges: Array<{
			node: {
				id: string;
				address1: string;
				address2: string | null;
				city: string;
				province: string;
				country: string;
				zip: string;
			};
		}>;
	};
	orders: {
		edges: Array<{
			node: {
				id: string;
				orderNumber: number;
				processedAt: string;
				financialStatus: string;
				fulfillmentStatus: string;
				currentTotalPrice: {
					amount: string;
					currencyCode: string;
				};
			};
		}>;
	};
}

export async function getCustomerData(customerAccessToken: string): Promise<CustomerData> {
	const startTime = performance.now();

	try {
		const response = await shopifyFetch<{ customer: CustomerData }>({
			query: CUSTOMER_QUERY,
			variables: {
				customerAccessToken,
			},
			isCustomerAccount: false,
		});

		const duration = performance.now() - startTime;
		console.log(`⚡ [Customer] Data fetched in ${duration.toFixed(2)}ms`);
		return response.data.customer;
	} catch (error) {
		console.error("❌ [Customer] Error:", error instanceof Error ? error.message : "Unknown error");
		throw error;
	}
}
