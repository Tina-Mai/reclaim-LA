"use client";

import { Search } from "lucide-react";
import FullLogo from "@/components/global/LogoFull";
import { Settings, HelpCircle, History, PackageOpen, Download, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhoneDialog from "@/components/home/PhoneDialog";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";

interface InventoryItem {
	itemName: string;
	price: number;
	color: string;
	brand: string;
	room: string;
	description: string;
}

type Page = "inventory" | "call-history";

const Dashboard = () => {
	const { userData, callHistory, isLoading: isUserDataLoading, error: userError } = useUser();
	const { isLoading: isAuthLoading, error: authError } = useAuth();
	const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
	const [currentPage, setCurrentPage] = useState<Page>("inventory");

	useEffect(() => {
		if (userData?.csv_content) {
			try {
				const lines = userData.csv_content.split("\n");
				const parsedItems = lines
					.slice(1)
					.map((line) => {
						const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
						const cleanValues = values.map((val) => val.replace(/^"|"$/g, "").trim());

						return {
							itemName: cleanValues[0] || "",
							price: parseFloat(cleanValues[1]) || 0,
							color: cleanValues[2] || "",
							brand: cleanValues[3] || "",
							room: cleanValues[4] || "",
							description: cleanValues[5] || "",
						};
					})
					.filter((item) => item.itemName);

				setInventoryItems(parsedItems);
			} catch (error) {
				console.error("CSV parsing error:", error);
				setInventoryItems([]);
			}
		} else {
			setInventoryItems([]);
		}
	}, [userData]);

	console.log("Dashboard: Render - Loading states:", { isUserDataLoading, isAuthLoading });
	console.log("Dashboard: Render - Errors:", { userError, authError });
	console.log("Dashboard: Render - Items count:", inventoryItems.length);

	// Show loading state if either auth or user data is loading
	if (isAuthLoading || isUserDataLoading) {
		return <div className="flex h-screen items-center justify-center">Loading...</div>;
	}

	// Show error state if there are any errors
	if (userError || authError) {
		return <div className="flex h-screen items-center justify-center text-red-600">Error: {userError || authError}</div>;
	}

	// Show empty state if no user data is available
	if (!userData) {
		return <div className="flex h-screen items-center justify-center">No data available</div>;
	}

	const totalValue = inventoryItems.reduce((sum, item) => sum + (item.price === -1 ? 0 : item.price), 0);

	// Sort items by value (price)
	const sortedItems = [...inventoryItems].sort((a, b) => {
		// Handle cases where price is -1 (N/A)
		if (a.price === -1) return 1;
		if (b.price === -1) return -1;
		return b.price - a.price; // Sort in descending order
	});

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="flex h-screen">
			{/* Sidebar */}
			<aside className="w-64 bg-white border-r">
				<div className="p-4">
					<div className="flex items-center space-x-2 mt-2">
						<FullLogo />
					</div>

					{/* User phone number */}
					<div className="flex items-center px-3 py-2 gap-3 font-semibold border border-zinc-200 rounded-lg my-5 text-sm">
						<User className="size-8 p-1.5 rounded bg-theme-orange/30 items-center justify-center" strokeWidth={1.5} />
						{userData.phone.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4")}
					</div>

					{/* Search */}
					<div className="flex items-center space-x-2 px-3 py-2 bg-zinc-100 rounded-lg mb-4">
						<Search className="h-4 w-4 text-zinc-500" />
						<input type="text" placeholder="Search" className="bg-transparent border-none focus:outline-none text-sm w-full" />
						<div className="flex items-center space-x-1">
							<span className="text-xs text-zinc-500">⌘</span>
							<span className="text-xs text-zinc-500">K</span>
						</div>
					</div>

					{/* Navigation */}
					<nav className="vertical gap-1 text-sm">
						<button
							onClick={() => setCurrentPage("inventory")}
							className={`flex items-center px-3 py-2 text-zinc-600 rounded-lg gap-2 w-full text-left ${currentPage === "inventory" ? "bg-zinc-100" : "hover:bg-zinc-100"}`}
						>
							<PackageOpen className="size-4 text-zinc-500" />
							Inventory
						</button>
						<button
							onClick={() => setCurrentPage("call-history")}
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
						<a href="#" className="flex items-center px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg gap-2">
							<Settings className="size-4 text-zinc-500" />
							Settings
						</a>
						<Link href="mailto:team@reclaimLA.org" className="flex items-center px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg gap-2">
							<HelpCircle className="size-4 text-zinc-500" />
							Help
						</Link>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<main className="flex-1 overflow-auto">
				<div className="p-8">
					<h1 className="text-3xl font-semibold mb-6">{currentPage === "inventory" ? "Inventory" : "Call History"}</h1>

					{currentPage === "inventory" ? (
						<>
							{/* Tabs */}
							<div className="border-b mb-6">
								<div className="flex space-x-8">
									<button className="px-1 py-4 text-sm font-medium text-zinc-900 border-b-2 border-zinc-900">All Items</button>
									<button className="px-1 py-4 text-sm font-medium text-zinc-500 hover:text-zinc-700">By Room</button>
								</div>
							</div>

							{/* Search and filters */}
							<div className="flex items-center justify-between mb-6">
								<div className="relative flex items-center w-96">
									<Search className="size-4 text-zinc-400 absolute ml-3" />
									<input type="text" placeholder="Search items..." className="pl-10 pr-4 py-2 w-full border rounded-lg" />
								</div>
								<Button className="gap-2">
									<Download className="size-4" />
									Download
								</Button>
							</div>

							{/* Inventory table */}
							<div className="bg-white rounded-lg border overflow-x-auto">
								<table className="min-w-full divide-y divide-zinc-200">
									<thead>
										<tr>
											<th className="w-12 px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
												<input type="checkbox" className="rounded border-zinc-300" />
											</th>
											<th className="w-1/3 px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Item Name</th>
											<th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Room</th>
											<th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Brand</th>
											<th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Color</th>
											<th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Value</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-zinc-200">
										{sortedItems.map((item) => (
											<tr key={item.itemName}>
												<td className="px-6 py-4">
													<input type="checkbox" className="rounded border-zinc-300" />
												</td>
												<td className="px-6 py-4">
													<div className="flex items-center">
														<div className="ml-0">
															<div className="text-sm font-medium text-zinc-900 break-words">{item.itemName}</div>
															{item.description && <div className="text-sm text-zinc-500 break-words">{item.description}</div>}
														</div>
													</div>
												</td>
												<td className="px-6 py-4 text-sm text-zinc-500 break-words">{item.room}</td>
												<td className="px-6 py-4 text-sm text-zinc-500 break-words">{item.brand}</td>
												<td className="px-6 py-4 text-sm text-zinc-500 break-words">{item.color}</td>
												<td className="px-6 py-4 text-sm text-zinc-900">{item.price === -1 ? "N/A" : `$${item.price.toFixed(2)}`}</td>
											</tr>
										))}
									</tbody>
								</table>
								<div className="px-6 py-4 border-t">
									<div className="text-sm text-zinc-700">
										{inventoryItems.length} items · Total Value: ${totalValue.toFixed(2)}
									</div>
								</div>
							</div>
						</>
					) : (
						<div className="bg-white rounded-lg border">
							<div className="divide-y divide-zinc-200">
								{callHistory.map((call) => (
									<div key={call.id} className="px-6 py-4">
										<div className="text-sm text-zinc-900">Call on {formatDate(call.created_at)}</div>
										<div className="text-sm text-zinc-500">Phone: {call.phone.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4")}</div>
									</div>
								))}
							</div>
							<div className="px-6 py-4 border-t">
								<div className="text-sm text-zinc-700">{callHistory.length} calls in total</div>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
