import { NextRequest, NextResponse } from 'next/server';
import { generateCampaignContentWithGroq } from '@/lib/groq-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      category,
      tone = 'casual',
      language = 'English'
    } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Campaign generation request:', {
      prompt,
      category,
      tone,
      language
    });

    // Generate campaign content using Groq
    const campaignContent = await generateCampaignContentWithGroq(
      prompt,
      category,
      tone,
      language
    );

    return NextResponse.json({
      success: true,
      ...campaignContent,
      provider: 'groq'
    });
    
  } catch (error) {
    console.error('Campaign generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate campaign content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
