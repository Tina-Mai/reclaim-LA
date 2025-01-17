"use client";

import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";

const PhoneInputComponent = () => {
	return (
		<div className="horizontal items-center gap-2">
			<PhoneInput defaultCountry="US" placeholder="Phone number" />
			<Button className="hidden sm:flex">Send me a call</Button>
			<Button className="flex sm:hidden">Start a call</Button>
		</div>
	);
};

export default PhoneInputComponent;
