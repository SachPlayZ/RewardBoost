import { NextRequest, NextResponse } from 'next/server';
import { getKnowledgeBaseStatus } from '@/lib/rivalz-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const knowledgeBaseId = searchParams.get('id');
    
    if (!knowledgeBaseId) {
      return NextResponse.json(
        { error: 'Knowledge base ID is required' },
        { status: 400 }
      );
    }
    
    const status = await getKnowledgeBaseStatus(knowledgeBaseId);
    
    return NextResponse.json({
      success: true,
      knowledgeBaseId,
      status: status.status,
      ready: status.ready,
    });
    
  } catch (error) {
    console.error('Knowledge base status check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check knowledge base status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
