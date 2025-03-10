"use client";

import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const PhoneLogin = () => {
	const { phoneNumber, setPhoneNumber, startPhoneVerification, isLoading, authStep } = useAuth();

	const isSuccess = authStep === "sendingCode" || authStep === "codeInput";

	return (
		<div className="horizontal items-center justify-center gap-2">
			<PhoneInput defaultCountry="US" placeholder="Phone number" value={phoneNumber} onChange={setPhoneNumber} disabled={isLoading || isSuccess} />
			<motion.div whileHover="hover" initial="initial">
				<Button className="hidden sm:flex" onClick={startPhoneVerification} disabled={isLoading || isSuccess} variant={isSuccess ? "secondary" : "default"}>
					{isSuccess ? (
						<>
							<Check className="mr-2 h-4 w-4" />
							Sent code
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
							Log in
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
			<Button className="flex sm:hidden min-w-24" onClick={startPhoneVerification} disabled={isLoading || isSuccess} variant={isSuccess ? "secondary" : "default"}>
				{isSuccess ? (
					<>
						<Check className="mr-2 h-4 w-4" />
						Sent
					</>
				) : isLoading ? (
					"Sending code..."
				) : (
					"Log in"
				)}
			</Button>
		</div>
	);
};

export default PhoneLogin;
