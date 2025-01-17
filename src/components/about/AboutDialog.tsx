import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AboutProps {
	className?: string;
}

const About = ({ className = "hover:opacity-70 transition-opacity duration-300" }: AboutProps) => {
	return (
		<Dialog>
			<DialogTrigger className={className}>About</DialogTrigger>
			<DialogContent>
				<DialogHeader className="vertical gap-3 pb-3">
					<DialogTitle>About Us</DialogTitle>
					<DialogDescription className="text-black">
						Reclaim is a project by 3 friends at Stanford University. We&apos;re all passionate builders and have been working on AI and machine learning projects for years. When we saw
						the tragic news about the wildfires in LA, we knew we had to do our best to create something to help those affected. We wanted to get something out there as soon as possible,
						so we built Reclaim in just a few days and will continue improving it to help those who lost their homes in the fires.
					</DialogDescription>
				</DialogHeader>
				<Button asChild>
					<Link href="mailto:team@reclaim.org?subject=ReclaimLA.org">Contact Us</Link>
				</Button>
			</DialogContent>
		</Dialog>
	);
};

export default About;
