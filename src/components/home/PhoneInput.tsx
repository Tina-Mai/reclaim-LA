const PhoneInput = () => {
	return (
		<div className="horizontal p-2 items-center justify-between bg-white border border-zinc-200 rounded-full">
			<input type="tel" placeholder="Phone number" className="flex w-full mx-3 rounded-md !outline-none" />
			<button className="bg-zinc-800 rounded-full px-4 py-2 text-white whitespace-nowrap font-medium">Get Started</button>
		</div>
	);
};

export default PhoneInput;
