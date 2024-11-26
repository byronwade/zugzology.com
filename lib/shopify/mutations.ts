// Customer authentication mutations
export const customerAccessTokenCreateMutation = /* GraphQL */ `
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

export const customerCreateMutation = /* GraphQL */ `
	mutation customerCreate($input: CustomerCreateInput!) {
		customerCreate(input: $input) {
			customer {
				id
				email
				firstName
				lastName
			}
			customerUserErrors {
				code
				field
				message
			}
		}
	}
`;

export const customerUpdateMutation = /* GraphQL */ `
	mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
		customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
			customer {
				id
				email
				firstName
				lastName
			}
			customerUserErrors {
				code
				field
				message
			}
		}
	}
`;
