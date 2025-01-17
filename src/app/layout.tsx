import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Reclaim",
	description: "Helping LA residents who lost their homes build a catalog of lost possessions for their insurance claims",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${manrope.className} antialiased`}>{children}</body>
		</html>
	);
}
