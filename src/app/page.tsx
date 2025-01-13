export default function Home() {
	return (
		<main className="relative">
			{/* Gradient Background */}
			<div
				className="absolute bottom-0 w-full h-screen bg-[radial-gradient(100%_100%_at_50%_150%,#FFE8E8_0%,#FFDDC7_25%,#FFC4AA_50%,#FF9F63_75%,transparent_100%)] 
				opacity-80"
			/>

			{/* Content */}
			<div className="relative">
				<div className="vertical min-h-[calc(100dvh)] justify-center items-center p-5">
					<div className="flex flex-col gap-10 max-w-screen-sm">
						<h1 className="text-center text-6xl font-serif font-medium">Reclaim what you can from the LA fires</h1>
						<div className="text-center text-lg">Helping LA residents who lost their homes in the recent fires automatically find and catalog lost possessions for insurance claims</div>
					</div>
				</div>
			</div>
		</main>
	);
}
