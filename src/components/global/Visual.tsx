import { Phone, FileSpreadsheet } from "lucide-react";

const Visual = () => {
	return (
		<div className="horizontal gap-5">
			<div className="vertical gap-2 items-center w-48">
				<div className="bg-theme-orange rounded-full p-4">
					<Phone />
				</div>
				<div className="text-sm text-zinc-500 text-center">10 minute phone call with the Reclaim AI</div>
			</div>
			<div className="vertical gap-2 items-center w-48">
				<div className="bg-theme-orange rounded-full p-4">
					<FileSpreadsheet />
				</div>
				<div className="text-sm text-zinc-500 text-center">Cataloged losses ready for insurance claims</div>
			</div>
		</div>
	);
};

export default Visual;
