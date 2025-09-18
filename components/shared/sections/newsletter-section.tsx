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
		} catch (error) {
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
				<div className="card-content-padding-x align-center card card-scheme card-scheme--none py-40 px-8 rounded-[40px] text-center">
					<h2 className="text-[50px] font-extrabold text-[#141414] mb-0">SIGN UP AND GET INSIDER GROW TIPS + SPECIAL OFFERS!</h2>

					<div className="mt-4">
						<p className="text-[#ebbd70] text-xl">Join the Mushroom Fam</p>
					</div>

					<div className="signup-form mt-8 max-w-xl mx-auto">
						<form onSubmit={handleSubmit} className="flex gap-0">
							<div className="signup-form__inline-container flex-1 flex">
								<input type="email" placeholder="Enter email" className="flex-1 bg-[#272727] text-white px-4 py-3 border-none outline-none placeholder:text-[#606060]" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" required disabled={status === "loading"} />
								<button className="bg-white text-black px-8 py-3 font-bold uppercase hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={status === "loading"}>
									{status === "loading" ? "Joining..." : "Join"}
								</button>
							</div>
						</form>
						{message && <div className={`mt-4 text-sm ${status === "success" ? "text-green-500" : "text-red-500"}`}>{message}</div>}
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
