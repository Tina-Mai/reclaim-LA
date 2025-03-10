import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PhoneInput from "@/components/home/PhoneInput";
import Visual from "@/components/global/Visual";
import { Button } from "@/components/ui/button";

const PhoneDialog = ({
	className,
	type = "link",
	size = "lg",
	buttonText = "Get Started",
	buttonVariant = "default",
	buttonClassName,
}: {
	className?: string;
	type?: "link" | "button";
	size?: "lg" | "default";
	buttonText?: string;
	buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
	buttonClassName?: string;
}) => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				{type === "link" ? (
					<div className={`${className} cursor-pointer`}>Get Started</div>
				) : (
					<Button className={`${className} cursor-pointer ${buttonClassName}`} size={size} variant={buttonVariant}>
						{buttonText}
					</Button>
				)}
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
				<div className="flex justify-center">
					<PhoneInput />
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default PhoneDialog;
