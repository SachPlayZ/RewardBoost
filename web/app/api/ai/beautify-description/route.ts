import { NextRequest, NextResponse } from 'next/server';
import { beautifyDescriptionWithGroq } from '@/lib/groq-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description } = body;
    
    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    console.log('✨ Beautifying description with Groq...');
    console.log('📝 Original description length:', description.length);

    // Beautify the description using Groq
    const beautifiedDescription = await beautifyDescriptionWithGroq(description);

    return NextResponse.json({
      success: true,
      beautifiedDescription,
      provider: 'groq'
    });
    
  } catch (error) {
    console.error('Description beautification error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to beautify description',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
