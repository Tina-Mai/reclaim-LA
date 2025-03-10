"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "./UserContext";

type AuthStep = "phoneInput" | "sendingCode" | "codeInput" | "verifyingCode";

interface User {
	id: string;
	phone: string;
	// Add other user fields as needed
}

interface AuthContextType {
	user: User | null;
	authStep: AuthStep;
	phoneNumber: string;
	isLoading: boolean;
	error: string | null;
	setPhoneNumber: (phone: string) => void;
	startPhoneVerification: () => Promise<void>;
	verifyCode: (code: string) => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PHONE = "+16268182266";

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [authStep, setAuthStep] = useState<AuthStep>("phoneInput");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { fetchUserData, clearUserData } = useUser();

	// Initialize with demo user
	useEffect(() => {
		let mounted = true;
		console.log("Starting demo user initialization");

		const initializeDemoUser = async () => {
			try {
				console.log("Setting up demo user with phone:", DEMO_PHONE);
				const demoUser: User = {
					id: "demo-user-id",
					phone: DEMO_PHONE,
				};

				if (mounted) {
					setUser(demoUser);
					console.log("Fetching data for demo user");
					await fetchUserData(DEMO_PHONE);
					console.log("Demo user data fetched successfully");
				}
			} catch (err) {
				console.error("Error initializing demo user:", err);
				if (mounted) {
					setError(err instanceof Error ? err.message : "Failed to initialize demo user");
				}
			} finally {
				if (mounted) {
					console.log("Completing initialization, setting isLoading to false");
					setIsLoading(false);
				}
			}
		};

		initializeDemoUser();

		return () => {
			mounted = false;
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const startPhoneVerification = async () => {
		setIsLoading(true);
		setError(null);
		setAuthStep("sendingCode");

		try {
			const { error } = await supabase.auth.signInWithOtp({
				phone: phoneNumber,
			});

			if (error) throw error;
			setAuthStep("codeInput");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to send code");
			setAuthStep("phoneInput");
		} finally {
			setIsLoading(false);
		}
	};

	const verifyCode = async (code: string) => {
		setIsLoading(true);
		setError(null);
		setAuthStep("verifyingCode");

		try {
			const { data, error } = await supabase.auth.verifyOtp({
				phone: phoneNumber,
				token: code,
				type: "sms",
			});

			if (error) throw error;

			const userData = data.user as User;
			setUser(userData);

			// Fetch user data after successful authentication
			await fetchUserData(phoneNumber);

			// Reset states
			setPhoneNumber("");
			setAuthStep("phoneInput");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to verify code");
			setAuthStep("codeInput");
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		await supabase.auth.signOut();
		setUser(null);
		setAuthStep("phoneInput");
		setPhoneNumber("");
		setError(null);
		clearUserData();
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				authStep,
				phoneNumber,
				isLoading,
				error,
				setPhoneNumber,
				startPhoneVerification,
				verifyCode,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
