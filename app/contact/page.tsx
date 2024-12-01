"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ContactForm() {
	const searchParams = useSearchParams();
	const subject = searchParams.get("subject") || "";

	return (
		<div className="max-w-2xl mx-auto p-4">
			<h1 className="text-3xl font-bold mb-8">Contact Us</h1>
			<form className="space-y-6">
				<div>
					<label htmlFor="subject" className="block text-sm font-medium mb-2">
						Subject
					</label>
					<input type="text" id="subject" name="subject" defaultValue={subject} className="w-full p-2 border rounded-lg" />
				</div>
				<div>
					<label htmlFor="message" className="block text-sm font-medium mb-2">
						Message
					</label>
					<textarea id="message" name="message" rows={6} className="w-full p-2 border rounded-lg"></textarea>
				</div>
				<button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
					Send Message
				</button>
			</form>
		</div>
	);
}

export default function ContactPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ContactForm />
		</Suspense>
	);
}
