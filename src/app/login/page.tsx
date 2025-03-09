"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/global/Logo";

function Login() {
	return (
		<div className="vertical items-center justify-center h-screen">
			<div className="max-w-[320px] mt-[-18px] w-full vertical h-fit gap-[36px] z-20">
				<div className="vertical items-center gap-[18px]">
					{/* <Image src="/img/logo-cube-light.png" alt="Paradigm logo" width={100} height={100} priority quality={90} /> */}
					<Logo />
					<h1 className="text-heading-1 text-center text-dark-blue-gradient">Log in to Reclaim</h1>
					<div className="text-zinc-500 text-center">Use your Reclaim dashboard to see your call history, access additional tools, manage your account, and more.</div>
				</div>
				<div className="vertical gap-[10px]">
					<Button variant="outline" className="text-center justify-center h-[38px]">
						Sign in with Google
					</Button>
				</div>
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
