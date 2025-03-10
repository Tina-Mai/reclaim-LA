"use client";

import React, { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const VerificationInput = () => {
	const [code, setCode] = useState("");
	const { verifyCode, isLoading, authStep } = useAuth();

	const isSuccess = authStep === "verifyingCode";

	const handleSubmit = () => {
		if (code.length === 6) {
			verifyCode(code);
		}
	};

	return (
		<div className="flex items-center justify-center gap-2">
			<InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value={code} onChange={(value) => setCode(value)} disabled={isLoading || isSuccess}>
				<InputOTPGroup>
					<InputOTPSlot index={0} />
					<InputOTPSlot index={1} />
					<InputOTPSlot index={2} />
				</InputOTPGroup>
				<InputOTPSeparator />
				<InputOTPGroup>
					<InputOTPSlot index={3} />
					<InputOTPSlot index={4} />
					<InputOTPSlot index={5} />
				</InputOTPGroup>
			</InputOTP>
			<motion.div whileHover="hover" initial="initial">
				<Button className="hidden sm:flex" onClick={handleSubmit} disabled={isLoading || isSuccess || code.length !== 6}>
					<motion.div
						className="horizontal items-center"
						variants={{
							initial: { gap: "0px" },
							hover: { gap: "8px" },
						}}
						transition={{ duration: 0.2 }}
					>
						Verify
						<motion.div
							variants={{
								initial: { width: 0, opacity: 0 },
								hover: { width: "16px", opacity: 1 },
							}}
							transition={{ duration: 0.2 }}
							style={{ overflow: "hidden" }}
						>
							<ArrowRight className="size-4" />
						</motion.div>
					</motion.div>
				</Button>
			</motion.div>
			<Button className="flex sm:hidden min-w-24" onClick={handleSubmit} disabled={isLoading || isSuccess || code.length !== 6} variant={isSuccess ? "secondary" : "default"}>
				{isSuccess ? (
					<>
						<Check className="mr-2 h-4 w-4" />
						Verified
					</>
				) : isLoading ? (
					"Verifying..."
				) : (
					"Verify"
				)}
			</Button>
		</div>
	);
};

export default VerificationInput;
