"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface UserData {
	id: number;
	phone: string;
	csv_content: string;
	created_at: string;
}

interface UserContextType {
	userData: UserData | null;
	isLoading: boolean;
	error: string | null;
	fetchUserData: (phone: string) => Promise<void>;
	clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
	const [userData, setUserData] = useState<UserData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchUserData = async (phone: string) => {
		console.log("\n--- UserContext: fetchUserData Start ---");
		console.log("Input phone number:", phone);
		setIsLoading(true);
		// Don't clear userData here to prevent flashing of empty state
		setError(null);

		try {
			// First try to get all matching rows to see what's available
			const { data: allMatches, error: searchError } = await supabase.from("phone_csvs").select("*").ilike("phone", `%${phone}%`);

			console.log("All matching rows:", allMatches);

			if (searchError) {
				console.error("Search error:", searchError);
				throw searchError;
			}

			// Now try the exact query we want
			const { data, error } = await supabase.from("phone_csvs").select("*").eq("phone", phone).order("created_at", { ascending: false }).limit(1);

			console.log("Query response:", {
				data,
				error,
				errorMessage: error?.message,
				errorCode: error?.code,
				details: error?.details,
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
				const mostRecentData = data[0];
				console.log("Found data:", {
					id: mostRecentData.id,
					phone: mostRecentData.phone,
					has_csv_content: Boolean(mostRecentData.csv_content),
					csv_length: mostRecentData.csv_content?.length,
					created_at: mostRecentData.created_at,
					first_line: mostRecentData.csv_content?.split("\n")[0],
					raw_data: mostRecentData,
				});

				if (!mostRecentData.csv_content) {
					console.warn("Found record but csv_content is empty");
					// Don't set userData to null here, throw an error instead
					throw new Error("CSV content is empty");
				}

				setUserData(mostRecentData);
				console.log("UserData state updated successfully");
			} else {
				console.log("No data found");
				throw new Error("No data found for phone number");
			}
		} catch (err) {
			console.error("Error in fetchUserData:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch user data");
			// Only set userData to null if we're not already loading
			if (!isLoading) {
				setUserData(null);
			}
		} finally {
			setIsLoading(false);
			console.log("--- UserContext: fetchUserData End ---\n");
		}
	};

	const clearUserData = () => {
		console.log("UserContext: Clearing user data");
		setUserData(null);
		setError(null);
	};

	return (
		<UserContext.Provider
			value={{
				userData,
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
