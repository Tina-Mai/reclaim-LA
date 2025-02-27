import { NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = 'mixtral-8x7b-32768';

const ENRICHMENT_PROMPT = `For the selected text below, provide 1-2 key facts that enhance understanding.

Text to enrich: {text}

Format your response exactly like this:
* [First key fact in under 15 words]
* [Optional second key fact in under 15 words]

Requirements:
- Provide 1-2 bullet points with asterisk (*)
- Each bullet point must be under 15 words
- Total response must be under 30 words
- No additional formatting or explanations`;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a concise enrichment assistant. Provide essential facts in bullet points. Keep responses under 30 words total. Format exactly as specified.'
          },
          {
            role: 'user',
            content: ENRICHMENT_PROMPT.replace('{text}', text)
          }
        ],
        temperature: 0.2,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }

    const data = await response.json();
    const enrichedContent = data.choices[0].message.content;

    return NextResponse.json({ enrichedContent });
  } catch (error) {
    console.error('Enrichment error:', error);
    return NextResponse.json(
      { error: 'Failed to enrich text' },
      { status: 500 }
    );
  }
} 