import { NextResponse } from 'next/server';

const RESEARCHER_URL = process.env.RESEARCHER_URL || 'http://localhost:4000';

export async function GET(req: Request) {
  try {
    const response = await fetch(`${RESEARCHER_URL}/config`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get configuration');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Configuration error:', error);
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    const response = await fetch(`${RESEARCHER_URL}/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to update configuration');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Configuration error:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
} 