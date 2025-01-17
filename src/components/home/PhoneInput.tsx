"use client";

import { useState } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const PhoneInputComponent = () => {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const { toast } = useToast();

	const handleSubmit = async () => {
		if (!phoneNumber) {
			toast({
				title: "Phone number required",
				description: "Please enter your phone number to start a call.",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch("/api/startCall", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ phone_number: phoneNumber }),
			});

			if (!response.ok) {
				throw new Error("Failed to start call");
			}

			setIsSuccess(true);
			toast({
				title: "Call initiated",
				description: "You will receive a call shortly.",
			});

			// Reset success state after 3 seconds
			setTimeout(() => {
				setIsSuccess(false);
				setPhoneNumber(""); // Clear the input for next use
			}, 3000);
		} catch (error) {
			console.error("Error starting call:", error);
			toast({
				title: "Error",
				description: "Failed to start the call. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="horizontal items-center gap-2">
			<PhoneInput defaultCountry="US" placeholder="Phone number" value={phoneNumber} onChange={setPhoneNumber} disabled={isLoading || isSuccess} />
			<motion.div whileHover="hover" initial="initial">
				<Button className="hidden sm:flex" onClick={handleSubmit} disabled={isLoading || isSuccess} variant={isSuccess ? "secondary" : "default"}>
					{isSuccess ? (
						<>
							<Check className="mr-2 h-4 w-4" />
							Call Sent
						</>
					) : isLoading ? (
						"Starting..."
					) : (
						<motion.div
							className="horizontal items-center"
							variants={{
								initial: { gap: "0px" },
								hover: { gap: "8px" },
							}}
							transition={{ duration: 0.2 }}
						>
							Send me a call
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
			<Button className="flex sm:hidden min-w-24" onClick={handleSubmit} disabled={isLoading || isSuccess} variant={isSuccess ? "secondary" : "default"}>
				{isSuccess ? (
					<>
						<Check className="mr-2 h-4 w-4" />
						Sent
					</>
				) : isLoading ? (
					"Starting..."
				) : (
					"Start a call"
				)}
			</Button>
		</div>
	);
};

export default PhoneInputComponent;
