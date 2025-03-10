"use client";

import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const PhoneLogin = () => {
	const { phoneNumber, setPhoneNumber, startPhoneVerification, verifyCode, isLoading, authStep, error } = useAuth();
	const [verificationCode, setVerificationCode] = useState("");

	const isPhoneSuccess = authStep === "sendingCode" || authStep === "codeInput" || authStep === "verifyingCode";
	const showCodeInput = authStep === "codeInput" || authStep === "verifyingCode";

	const handleVerifyCode = () => {
		if (verificationCode.length === 6) {
			verifyCode(verificationCode);
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="horizontal items-center justify-center gap-2">
				<PhoneInput defaultCountry="US" placeholder="Phone number" value={phoneNumber} onChange={setPhoneNumber} disabled={isLoading || isPhoneSuccess} />
				<motion.div whileHover="hover" initial="initial">
					<Button className="hidden sm:flex" onClick={startPhoneVerification} disabled={isLoading || isPhoneSuccess} variant={isPhoneSuccess ? "secondary" : "default"}>
						{isPhoneSuccess ? (
							<>
								<Check className="mr-2 h-4 w-4" />
								Code sent
							</>
						) : isLoading ? (
							"Sending code..."
						) : (
							<motion.div
								className="horizontal items-center"
								variants={{
									initial: { gap: "0px" },
									hover: { gap: "8px" },
								}}
								transition={{ duration: 0.2 }}
							>
								Send code
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
						)}
					</Button>
				</motion.div>
				<Button className="flex sm:hidden min-w-24" onClick={startPhoneVerification} disabled={isLoading || isPhoneSuccess} variant={isPhoneSuccess ? "secondary" : "default"}>
					{isPhoneSuccess ? (
						<>
							<Check className="mr-2 h-4 w-4" />
							Sent
						</>
					) : isLoading ? (
						"Sending..."
					) : (
						"Send code"
					)}
				</Button>
			</div>

			{showCodeInput && (
				<div className="horizontal items-center justify-center gap-2">
					<Input type="text" placeholder="Enter 6-digit code" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} maxLength={6} className="max-w-[200px]" />
					<Button onClick={handleVerifyCode} disabled={verificationCode.length !== 6 || isLoading}>
						{isLoading ? "Verifying..." : "Verify"}
					</Button>
				</div>
			)}

			{error && <p className="text-sm text-red-500 text-center">{error}</p>}
		</div>
	);
};

export default PhoneLogin;
