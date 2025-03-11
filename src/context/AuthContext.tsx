"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "./UserContext";
import { Session } from "@supabase/supabase-js";

type AuthStep = "phoneInput" | "sendingCode" | "codeInput" | "verifyingCode";

interface AuthContextType {
	session: Session | null;
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
	const [session, setSession] = useState<Session | null>(null);
	const [authStep, setAuthStep] = useState<AuthStep>("phoneInput");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { fetchUserData, clearUserData } = useUser();

	// Listen for auth state changes
	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			if (session?.user) {
				// If we have a session, fetch the user data
				const phone = session.user.phone ?? "";
				if (phone) {
					fetchUserData(phone);
				}
			}
			setIsLoading(false);
		});

		return () => {
			subscription.unsubscribe();
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

			if (error) {
				// Check for specific error types
				if (error.message.includes("20003")) {
					throw new Error("Phone authentication is not properly configured. Please check your Supabase Twilio settings or enable test mode.");
				}
				throw error;
			}
			setAuthStep("codeInput");
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to send code";
			console.error("Phone verification error:", errorMessage);
			setError(errorMessage);
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

			if (error) {
				if (error.message.includes("Invalid token")) {
					throw new Error("Invalid verification code. Please try again.");
				}
				throw error;
			}

			// If verification is successful, we'll get a session
			if (data.session) {
				setSession(data.session);
				// Fetch user data after successful authentication
				if (phoneNumber) {
					try {
						await fetchUserData(phoneNumber);
					} catch (err) {
						// Don't throw here - it's okay if no data exists yet
						console.log("No existing user data found - this is normal for new users");
					}
				}
				// Reset states
				setPhoneNumber("");
				setAuthStep("phoneInput");
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to verify code";
			console.error("Code verification error:", errorMessage);
			setError(errorMessage);
			setAuthStep("codeInput");
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			setError(error.message);
			return;
		}
		setSession(null);
		setAuthStep("phoneInput");
		setPhoneNumber("");
		setError(null);
		clearUserData();
	};

	return (
		<AuthContext.Provider
			value={{
				session,
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
