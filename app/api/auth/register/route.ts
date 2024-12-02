import { customerRegister } from "@/lib/services/shopify-customer";

export async function POST(request: Request) {
	console.log("Registration API route called");

	try {
		const body = await request.json();
		console.log("Registration request received:", {
			...body,
			password: "[REDACTED]",
		});

		const { firstName, lastName, email, password } = body;

		// Validate required fields
		if (!firstName || !lastName || !email || !password) {
			console.error("Missing required fields:", {
				firstName: !!firstName,
				lastName: !!lastName,
				email: !!email,
				password: !!password,
			});
			return new Response(
				JSON.stringify({
					message: "All fields are required",
					details: {
						firstName: !firstName ? "First name is required" : null,
						lastName: !lastName ? "Last name is required" : null,
						email: !email ? "Email is required" : null,
						password: !password ? "Password is required" : null,
					},
				}),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		// Password validation
		if (password.length < 5) {
			return new Response(
				JSON.stringify({
					message: "Password must be at least 5 characters long",
				}),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				}
			);
		}

		console.log("Calling Shopify customerRegister...");
		await customerRegister(firstName, lastName, email, password);
		console.log("User registered successfully:", email);

		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (error) {
		console.error("Registration error:", error);

		// Handle specific Shopify errors
		const errorMessage = error instanceof Error ? error.message : "Registration failed";
		const status = errorMessage.includes("Customer creation failed") ? 400 : 500;

		return new Response(
			JSON.stringify({
				message: errorMessage,
				error: error instanceof Error ? error.stack : undefined,
			}),
			{
				status,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
	}
}
