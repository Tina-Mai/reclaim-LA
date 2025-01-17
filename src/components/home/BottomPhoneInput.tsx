import { useState, useCallback } from "react";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const BottomPhoneInput = () => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [phoneInput, setPhoneInput] = useState<HTMLInputElement | null>(null);

	const handleExpand = () => {
		setIsExpanded(true);
		// Focus the input after animation completes
		setTimeout(() => {
			phoneInput?.focus();
		}, 300);
	};

	const handleRef = useCallback((node: HTMLDivElement | null) => {
		if (node) {
			const input = node.querySelector("input");
			if (input) setPhoneInput(input);
		}
	}, []);

	return (
		<AnimatePresence mode="wait">
			{!isExpanded ? (
				<motion.div key="button" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
					<Button size="lg" className="text-lg" onClick={handleExpand}>
						Get Started
					</Button>
				</motion.div>
			) : (
				<motion.div key="phone-input" className="horizontal items-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} ref={handleRef}>
					<PhoneInput defaultCountry="US" placeholder="Phone number" />
					<Button className="hidden sm:flex">Send me a call</Button>
					<Button className="flex sm:hidden">Start a call</Button>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default BottomPhoneInput;
