import React from "react";

interface DarkCheckerboardProps {
	className?: string;
}

export function DarkCheckerboard({ className = "" }: DarkCheckerboardProps) {
	return (
		<div
			className={`fixed inset-0 bg-black ${className}`}
			style={{
				backgroundImage: `
          linear-gradient(45deg, #171717 25%, transparent 25%),
          linear-gradient(-45deg, #171717 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #171717 75%),
          linear-gradient(-45deg, transparent 75%, #171717 75%)
        `,
				backgroundSize: "25vh 25vh",
				backgroundPosition: "0 0, 0 12.5vh, 12.5vh -12.5vh, -12.5vh 0",
			}}
		/>
	);
}
