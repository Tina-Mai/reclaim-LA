import { Search } from "lucide-react";
import FullLogo from "@/components/global/LogoFull";
import { Settings, HelpCircle, Home, History, PackageOpen } from "lucide-react";

const Dashboard = () => {
	return (
		<div className="flex h-screen">
			{/* Sidebar */}
			<aside className="w-64 bg-white border-r">
				<div className="p-4">
					<div className="flex items-center space-x-2 mb-8 mt-2">
						<FullLogo />
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
						<a href="#" className="flex items-center px-3 py-2 text-zinc-600 bg-zinc-100 rounded-lg gap-2">
							<Home className="size-4 text-zinc-500" />
							Home
						</a>
						<a href="#" className="flex items-center px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg gap-2">
							<History className="size-4 text-zinc-500" />
							Call History
						</a>
						<a href="#" className="flex items-center px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg gap-2">
							<PackageOpen className="size-4 text-zinc-500" />
							Inventory
						</a>
					</nav>
				</div>

				{/* Bottom sidebar items */}
				<div className="absolute bottom-0 w-64 border-t text-sm">
					<div className="p-4 space-y-1">
						<a href="#" className="flex items-center px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg gap-2">
							<Settings className="size-4 text-zinc-500" />
							Settings
						</a>
						<a href="#" className="flex items-center px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg gap-2">
							<HelpCircle className="size-4 text-zinc-500" />
							Help
						</a>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<main className="flex-1 overflow-auto">
				<div className="p-8">
					<h1 className="text-3xl font-semibold mb-6">Expenses</h1>

					{/* Tabs */}
					<div className="border-b mb-6">
						<div className="flex space-x-8">
							<button className="px-1 py-4 text-sm font-medium text-zinc-900 border-b-2 border-zinc-900">All</button>
							<button className="px-1 py-4 text-sm font-medium text-zinc-500 hover:text-zinc-700">Reimbursements</button>
						</div>
					</div>

					{/* Search and filters */}
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center w-96">
							<Search className="h-4 w-4 text-zinc-400 absolute ml-3" />
							<input type="text" placeholder="Search or add filter..." className="pl-10 pr-4 py-2 w-full border rounded-lg" />
						</div>
						<div className="flex items-center space-x-2">
							<button className="p-2 border rounded-lg">
								<span className="sr-only">Calendar</span>
								📅
							</button>
							<button className="p-2 border rounded-lg">
								<span className="sr-only">Filter</span>
								🔍
							</button>
							<button className="p-2 border rounded-lg">
								<span className="sr-only">Download</span>
								⬇️
							</button>
						</div>
					</div>

					{/* Expenses table */}
					<div className="bg-white rounded-lg border">
						<table className="min-w-full divide-y divide-zinc-200">
							<thead>
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
										<input type="checkbox" className="rounded border-zinc-300" />
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Merchant</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Transaction date</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Payment type</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Amount</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-zinc-200">
								<tr>
									<td className="px-6 py-4 whitespace-nowrap">
										<input type="checkbox" className="rounded border-zinc-300" />
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800">AA</div>
											<div className="ml-4">
												<div className="text-sm font-medium text-zinc-900">American Airlines</div>
												<div className="text-sm text-green-600">Paid</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">Nov 9, 2024</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">Reimbursement</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div>
											<div className="text-sm text-green-600">Paid</div>
											<div className="text-xs text-zinc-500">Tina's account x-2863</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm text-zinc-900">$294.52</td>
								</tr>
							</tbody>
						</table>
						<div className="px-6 py-4 border-t">
							<div className="text-sm text-zinc-700">1&ndash;2 of 2 items &middot; $542.47</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
