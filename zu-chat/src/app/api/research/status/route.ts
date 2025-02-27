import { NextResponse } from 'next/server';

const RESEARCHER_URL = process.env.RESEARCHER_URL || 'http://localhost:4000';

export async function GET(req: Request) {
  try {
    const response = await fetch(`${RESEARCHER_URL}/status`, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to connect to status stream');
    }

    // Forward the SSE stream with proper headers
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': req.headers.get('origin') || 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Cache-Control, Last-Event-ID',
    });

    return new Response(response.body, { headers });
  } catch (error) {
    console.error('Status stream error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to status stream' },
      { status: 500 }
    );
  }
} 