import { PhoneCall, FileSpreadsheet } from "lucide-react";

const Visual = () => {
	return (
		<div className="vertical sm:horizontal gap-5 items-center">
			<div className="vertical gap-3 items-center w-40 animate-fade-in">
				<div className="bg-theme-orange rounded-full p-4">
					<PhoneCall />
				</div>
				<div className="text-sm text-zinc-500 text-center">10 minute phone call with the Reclaim AI</div>
			</div>
			<div className="hidden sm:flex items-center relative">
				<div className="h-[2px] w-32 border-b-2 border-dotted border-zinc-400 animate-flow-line" />
				<div
					className="absolute right-[-6px] w-0 h-0 ml-1 animate-flow-arrow"
					style={{
						borderTop: "6px solid transparent",
						borderBottom: "6px solid transparent",
						borderLeft: "8px solid rgb(161 161 170)",
					}}
				/>
			</div>
			<div className="flex sm:hidden items-center relative">
				<div className="w-[2px] h-12 border-l-2 border-dotted border-zinc-400 animate-flow-line-vertical" />
				<div
					className="absolute bottom-[-6px] left-[-5px] h-0 w-0 mt-1 animate-flow-arrow-vertical"
					style={{
						borderLeft: "6px solid transparent",
						borderRight: "6px solid transparent",
						borderTop: "8px solid rgb(161 161 170)",
					}}
				/>
			</div>
			<div className="vertical gap-3 items-center w-40 animate-fade-in-delayed">
				<div className="bg-theme-orange rounded-full p-4">
					<FileSpreadsheet />
				</div>
				<div className="text-sm text-zinc-500 text-center">Cataloged losses ready for insurance claims</div>
			</div>
		</div>
	);
};

export default Visual;
