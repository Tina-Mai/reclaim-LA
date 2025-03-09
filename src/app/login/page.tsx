"use client";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/global/Logo";

function Login() {
	return (
		<div className="vertical items-center justify-between h-screen p-10">
			<Link href="/" className="horizontal items-center gap-3 px-3 hover:opacity-70 transition-opacity duration-300">
				<Logo />
				<div className="text-2xl font-serif font-medium">ReclaimLA.org</div>
			</Link>
			<div className="sm:w-1/2 lg:w-1/2 mt-[-18px] vertical h-fit gap-[36px] z-20">
				<div className="vertical items-center gap-[18px]">
					<h1 className="font-serif text-4xl text-center">Log in to Reclaim</h1>
					<div className="text-zinc-500 text-center">Use your Reclaim dashboard to see your call history, access additional tools, manage your account, and more.</div>
				</div>
				<div className="vertical gap-[10px]">
					<Button variant="outline" className="text-center justify-center h-[38px]">
						Sign in with Google
					</Button>
				</div>
			</div>
			<div className="horizontal text-zinc-500 text-center items-center gap-3">
				<Link href="/privacy">Privacy Policy</Link>
				<div className="size-1.5 bg-zinc-500" />
				<Link href="/terms">Terms of Service</Link>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense>
			<Login />
		</Suspense>
	);
}
