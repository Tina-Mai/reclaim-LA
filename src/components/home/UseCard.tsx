import Image from "next/image";

const UseCard = ({ title, description, icon }: { title: string; description: string; icon: string }) => {
	return (
		<div className="vertical bg-white/80 backdrop-blur-md rounded-xl shadow-md p-4 gap-3 relative overflow-hidden group hover:shadow-lg transition-shadow flex-1 min-w-[250px] max-w-[300px]">
			<div className="horizontal items-center gap-2">
				<div className="relative">
					<Image src={`/apps/${icon}.png`} alt={title} width={30} height={30} className="border border-zinc-200/50 shadow-sm rounded-md" />
					<div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-[pulse-dot_1.5s_ease-in-out_infinite]" />
				</div>
				<div className="text-lg text-uppercase font-medium">{title}</div>
			</div>
			<div className="text-zinc-500 relative">
				{description}
				<div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[searching_2s_linear_infinite] group-hover:opacity-100 opacity-0 transition-opacity" />
			</div>
		</div>
	);
};

export default UseCard;
