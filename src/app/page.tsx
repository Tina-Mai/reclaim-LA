export default function Home() {
	return (
		<main>
			<nav className="absolute top-0 right-0 p-4">
				<div className="flex gap-4">
					<a href="/login" className="px-6 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
						Login
					</a>
				</div>
			</nav>

			<div className="vertical min-h-[calc(100dvh)] justify-center items-center p-5">
				<div className="flex flex-col gap-10 max-w-screen-sm">
					<h1 className="text-center text-6xl font-serif font-medium">Reclaim what you can from the LA fires</h1>
					<div className="text-center text-lg">Helping LA residents who lost their homes in the recent fires automatically find and catalog lost possessions for insurance claims</div>
					<div className="text-center">
						<a href="/signup" className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
							Get Started
						</a>
					</div>
				</div>
			</div>
		</main>
	);
}


//sk_wB6N6bEacuoGnGLstqShSW99nNZftJgE