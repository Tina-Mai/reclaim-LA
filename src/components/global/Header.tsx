"use client";

import Link from "next/link";
import Logo from "@/components/global/Logo";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface MobileMenuItemProps {
	href: string;
	index: number;
	children: React.ReactNode;
	className?: string;
}

const MobileMenuItem = ({ href, index, children, className = "block p-1 hover:bg-zinc-100 rounded-lg text-center" }: MobileMenuItemProps) => {
	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, x: -20 },
				visible: (i) => ({
					opacity: 1,
					x: 0,
					transition: {
						delay: i * 0.1,
						type: "spring",
						stiffness: 260,
						damping: 20,
					},
				}),
			}}
			initial="hidden"
			animate="visible"
			custom={index}
		>
			<Link href={href} className={className}>
				{children}
			</Link>
		</motion.div>
	);
};

const Header = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<motion.div initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="fixed top-0 left-0 p-3 sm:p-5 w-full justify-center z-50">
			<motion.div layout className="horizontal place-self-center justify-between items-center p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-md w-full max-w-screen-sm">
				<Link href="/" className="horizontal items-center gap-3 px-3 hover:opacity-70 transition-opacity duration-300">
					<Logo />
					<div className="text-2xl font-serif font-medium">ReclaimLA.org</div>
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden sm:flex horizontal gap-5 text-zinc-500 font-medium items-center">
					<Link href="/about" className="hover:opacity-70 transition-opacity duration-300">
						About
					</Link>
					<Link href="/contact" className="hover:opacity-70 transition-opacity duration-300">
						Contact
					</Link>
					<Button>Get Started</Button>
					{/* <Link href="/login" className="bg-zinc-800 rounded-full px-4 py-2 text-white">
							Get Started
						</Link> */}
				</div>

				{/* Mobile Menu Button */}
				<motion.button className="sm:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} whileTap={{ scale: 0.9 }} aria-label="Toggle menu">
					<motion.svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
						transition={{ type: "spring", stiffness: 260, damping: 20 }}
					>
						{isMobileMenuOpen ? (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						) : (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						)}
					</motion.svg>
				</motion.button>
			</motion.div>

			{/* Mobile Navigation Menu */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ type: "spring", stiffness: 300, damping: 25 }}
						className="sm:hidden absolute top-full left-0 right-0 mt-2 mx-3 p-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg"
					>
						<nav className="flex flex-col gap-2 text-zinc-500 font-medium">
							<MobileMenuItem href="/about" index={0}>
								About
							</MobileMenuItem>
							<MobileMenuItem href="/contact" index={1}>
								Contact
							</MobileMenuItem>
							<MobileMenuItem href="/login" index={2}>
								<Button className="w-full">Get Started</Button>
							</MobileMenuItem>
						</nav>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default Header;
