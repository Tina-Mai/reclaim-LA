import Link from "next/link";
import Logo from "@/components/global/Logo";

const Footer = () => {
	return (
		<div className="vertical mx-5 mt-12 border-t border-zinc-400">
			<div className="vertical gap-2 pb-8 pt-6">
				<div className="flex flex-col md:flex-row justify-between items-center px-3 gap-6 md:gap-0">
					<Link href="/" className="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
						<Logo />
						<div className="font-serif text-2xl font-medium">ReclaimLA.org</div>
						<div className="text-sm text-zinc-500">© 2024 ReclaimLA.org</div>
					</Link>

					<div className="flex flex-col md:flex-row gap-5 font-medium items-center">
						<Link href="/about">About</Link>
						<Link href="mailto:team@reclaim.org?subject=ReclaimLA.org">Contact</Link>
						<Link href="/privacy">Privacy</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Footer;
