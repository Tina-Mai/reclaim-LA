"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PhoneDialog from "@/components/home/PhoneDialog";
import AboutDialog from "@/components/about/AboutDialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import FullLogo from "@/components/global/LogoFull";

interface MobileMenuItemProps {
	href: string;
	index: number;
	children: React.ReactNode;
	className?: string;
}

const MobileMenuItem = ({ href, index, children, className = "block p-1 hover:bg-zinc-100 rounded-md text-center" }: MobileMenuItemProps) => {
	return (
		<motion.div
			variants={{
				hidden: { opacity: 0, x: -20 },
				visible: (i) => ({
					opacity: 1,
					x: 0,
					transition: {
						delay: i * 0.15,
						type: "spring",
						stiffness: 100,
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
		<motion.div
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{
				type: "spring",
				stiffness: 70,
				damping: 20,
				duration: 0.8,
			}}
			className="fixed top-0 left-0 p-3 sm:p-5 w-full justify-center z-50"
		>
			<motion.div
				layout
				transition={{ duration: 0.4 }}
				className="horizontal place-self-center justify-between items-center p-2 bg-white/80 backdrop-blur-md rounded-xl shadow-md w-full max-w-screen-sm"
			>
				<FullLogo />

				{/* Desktop Navigation */}
				<div className="hidden sm:flex horizontal gap-5 text-zinc-500 font-medium items-center text-sm">
					<AboutDialog />
					<Link href="mailto:team@reclaimLA.org?subject=ReclaimLA.org" className="hover:opacity-70 transition-opacity duration-300">
						Contact
					</Link>
					<PhoneDialog className="hover:opacity-70 transition-opacity duration-300" />
					<Link href="/login" className={cn(buttonVariants(), "cursor-pointer")}>
						Log in
					</Link>
				</div>

				{/* Mobile Menu Button */}
				<motion.button className="sm:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} whileTap={{ scale: 0.9 }} aria-label="Toggle menu">
					<motion.svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
						transition={{ duration: 0.5, ease: "easeInOut" }}
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
						transition={{
							type: "spring",
							stiffness: 70,
							damping: 15,
							duration: 0.5,
						}}
						className="sm:hidden absolute top-full left-0 right-0 mt-2 mx-3 p-4 bg-white/95 backdrop-blur-md rounded-xl shadow-lg"
					>
						<nav className="flex flex-col gap-2 text-zinc-500 font-medium">
							<MobileMenuItem href="#" index={0}>
								<AboutDialog className="block w-full p-1 hover:bg-zinc-100 rounded-lg text-center" />
							</MobileMenuItem>
							<MobileMenuItem href="mailto:team@reclaimLA.org?subject=ReclaimLA.org" index={1}>
								Contact
							</MobileMenuItem>
							<MobileMenuItem href="#" index={2}>
								<PhoneDialog className="block w-full p-1 hover:bg-zinc-100 rounded-lg text-center" />
							</MobileMenuItem>
							<MobileMenuItem href="/login" index={3}>
								Log in
							</MobileMenuItem>
						</nav>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default Header;
