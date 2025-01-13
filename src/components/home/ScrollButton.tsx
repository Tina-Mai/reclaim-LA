"use client";

import { ArrowDownIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const ScrollButton = () => {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				// When target is visible, hide the button
				setIsVisible(!entry.isIntersecting);
			},
			{
				threshold: 0.1, // Show button when less than 10% of target is visible
			}
		);

		// Target the text element
		const target = document.querySelector("#learn-more-target");
		if (target) {
			observer.observe(target);
		}

		return () => {
			if (target) {
				observer.unobserve(target);
			}
		};
	}, []);

	const scrollToTarget = () => {
		const target = document.querySelector("#learn-more-target");
		target?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<div className="fixed bottom-10 left-0 right-0 flex justify-center">
					<motion.button
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						transition={{ duration: 0.2 }}
						onClick={scrollToTarget}
						className="flex w-fit text-center text-md bg-white/80 backdrop-blur-sm shadow-md rounded-full px-3 py-1.5 items-center gap-2 hover:bg-white/90 transition-colors"
					>
						<div>How it works</div>
						<ArrowDownIcon className="size-4 text-zinc-500" />
					</motion.button>
				</div>
			)}
		</AnimatePresence>
	);
};

export default ScrollButton;
