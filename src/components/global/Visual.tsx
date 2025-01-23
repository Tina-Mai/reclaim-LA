import { PhoneCall, FileSpreadsheet } from "lucide-react";

const Visual = () => {
	return (
		<div className="vertical sm:horizontal gap-7 items-center">
			<div className="vertical gap-3 items-center w-40">
				<div className="bg-theme-orange rounded-full p-4">
					<PhoneCall />
				</div>
				<div className="text-sm text-zinc-500 text-center">10 minute phone call with the Reclaim AI</div>
			</div>
			<div className="hidden sm:flex h-[2px] w-24 border-b-2 border-dotted border-zinc-400" />
			<div className="flex sm:hidden w-[2px] h-12 border-r-2 border-dotted border-zinc-400" />
			<div className="vertical gap-3 items-center w-40">
				<div className="bg-theme-orange rounded-full p-4">
					<FileSpreadsheet />
				</div>
				<div className="text-sm text-zinc-500 text-center">Cataloged losses ready for insurance claims</div>
			</div>
		</div>
	);
};

export default Visual;
