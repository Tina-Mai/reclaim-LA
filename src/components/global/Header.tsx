"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const Header = () => {
	return (
		<div className="fixed top-0 left-0 p-5 w-full justify-center">
			<div className="horizontal place-self-center justify-between items-center p-3 bg-white/80 backdrop-blur-md rounded-full shadow-md w-full max-w-screen-sm">
				<Link href="/" className="horizontal items-center gap-3 px-3">
					<div className="relative">
						<div className="size-5 rounded-full bg-theme-orange" />
						<motion.div
							className="absolute inset-0 rounded-full bg-theme-orange"
							animate={{
								opacity: [0.4, 0],
								scale: [1, 1.8],
							}}
							transition={{
								duration: 2,
								ease: "easeInOut",
								repeat: Infinity,
								times: [0, 1],
								repeatDelay: 0.2,
							}}
						/>
					</div>
					<div className="text-2xl font-serif font-medium">ReclaimLA.org</div>
				</Link>
				<div className="horizontal gap-5 text-zinc-500 font-medium items-center">
					<Link href="/about">About</Link>
					<Link href="/contact">Contact</Link>
					<Link href="/login" className="bg-zinc-800 rounded-full px-4 py-2 text-white">
						Get Started
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Header;
