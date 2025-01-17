import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({ subsets: ["latin"] });

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
			<body className={`${workSans.className} antialiased`}>{children}</body>
		</html>
	);
}
