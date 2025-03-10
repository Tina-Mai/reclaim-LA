import Logo from "@/components/global/Logo";
import Link from "next/link";

const FullLogo = () => {
	return (
		<Link href="/" className="horizontal items-center gap-3 px-3 hover:opacity-70 transition-opacity duration-300">
			<Logo />
			<div className="text-2xl font-serif font-medium">ReclaimLA.org</div>
		</Link>
	);
};

export default FullLogo;
