import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  
  const response = await fetch('https://api.prelude.dev/v2/verification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.PRELUDE_API_KEY}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  return NextResponse.json(data);
} 