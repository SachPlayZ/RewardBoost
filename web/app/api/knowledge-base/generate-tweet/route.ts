import { NextRequest, NextResponse } from 'next/server';
import { generateTweet, generateMultipleTweets, createTwitterIntentLink } from '@/lib/rivalz-client';
import { generateTweetWithGroq, generateMultipleTweetsWithGroq, testGroqConnection } from '@/lib/groq-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      knowledgeBaseId,
      knowledgeBaseText,
      campaignGoal,
      campaignDetails,
      hashtags = [],
      accountsToMention = [],
      tone,
      language = 'English',
      existingContent,
      provider = 'groq' // Default to groq as fallback
    } = body;
    
    if (!campaignGoal) {
      return NextResponse.json(
        { error: 'Campaign goal is required' },
        { status: 400 }
      );
    }
    
    if (!campaignDetails) {
      return NextResponse.json(
        { error: 'Campaign details are required' },
        { status: 400 }
      );
    }

    // Check if we have either knowledgeBaseId (Rivalz) or knowledgeBaseText (Groq)
    if (!knowledgeBaseId && !knowledgeBaseText) {
      return NextResponse.json(
        { error: 'Either knowledge base ID or knowledge base text is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Tweet generation request:', {
      provider,
      hasKnowledgeBaseId: !!knowledgeBaseId,
      hasKnowledgeBaseText: !!knowledgeBaseText,
      campaignGoal,
      language,
      accountsToMention,
      hasExistingContent: !!existingContent,
      existingContentLength: existingContent?.length || 0
    });

    // Route to appropriate provider - always generate exactly 1 tweet
    if (provider === 'groq' && knowledgeBaseText) {
      // Use Groq with manual text knowledge base
      const tweet = await generateTweetWithGroq(
        knowledgeBaseText,
        campaignGoal,
        campaignDetails,
        hashtags,
        tone,
        language,
        accountsToMention,
        existingContent
      );

      const twitterLink = createTwitterIntentLink(tweet, hashtags);

      return NextResponse.json({
        success: true,
        tweet,
        twitterLink,
        provider: 'groq'
      });
    } else if (provider === 'rivalz' && knowledgeBaseId) {
      // Use Rivalz with PDF knowledge base
      const tweet = await generateTweet(
        knowledgeBaseId,
        campaignGoal,
        campaignDetails,
        hashtags,
        tone,
        language,
        accountsToMention,
        existingContent
      );

      const twitterLink = createTwitterIntentLink(tweet, hashtags);

      return NextResponse.json({
        success: true,
        tweet,
        twitterLink,
        provider: 'rivalz'
      });
    } else {
      return NextResponse.json(
        {
          error: 'Invalid provider configuration',
          details: `Provider ${provider} requires ${provider === 'groq' ? 'knowledgeBaseText' : 'knowledgeBaseId'}`
        },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Tweet generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate tweet',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Add a GET endpoint to test Groq connection
export async function GET(request: NextRequest) {
  try {
    const groqTest = await testGroqConnection();
    
    return NextResponse.json({
      success: true,
      groq: groqTest,
      message: 'Tweet generation service status'
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to test services',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
