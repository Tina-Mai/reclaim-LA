import Image from "next/image";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import UseCard from "@/components/home/UseCard";

export default function Home() {
	return (
		<main>
			{/* <ScrollButton /> */}
			<div className="vertical min-h-[calc(100dvh)] justify-center items-center">
				<Header />
				<div className="flex flex-col gap-10 max-w-screen-sm justify-center items-center pt-28 pb-12">
					<h1 className="text-center text-6xl sm:text-7xl font-serif font-medium">Reclaim what you can from the LA fires</h1>
					<div className="text-center text-lg text-zinc-500">
						Helping LA residents who lost their homes in the recent fires automatically find and catalog lost possessions for insurance claims
					</div>

					<div className="vertical justify-center items-center text-center text-sm text-zinc-800 gap-2 opacity-50">
						<div>Built by students at</div>
						<Image src="/stanford-logo.png" alt="Logo" width={100} height={100} className="grayscale" />
					</div>
				</div>
				<div className="horizontal gap-5 justify-center flex-wrap">
					<UseCard title="Email" description="Searching email for receipts and making an inventory…" icon="email" />
					<UseCard title="Photos" description="Identifying belongings and finding matching items online… " icon="photos" />
					<UseCard title="Amazon" description="Cataloging lost items from order history…" icon="amazon" />
				</div>
				<div className="w-full relative -z-10 -mt-96">
					<div className="absolute w-full h-32 top-0 bg-gradient-to-b from-background to-transparent z-10"></div>
					<Image src="/neighborhood.png" alt="Los Angeles Neighborhood" width={0} height={0} sizes="100vw" className="w-full h-auto rounded-[2rem]" priority />
				</div>
			</div>

			<div className="vertical justify-center items-center pt-12 p-5 gap-8">
				<div id="learn-more-target" className="font-serif text-center text-4xl w-full max-w-screen-sm font-medium">
					Weeks of gathering receipts and creating a loss inventory reduced to minutes
				</div>
				<button className="bg-zinc-800 text-white text-lg px-5 py-3 rounded-full">Get Started</button>
			</div>
			<Footer />
		</main>
	);
}
