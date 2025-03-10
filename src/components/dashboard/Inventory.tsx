import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

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
	const totalValue = inventoryItems.reduce((sum, item) => sum + (item.price === -1 ? 0 : item.price), 0);

	// Sort items by value (price)
	const sortedItems = [...inventoryItems].sort((a, b) => {
		// Handle cases where price is -1 (N/A)
		if (a.price === -1) return 1;
		if (b.price === -1) return -1;
		return b.price - a.price; // Sort in descending order
	});

	return (
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
