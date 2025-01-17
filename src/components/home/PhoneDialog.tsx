import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PhoneInput from "@/components/home/PhoneInput";
import { Button } from "@/components/ui/button";

const PhoneDialog = ({ size = "default" }: { size?: "default" | "lg" }) => {
	return (
		<Dialog>
			<DialogTrigger>
				<Button size={size} className={size == "lg" ? "text-lg" : ""}>
					Get Started
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="font-serif text-4xl font-medium !tracking-normal">Ready to start cataloging your lost items?</DialogTitle>
					<DialogDescription>
						Start a call with our voice companion to help you build a memory palace of belongings in your home. At the end, we&apos;ll email you a CSV of the inventory you&apos;ve
						cataloged for you to send to your insurance company.
					</DialogDescription>
				</DialogHeader>

				<PhoneInput />
			</DialogContent>
		</Dialog>
	);
};

export default PhoneDialog;
