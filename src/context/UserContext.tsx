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

interface PhoneCsvRecord {
	id: number;
	phone: string;
	csv_content: string;
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
			// Always add + prefix since that's how it's stored in the database
			const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
			console.log("Querying with formatted phone:", formattedPhone);

			// Use direct fetch since it's working
			const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/phone_csvs?phone=eq.${encodeURIComponent(formattedPhone)}&order=created_at.desc`, {
				headers: {
					apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
					Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = (await response.json()) as PhoneCsvRecord[];
			console.log("Query response:", {
				status: response.status,
				rowCount: data.length,
				data,
			});

			if (data && data.length > 0) {
				// Store call history
				setCallHistory(
					data.map((item: PhoneCsvRecord) => ({
						id: item.id,
						phone: item.phone,
						created_at: item.created_at,
					}))
				);

				// Combine CSV content from all rows, keeping the header only from the first row
				const combinedCsvContent = data.reduce((acc: string, row: PhoneCsvRecord, index: number) => {
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
				console.log("UserData state updated with combined CSV content");
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
