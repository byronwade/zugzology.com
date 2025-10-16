"use client";

import { useState } from "react";

export function NewsletterSection() {
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [message, setMessage] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus("loading");

		try {
			// Submit to Shopify's customer signup endpoint
			const shopifyResponse = await fetch("/api/newsletter-signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			if (!shopifyResponse.ok) {
				throw new Error("Failed to sign up");
			}

			setStatus("success");
			setMessage("Thanks for subscribing! Check your email for confirmation.");
			setEmail("");
		} catch (_error) {
			setStatus("error");
			setMessage("Something went wrong. Please try again.");
		}
	};

	return (
		<div className="shopify-section section-newsletter mx-[50px] mb-16">
			<div
				className="section-signup"
				style={{
					backgroundImage: "url('/images/signup-2x.png')",
					backgroundSize: "cover",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
				}}
			>
				<div className="card-content-padding-x card card-scheme card-scheme--none rounded-[40px] px-8 py-40 text-center align-center">
					<h2 className="mb-0 font-extrabold text-[#141414] text-[50px]">
						SIGN UP AND GET INSIDER GROW TIPS + SPECIAL OFFERS!
					</h2>

					<div className="mt-4">
						<p className="text-[#ebbd70] text-xl">Join the Mushroom Fam</p>
					</div>

					<div className="signup-form mx-auto mt-8 max-w-xl">
						<form className="flex gap-0" onSubmit={handleSubmit}>
							<div className="signup-form__inline-container flex flex-1">
								<input
									aria-label="Email"
									className="flex-1 border-none bg-[#272727] px-4 py-3 text-white outline-none placeholder:text-[#606060]"
									disabled={status === "loading"}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Enter email"
									required
									type="email"
									value={email}
								/>
								<button
									className="bg-primary px-8 py-3 font-bold text-primary-foreground uppercase transition-all duration-200 hover:bg-primary/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
									disabled={status === "loading"}
									type="submit"
								>
									{status === "loading" ? "Joining..." : "Join"}
								</button>
							</div>
						</form>
						{message && (
							<div className={`mt-4 text-sm ${status === "success" ? "text-green-500" : "text-red-500"}`}>
								{message}
							</div>
						)}
					</div>
				</div>
			</div>

			<style jsx>{`
				.section-signup {
					border-radius: 40px;
					overflow: hidden;
				}

				@media (max-width: 768px) {
					.section-signup h2 {
						font-size: 2rem;
					}

					.signup-form__inline-container {
						flex-direction: column;
						gap: 1rem;
					}

					.signup-form__inline-container button {
						width: 100%;
					}
				}
			`}</style>
		</div>
	);
}
