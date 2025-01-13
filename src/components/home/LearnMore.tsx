import { ArrowDownIcon } from "lucide-react";

const LearnMore = () => {
	return (
		<button className="fixed bottom-10 left-1/2 -translate-x-1/2 flex w-fit text-center text-md bg-white/80 backdrop-blur-sm shadow-md rounded-full px-3 py-1.5 items-center gap-2">
			<div>Learn More</div>
			<ArrowDownIcon className="size-4 text-zinc-500" />
		</button>
	);
};

export default LearnMore;
