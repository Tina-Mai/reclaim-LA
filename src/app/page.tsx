import Image from "next/image";
import Header from "@/components/global/Header";

export default function Home() {
	return (
		<main>
			<div className="vertical min-h-[calc(100dvh)] justify-center items-center p-5">
				<Header />
				<div className="h-[calc(15dvh)]" />
				<div className="flex flex-col gap-10 max-w-screen-sm min-h-[calc(35dvh)] justify-center items-center">
					<h1 className="text-center text-6xl font-serif font-medium">Reclaim what you can from the LA fires</h1>
					<div className="text-center text-lg text-zinc-500">
						Helping LA residents who lost their homes in the recent fires automatically find and catalog lost possessions for insurance claims
					</div>
					<div></div>
				</div>
				<div className="px-5 w-full">
					<Image src="/landscape.png" alt="Landscape" width={0} height={0} sizes="100vw" className="w-full h-auto rounded-[2rem]" priority />
				</div>
			</div>
		</main>
	);
}
