"use client";

import { motion } from "framer-motion";

const Logo = () => {
	return (
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
	);
};

export default Logo;
