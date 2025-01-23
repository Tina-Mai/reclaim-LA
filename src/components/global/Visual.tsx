import { PhoneCall, FileSpreadsheet } from "lucide-react";

const Visual = () => {
	return (
		<div className="horizontal gap-5 justify-center items-center w-full max-w-lg">
			<div className="vertical gap-3 items-center max-w-40 animate-fade-in">
				<div className="bg-theme-orange rounded-full p-3 sm:p-4">
					<PhoneCall className="size-5 sm:size-6" />
				</div>
				<div className="text-sm text-zinc-500 text-center">10 minute phone call with the Reclaim AI</div>
			</div>
			<div className="block flex-1 relative">
				<div className="absolute inset-y-0 w-full flex items-center">
					<div className="h-[2px] w-full border-b-2 border-dotted border-zinc-400 animate-flow-line" />
					<div
						className="absolute right-[-6px] w-0 h-0 ml-1 animate-flow-arrow"
						style={{
							borderTop: "6px solid transparent",
							borderBottom: "6px solid transparent",
							borderLeft: "8px solid rgb(161 161 170)",
						}}
					/>
				</div>
			</div>
			<div className="vertical gap-3 items-center max-w-40 animate-fade-in-delayed">
				<div className="bg-theme-orange rounded-full p-3 sm:p-4 relative overflow-hidden">
					<div
						className="absolute inset-0 w-[200%] h-full -left-[50%] animate-shine"
						style={{
							background:
								"linear-gradient(45deg, transparent 0%, transparent 25%, rgba(255, 255, 255, 0.1) 35%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.1) 65%, transparent 75%, transparent 100%)",
						}}
					/>
					<FileSpreadsheet className="relative z-10 size-5 sm:size-6" />
				</div>
				<div className="text-sm text-zinc-500 text-center">Cataloged losses ready for insurance claims</div>
			</div>
		</div>
	);
};

export default Visual;
