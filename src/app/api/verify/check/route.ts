import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { verificationId, code } = await request.json();

    const response = await fetch('https://api.ding.live/v1/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.PRELUDE_API_KEY || '',
      },
      body: JSON.stringify({
        customer_uuid: verificationId,
        authentication_uuid: verificationId,
        check_code: code
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Verification failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}