"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

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

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [authStep, setAuthStep] = useState<AuthStep>("phoneInput");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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

			setUser(data.user as User);
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
		setUser(null);
		setAuthStep("phoneInput");
		setPhoneNumber("");
		setError(null);
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
