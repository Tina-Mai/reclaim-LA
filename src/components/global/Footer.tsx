import Link from "next/link";
import Logo from "@/components/global/Logo";

const Footer = () => {
	return (
		<div className="vertical mx-5 mt-12 border-t border-zinc-400">
			<div className="vertical gap-2 pb-8 pt-6">
				<div className="horizontal justify-between items-center px-3">
					<Link href="/" className="horizontal items-center gap-3">
						<Logo />
						<div className="font-serif text-2xl font-medium">ReclaimLA.org</div>

						<div className="flex place-self-center text-sm text-zinc-500 ml-3">© 2024 ReclaimLA.org</div>
					</Link>

					<div className="horizontal gap-5 font-medium items-center">
						<Link href="/about">About</Link>
						<Link href="/contact">Contact</Link>
						<Link href="/privacy">Privacy</Link>
						<Link href="/login">Login</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Footer;
