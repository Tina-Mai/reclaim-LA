import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PhoneInput from "@/components/home/PhoneInput";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Visual from "@/components/global/Visual";

const PhoneDialog = ({ size = "default" }: { size?: "default" | "lg" }) => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<div className={cn(buttonVariants({ size }), size === "lg" ? "text-lg" : "", "cursor-pointer")}>Get Started</div>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader className="vertical gap-3 pb-3">
					<DialogTitle>Ready to start cataloging your lost items?</DialogTitle>
					<DialogDescription>
						Start a call with our voice companion to help you build a memory palace of belongings in your home. At the end, we&apos;ll email you a CSV of the inventory you&apos;ve
						cataloged for you to send to your insurance company.
					</DialogDescription>
				</DialogHeader>

				<div className="pt-2 pb-6">
					<Visual />
				</div>
				<PhoneInput />
			</DialogContent>
		</Dialog>
	);
};

export default PhoneDialog;
