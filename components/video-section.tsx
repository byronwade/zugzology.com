"use client";

import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function VideoSection() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<section className="py-16 bg-gray-900 text-white">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					<div>
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
							See How Easy It Is To Grow Your Own Mushrooms
						</h2>
						<p className="text-lg text-gray-300 mb-8">
							Our step-by-step video guide walks you through the entire process, from setup to harvest. Learn the
							techniques used by professional growers to maximize your yields and grow healthy, delicious mushrooms at
							home.
						</p>
						<ul className="space-y-3 mb-8">
							<li className="flex items-start">
								<span className="text-primary mr-2">✓</span>
								<span>Simple setup process anyone can follow</span>
							</li>
							<li className="flex items-start">
								<span className="text-primary mr-2">✓</span>
								<span>Expert tips for optimal growing conditions</span>
							</li>
							<li className="flex items-start">
								<span className="text-primary mr-2">✓</span>
								<span>Troubleshooting common issues</span>
							</li>
							<li className="flex items-start">
								<span className="text-primary mr-2">✓</span>
								<span>Harvesting and storage techniques</span>
							</li>
						</ul>
						<Dialog open={isOpen} onOpenChange={setIsOpen}>
							<DialogTrigger asChild>
								<Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
									<Play className="mr-2 h-5 w-5" />
									Watch Video Guide
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-4xl p-0 bg-black">
								<DialogHeader className="sr-only">
									<DialogTitle>Mushroom Growing Video Guide</DialogTitle>
									<DialogDescription>
										A comprehensive video guide showing how to grow mushrooms from start to finish
									</DialogDescription>
								</DialogHeader>
								<div className="aspect-video w-full">
									{/* In a real implementation, this would be a YouTube or Vimeo embed */}
									<div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
										<p className="text-center p-8">
											Video player would be embedded here.
											<br />
											This is a placeholder for demonstration purposes.
										</p>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</div>

					<div className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden">
						{/* Video thumbnail */}
						<div className="absolute inset-0 flex items-center justify-center">
							<Button
								size="icon"
								className="h-16 w-16 rounded-full bg-primary/90 hover:bg-primary"
								onClick={() => setIsOpen(true)}
							>
								<Play className="h-8 w-8" />
								<span className="sr-only">Play video</span>
							</Button>
						</div>
						<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
						<div className="absolute bottom-4 left-4 right-4">
							<p className="text-white font-medium">Complete Guide: From Spore to Harvest</p>
							<p className="text-gray-300 text-sm">12:45 • 50K+ views</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
