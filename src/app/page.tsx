"use client";

import Image from "next/image";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import PhoneInput from "@/components/home/PhoneInput";
import PhoneDialog from "@/components/home/PhoneDialog";

export default function Home() {
	return (
		<main>
			<div className="vertical min-h-[calc(100dvh)] justify-center items-center">
				<Header />
				<div className="vertical gap-8 sm:gap-10 max-w-screen-md justify-center items-center pt-28 md:pt-36 pb-12 px-5">
					<h1 className="text-center text-5xl sm:text-7xl font-serif font-medium">Helping you document lost items after the LA fires</h1>
					<div className="text-center sm:text-lg text-zinc-500">
						A voice companion to help you catalog lost belongings room by room, streamlining your home inventory for faster, easier insurance claims
					</div>

					<PhoneInput />

					<div className="vertical justify-center items-center text-center text-sm text-zinc-800 gap-2 opacity-50">
						<div>Built by students at</div>
						<Image src="/stanford-logo.png" alt="Logo" width={100} height={100} className="grayscale" />
					</div>
				</div>
				<div className="w-full relative -z-10 -mt-[27rem] md:-mt-96 h-[100vh] md:h-[90vh]">
					<div className="absolute w-full h-32 top-0 bg-gradient-to-b from-background to-transparent z-10"></div>
					<Image src="/neighborhood.png" alt="Los Angeles Neighborhood" width={0} height={0} sizes="100vw" className="w-full h-full object-cover rounded-[2rem]" priority />
				</div>
			</div>

			<div className="vertical justify-center items-center pt-12 p-5 gap-8">
				<div id="learn-more-target" className="font-serif text-center text-4xl w-full max-w-screen-sm font-medium">
					Weeks of remembering and creating a loss inventory reduced to minutes
				</div>

				<PhoneDialog size="lg" />
			</div>
			<Footer />
		</main>
	);
}
