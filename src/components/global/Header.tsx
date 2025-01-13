import Link from "next/link";

const Header = () => {
	return (
		<div className="fixed top-0 left-0 p-5 w-full justify-center">
			<div className="horizontal place-self-center justify-between items-center p-3 bg-white rounded-full shadow-md w-full max-w-screen-sm">
				<div className="text-2xl font-serif font-medium px-3">ReclaimLA.org</div>
				<div className="horizontal gap-5 text-zinc-500 font-medium items-center">
					<Link href="/">Home</Link>
					<Link href="/about">About</Link>
					<Link href="/login" className="bg-zinc-800 rounded-full px-3 py-1.5 text-white">
						Get Started
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Header;
