import { NextResponse } from 'next/server';
import Prelude from "@prelude.so/sdk";

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();
    
    const client = new Prelude({
      apiToken: process.env.PRELUDE_API_KEY,
    });

    const verification = await client.verification.create({
      target: {
        type: "phone_number",
        value: phoneNumber,
      },
    });

    return NextResponse.json({ verificationId: verification.id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 400 }
    );
  }
} 