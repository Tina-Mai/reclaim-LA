"use client";
import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhoneLogin from "@/components/login/PhoneLogin";
import VerificationInput from "@/components/login/VerificationInput";
import { useAuth } from "@/context/AuthContext";
import FullLogo from "@/components/global/LogoFull";
import { useUser } from "@/context/UserContext";

function Login() {
	const { authStep, session } = useAuth();
	const { userData, isLoading: isUserDataLoading } = useUser();
	const router = useRouter();

	useEffect(() => {
		if (session && userData && !isUserDataLoading) {
			router.push("/dashboard");
		}
	}, [session, userData, isUserDataLoading, router]);

	const showVerification = authStep === "codeInput" || authStep === "verifyingCode";
	const showPhoneInput = authStep === "phoneInput" || authStep === "sendingCode";

	return (
		<div className="vertical items-center justify-between h-screen p-10 relative">
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(252,160,109,0.3)_0%,transparent_50%)] -z-50" />
			<FullLogo />
			<div className="sm:w-1/2 lg:w-1/2 mt-[-18px] vertical h-fit gap-[36px] z-20">
				<div className="vertical items-center gap-[18px]">
					<h1 className="font-serif text-4xl text-center">Log in to Reclaim</h1>
					<div className="text-zinc-500 text-center">Use your Reclaim dashboard to see your call history, access additional tools, manage your account, and more.</div>
				</div>
				{showPhoneInput && <PhoneLogin />}
				{showVerification && <VerificationInput />}
			</div>
			<div className="horizontal text-sm text-zinc-500 text-center items-center gap-3">
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
