import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1),
  model: z.enum(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']).optional().default('gpt-3.5-turbo'),
  maxTokens: z.number().optional().default(150),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, model, maxTokens } = chatSchema.parse(body);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to get response from OpenAI' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      message: data.choices[0]?.message?.content || 'No response',
      usage: data.usage,
      model: data.model
    });

  } catch (error) {
    console.error('OpenAI route error:', error);
    return NextResponse.json(
      { error: 'Invalid request data' },
      { status: 400 }
    );
  }
}
