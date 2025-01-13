import Image from "next/image";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import LearnMore from "@/components/home/LearnMore";

export default function Home() {
	return (
		<main>
			<LearnMore />
			<div className="vertical min-h-[calc(100dvh)] justify-center items-center p-5">
				<Header />
				<div className="flex flex-col gap-10 max-w-screen-sm justify-center items-center pt-28 pb-12">
					<h1 className="text-center text-7xl font-serif font-medium">Reclaim what you can from the LA fires</h1>
					<div className="text-center text-lg text-zinc-500">
						Helping LA residents who lost their homes in the recent fires automatically find and catalog lost possessions for insurance claims
					</div>

					<div className="vertical justify-center items-center text-center text-sm text-zinc-800 gap-2 opacity-50">
						<div>Built by students at</div>
						<Image src="/stanford-logo.png" alt="Logo" width={100} height={100} className="grayscale" />
					</div>
				</div>
				<div className="sm:px-5 w-full">
					<Image src="/landscape.png" alt="Landscape" width={0} height={0} sizes="100vw" className="w-full h-auto rounded-[2rem]" priority />
				</div>
			</div>

			<div className="vertical justify-center items-center p-10 pt-20">
				<div className="text-center text-3xl w-full max-w-screen-sm font-medium">Weeks of gathering receipts and creating a loss inventory reduced to minutes</div>
			</div>
			<Footer />
		</main>
	);
}
