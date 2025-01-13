import Link from "next/link";

const Footer = () => {
	return (
		<div className="w-full bg-zinc-900 rounded-t-[2rem] mt-14">
			<div className="horizontal justify-between items-center p-10 py-14">
				<div className="font-serif text-4xl text-white font-medium">ReclaimLA.org</div>
				<div className="horizontal gap-5 text-white font-medium items-center">
					<Link href="/">Home</Link>
					<Link href="/about">About</Link>
					<Link href="/contact">Contact</Link>
					<Link href="/login" className="bg-theme-orange rounded-full px-4 py-2 text-zinc-800">
						Get Started
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Footer;
