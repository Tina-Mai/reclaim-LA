"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface UserData {
	id: number;
	phone: string;
	csv_content: string;
	created_at: string;
}

interface CallHistoryItem {
	id: number;
	phone: string;
	created_at: string;
}

interface UserContextType {
	userData: UserData | null;
	callHistory: CallHistoryItem[];
	isLoading: boolean;
	error: string | null;
	fetchUserData: (phone: string) => Promise<void>;
	clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
	const [userData, setUserData] = useState<UserData | null>(null);
	const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Check for existing session on mount
	useEffect(() => {
		const checkSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session?.user?.phone) {
				fetchUserData(session.user.phone);
			}
		};
		checkSession();
	}, []);

	const fetchUserData = async (phone: string) => {
		console.log("\n--- UserContext: fetchUserData Start ---");
		console.log("Input phone number:", phone);
		setIsLoading(true);
		setError(null);

		try {
			// Ensure phone number has + prefix
			const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
			console.log("Formatted phone number for query:", formattedPhone);

			// Get all rows for this phone number, ordered by creation date
			const { data, error } = await supabase.from("phone_csvs").select("*").eq("phone", formattedPhone).order("created_at", { ascending: false });

			if (error) {
				console.error("Error fetching user data:", error);
				throw error;
			}

			if (data && data.length > 0) {
				// Store call history
				setCallHistory(
					data.map((item) => ({
						id: item.id,
						phone: item.phone,
						created_at: item.created_at,
					}))
				);

				// Combine CSV content from all rows, keeping the header only from the first row
				const combinedCsvContent = data.reduce((acc, row, index) => {
					if (!row.csv_content) return acc;

					const lines = row.csv_content.split("\n");
					// For the first row, include the header
					if (index === 0) return lines.join("\n");
					// For subsequent rows, skip the header
					return acc + "\n" + lines.slice(1).join("\n");
				}, "");

				const mostRecentData = {
					...data[0],
					csv_content: combinedCsvContent,
				};

				setUserData(mostRecentData);
				console.log("UserData state updated successfully");
			} else {
				// This is a new user - set minimal user data
				console.log("No existing data found - new user");
				setUserData({
					id: 0, // Placeholder ID for new user
					phone: formattedPhone,
					csv_content: "",
					created_at: new Date().toISOString(),
				});
				setCallHistory([]);
			}
		} catch (err) {
			console.error("Error in fetchUserData:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch user data");
			setUserData(null);
			setCallHistory([]);
		} finally {
			setIsLoading(false);
			console.log("--- UserContext: fetchUserData End ---\n");
		}
	};

	const clearUserData = () => {
		console.log("UserContext: Clearing user data");
		setUserData(null);
		setCallHistory([]);
		setError(null);
	};

	return (
		<UserContext.Provider
			value={{
				userData,
				callHistory,
				isLoading,
				error,
				fetchUserData,
				clearUserData,
			}}
		>
			{children}
		</UserContext.Provider>
	);
}

export function useUser() {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
}
