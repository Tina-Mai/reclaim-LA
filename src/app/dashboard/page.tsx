"use client";

import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Inventory from "@/components/dashboard/Inventory";
import CallHistory from "@/components/dashboard/CallHistory";
import Sidebar from "@/components/dashboard/Sidebar";

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

	return (
		<div className="flex h-screen">
			<Sidebar userPhone={userData.phone} currentPage={currentPage} onPageChange={setCurrentPage} />

			{/* Main content */}
			<main className="flex-1 overflow-auto">
				<div className="p-8">
					<h1 className="text-3xl font-semibold mb-6">{currentPage === "inventory" ? "Inventory" : "Call History"}</h1>
					{currentPage === "inventory" ? <Inventory inventoryItems={inventoryItems} /> : <CallHistory callHistory={callHistory} />}
				</div>
			</main>
		</div>
	);
};

export default Dashboard;
