import { HelpCircle, History, PackageOpen, User, LogOut } from "lucide-react";
import FullLogo from "@/components/global/LogoFull";
import PhoneDialog from "@/components/home/PhoneDialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
	userPhone: string;
	currentPage: "inventory" | "call-history";
	onPageChange: (page: "inventory" | "call-history") => void;
}

const Sidebar = ({ userPhone, currentPage, onPageChange }: SidebarProps) => {
	const { logout } = useAuth();
	const router = useRouter();

	const handleLogout = async () => {
		await logout();
		router.push("/");
	};

	return (
		<aside className="w-64 bg-white border-r">
			<div className="p-4">
				<div className="flex items-center space-x-2 mt-2">
					<FullLogo />
				</div>

				{/* User phone number */}
				<div className="flex items-center px-3 py-2 gap-3 font-semibold border border-zinc-200 rounded-lg my-5 text-sm">
					<User className="size-8 p-1.5 rounded-lg bg-theme-orange/30 items-center justify-center" strokeWidth={1.5} />
					{userPhone.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4")}
				</div>

				{/* Search */}
				{/* <div className="flex items-center space-x-2 px-3 py-2 bg-zinc-100 rounded-lg mb-4">
					<Search className="h-4 w-4 text-zinc-500" />
					<input type="text" placeholder="Search" className="bg-transparent border-none focus:outline-none text-sm w-full" />
					<div className="flex items-center space-x-1">
						<span className="text-xs text-zinc-500">⌘</span>
						<span className="text-xs text-zinc-500">K</span>
					</div>
				</div> */}

				{/* Navigation */}
				<nav className="vertical gap-1 text-sm">
					<button
						onClick={() => onPageChange("inventory")}
						className={`flex items-center px-3 py-2 text-zinc-600 rounded-lg gap-2 w-full text-left ${currentPage === "inventory" ? "bg-zinc-100" : "hover:bg-zinc-100"}`}
					>
						<PackageOpen className="size-4 text-zinc-500" />
						Inventory
					</button>
					<button
						onClick={() => onPageChange("call-history")}
						className={`flex items-center px-3 py-2 text-zinc-600 rounded-lg gap-2 w-full text-left ${currentPage === "call-history" ? "bg-zinc-100" : "hover:bg-zinc-100"}`}
					>
						<History className="size-4 text-zinc-500" />
						Call History
					</button>
				</nav>
				<div className="horizontal mt-8">
					<PhoneDialog type="button" size="default" buttonText="Start a new call" buttonClassName="w-full" />
				</div>
			</div>

			{/* Bottom sidebar items */}
			<div className="absolute bottom-0 w-64 border-t text-sm">
				<div className="p-4 space-y-1">
					<button onClick={handleLogout} className="flex items-center px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg gap-2 w-full text-left">
						<LogOut className="size-4 text-zinc-500" />
						Log out
					</button>
					<Link href="mailto:team@reclaimLA.org" className="flex items-center px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg gap-2">
						<HelpCircle className="size-4 text-zinc-500" />
						Help
					</Link>
				</div>
			</div>
		</aside>
	);
};

export default Sidebar;
