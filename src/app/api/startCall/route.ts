import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { phone_number } = await request.json();

		if (!phone_number) {
			return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
		}

		// Call Supabase Edge Function
		const response = await fetch("https://wlbgwlnszsnuhfmjgsxj.supabase.co/functions/v1/initiate_call", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ phone_number }),
		});

		if (!response.ok) {
			const error = await response.text();
			return NextResponse.json({ error: `Failed to initiate call: ${error}` }, { status: response.status });
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error initiating call:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
