"use client";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InventoryItem {
	itemName: string;
	price: number;
	color: string;
	brand: string;
	room: string;
	description: string;
}

interface InventoryProps {
	inventoryItems: InventoryItem[];
}

const Inventory = ({ inventoryItems }: InventoryProps) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [activeTab, setActiveTab] = useState<"all" | "room">("all");
	// Get unique rooms for the dropdown, filtering out empty strings
	const uniqueRooms = Array.from(new Set(inventoryItems.map((item) => item.room)))
		.filter((room) => room.trim() !== "")
		.sort();
	const defaultRoom = uniqueRooms.find((room) => room.toLowerCase().includes("bedroom")) || uniqueRooms[0] || "";
	const [selectedRoom, setSelectedRoom] = useState<string>(defaultRoom);
	const totalValue = inventoryItems.reduce((sum, item) => sum + (item.price === -1 ? 0 : item.price), 0);

	// Filter items based on search term and room selection
	const filteredItems = inventoryItems.filter((item) => {
		const searchLower = searchTerm.toLowerCase();
		const matchesSearch =
			item.itemName.toLowerCase().includes(searchLower) ||
			item.room.toLowerCase().includes(searchLower) ||
			item.brand.toLowerCase().includes(searchLower) ||
			item.color.toLowerCase().includes(searchLower) ||
			(item.description && item.description.toLowerCase().includes(searchLower));

		const matchesRoom = activeTab === "all" || item.room === selectedRoom;

		return matchesSearch && matchesRoom;
	});

	// Sort items by value (price)
	const sortedItems = [...filteredItems].sort((a, b) => {
		// Handle cases where price is -1 (N/A)
		if (a.price === -1) return 1;
		if (b.price === -1) return -1;
		return b.price - a.price; // Sort in descending order
	});

	const downloadCSV = () => {
		// Define CSV headers
		const headers = ["Item Name", "Room", "Brand", "Color", "Value", "Description"];

		// Convert items to CSV rows
		const csvRows = sortedItems.map((item) => [
			`"${item.itemName}"`,
			`"${item.room}"`,
			`"${item.brand}"`,
			`"${item.color}"`,
			item.price === -1 ? "N/A" : `$${item.price.toFixed(2)}`,
			`"${item.description || ""}"`,
		]);

		// Combine headers and rows
		const csvContent = [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");

		// Create and trigger download
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", `inventory-${new Date().toISOString().split("T")[0]}.csv`);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<>
			{/* Tabs */}
			<div className="border-b mb-6">
				<div className="flex space-x-8">
					<button
						className={`px-1 py-4 text-sm font-medium border-b-2 ${activeTab === "all" ? "text-zinc-900 border-zinc-900" : "text-zinc-500 border-transparent hover:text-zinc-700"}`}
						onClick={() => setActiveTab("all")}
					>
						All Items
					</button>
					<button
						className={`px-1 py-4 text-sm font-medium border-b-2 ${activeTab === "room" ? "text-zinc-900 border-zinc-900" : "text-zinc-500 border-transparent hover:text-zinc-700"}`}
						onClick={() => setActiveTab("room")}
					>
						By Room
					</button>
				</div>
			</div>

			{/* Search and filters */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-4">
					<div className="relative flex items-center w-96 h-full">
						<Search className="size-4 text-zinc-400 absolute ml-3" />
						<input
							type="text"
							placeholder="Search items..."
							className="pl-10 pr-4 py-2.5 w-full border rounded-lg text-sm outline-none ring-0"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					{activeTab === "room" && (
						<Select value={selectedRoom} onValueChange={setSelectedRoom}>
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Select a room" />
							</SelectTrigger>
							<SelectContent>
								{uniqueRooms.map((room) => (
									<SelectItem key={room} value={room}>
										{room}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>
				<Button className="gap-2" onClick={downloadCSV}>
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
						{sortedItems.map((item, index) => (
							<tr key={`${item.itemName}-${index}`}>
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
	);
};

export default Inventory;
