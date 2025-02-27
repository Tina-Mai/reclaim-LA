import { NextResponse } from 'next/server';

const RESEARCHER_URL = process.env.RESEARCHER_URL || 'http://localhost:4000';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const response = await fetch(`${RESEARCHER_URL}/research`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to start research');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: 'Failed to start research' },
      { status: 500 }
    );
  }
} 