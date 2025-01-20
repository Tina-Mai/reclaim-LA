import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"] });

const title = "ReclaimLA.org";
const description = "Helping LA residents who lost their homes build a catalog of lost possessions for their insurance claims";

export const metadata: Metadata = {
	title: title,
	description: description,
	keywords: [
		"reclaim",
		"LA",
		"wildfires",
		"insurance",
		"catalog",
		"lost possessions",
		"insurance claims",
		"los angeles",
		"reclaim LA",
		"insurance claims",
		"inventory",
		"reclaim LA",
		"loss inventory",
		"loss assessment",
		"LA fires",
		"LA wildfires",
	],
	openGraph: {
		title: title,
		description: description,
		siteName: title,
		type: "website",
		locale: "en_US",
		images: [
			{
				url: "/opengraph-image.png",
				width: 1200,
				height: 630,
				alt: "ReclaimLA.org",
			},
		],
		url: "https://reclaimla.org",
	},
	twitter: {
		title: title,
		description: description,
		images: [
			{
				url: "/twitter-image.png",
				width: 1200,
				height: 630,
				alt: "ReclaimLA.org",
			},
		],
		card: "summary_large_image",
	},
	robots: {
		index: true,
		follow: true,
		nocache: true,
		googleBot: {
			index: true,
			follow: false,
			noimageindex: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	applicationName: title,
	icons: {
		icon: [
			{
				url: "/favicon.ico",
				type: "image/x-icon",
			},
		],
		shortcut: [
			{
				url: "/favicon.ico",
				type: "image/x-icon",
			},
		],
	},
	metadataBase: new URL("https://reclaimla.org"),
	alternates: { canonical: "https://reclaimla.org" },
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${manrope.className} antialiased`}>
				<main>{children}</main>
				<Toaster />
			</body>
		</html>
	);
}
