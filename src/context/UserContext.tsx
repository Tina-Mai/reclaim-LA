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

			// First try to get all matching rows to see what's available
			const { data: allMatches, error: searchError } = await supabase.from("phone_csvs").select("*").ilike("phone", `%${formattedPhone}%`);

			console.log("All matching rows:", allMatches);
			console.log("Search error if any:", searchError);
			console.log("Current phone search:", {
				searchPattern: `%${formattedPhone}%`,
				hasMatches: !!allMatches?.length,
				matchCount: allMatches?.length || 0,
			});

			if (searchError) {
				console.error("Search error:", searchError);
				throw searchError;
			}

			// Get all rows for this phone number, ordered by creation date
			const { data, error } = await supabase.from("phone_csvs").select("*").eq("phone", formattedPhone).order("created_at", { ascending: false });

			console.log("Query response:", {
				data,
				error,
				errorMessage: error?.message,
				errorCode: error?.code,
				details: error?.details,
				formattedPhone,
			});

			if (error) {
				console.error("Detailed error:", {
					message: error.message,
					code: error.code,
					details: error.details,
					hint: error.hint,
				});
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

				console.log("Found combined data:", {
					id: mostRecentData.id,
					phone: mostRecentData.phone,
					has_csv_content: Boolean(mostRecentData.csv_content),
					csv_length: mostRecentData.csv_content?.length,
					created_at: mostRecentData.created_at,
					first_line: mostRecentData.csv_content?.split("\n")[0],
				});

				if (!mostRecentData.csv_content) {
					console.warn("Found record but csv_content is empty");
					throw new Error("CSV content is empty");
				}

				setUserData(mostRecentData);
				console.log("UserData state updated successfully");
			} else {
				console.log("No data found");
				setUserData(null);
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
