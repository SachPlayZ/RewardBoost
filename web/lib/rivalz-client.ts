import RivalzClient from 'rivalz-client';
import fs from 'fs';

// Initialize Rivalz client
function initializeRivalzClient() {
  const secretToken = process.env.RIVALZ_SECRET_TOKEN;
  
  if (!secretToken) {
    console.error('❌ RIVALZ_SECRET_TOKEN is not set in environment variables');
    throw new Error('RIVALZ_SECRET_TOKEN is not set in environment variables');
  }
  
  console.log('✅ Initializing Rivalz client with token:', secretToken.substring(0, 10) + '...');
  return new RivalzClient(secretToken);
}

// Helper function to retry operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isRetryableError = error && typeof error === 'object' && 
        ((error as any).status === 503 || (error as any).status === 502 || (error as any).status === 429);
      
      if (attempt === maxRetries || !isRetryableError) {
        throw error;
      }
      
      console.log(`⏳ Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5; // Exponential backoff
    }
  }
  
  throw new Error('All retry attempts failed');
}

// Create knowledge base from PDF file
export async function createKnowledgeBase(
  filePath: string, 
  knowledgeBaseName: string
): Promise<{ id: string; status: string }> {
  try {
    console.log('🧠 Creating knowledge base...');
    console.log('📁 File path:', filePath);
    console.log('📝 Knowledge base name:', knowledgeBaseName);
    console.log('📏 File size:', fs.existsSync(filePath) ? `${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB` : 'File not found');
    
    const client = initializeRivalzClient();
    
    console.log('📤 Calling Rivalz API with retry logic...');
    
    const knowledgeBase = await retryOperation(async () => {
      return await client.createRagKnowledgeBase(filePath, knowledgeBaseName);
    });
    
    console.log('✅ Knowledge base created successfully:', knowledgeBase);
    
    return {
      id: knowledgeBase.id,
      status: knowledgeBase.status || 'processing'
    };
  } catch (error) {
    console.error('❌ Error creating knowledge base:', error);
    
    // Log more detailed error information
    if (error && typeof error === 'object') {
      console.error('Error details:', {
        name: (error as any).name,
        message: (error as any).message,
        status: (error as any).status,
        response: (error as any).response?.data,
        config: (error as any).config ? {
          url: (error as any).config.url,
          method: (error as any).config.method,
          headers: (error as any).config.headers
        } : undefined
      });
    }
    
    throw new Error(`Failed to create knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Check knowledge base status
export async function getKnowledgeBaseStatus(knowledgeBaseId: string): Promise<{
  status: string;
  ready: boolean;
}> {
  try {
    const client = initializeRivalzClient();
    
    const knowledgeBase = await client.getKnowledgeBase(knowledgeBaseId);
    
    return {
      status: knowledgeBase.status,
      ready: knowledgeBase.status === 'ready'
    };
  } catch (error) {
    console.error('Error checking knowledge base status:', error);
    throw new Error('Failed to check knowledge base status');
  }
}

// Wait for knowledge base to be ready
export async function waitForKnowledgeBaseReady(
  knowledgeBaseId: string,
  maxWaitTime: number = 300000, // 5 minutes
  pollInterval: number = 5000 // 5 seconds
): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const status = await getKnowledgeBaseStatus(knowledgeBaseId);
      
      if (status.ready) {
        return true;
      }
      
      if (status.status === 'error') {
        throw new Error('Knowledge base processing failed');
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error('Error while waiting for knowledge base:', error);
      throw error;
    }
  }
  
  throw new Error('Knowledge base processing timed out');
}

// Generate tweet using knowledge base
export async function generateTweet(
  knowledgeBaseId: string,
  campaignGoal: string,
  campaignDetails: string,
  hashtags: string[],
  tone?: string,
  language?: string,
  accountsToMention?: string[],
  existingContent?: string
): Promise<string> {
  try {
    const client = initializeRivalzClient();
    
    // The perfect prompt as specified by the user
    let prompt = `You are a creative Web3 social media user. Your task is to write a **unique tweet** about **${campaignGoal}** using **{Knowledge Base}** and **${campaignDetails}**.

Each tweet must feel **human and natural**, not robotic, and must be different from others by varying tone, style, and structure.

Guidelines to follow for each tweet:

🎭 **Tone** → Randomly choose one: *excited, casual, professional, witty, curious, urgent, optimistic, bold, playful, futuristic.*

😀 **Emotions & Emojis** → Optionally add 0–3 emojis chosen from these sets:
🔥🚀✨ | 🌍💡💧 | 🎯💎📈 | 💬🤝⚡ | 💎👀🎉

🪄 **Opening Style (Hook)** → Start with one of the following at random:

* Bold statement
* Surprising fact/statistic
* Rhetorical or direct question
* Short story or scenario
* Benefit-driven opener
* Myth-busting claim
* FOMO/urgency trigger

📣 **Call-to-Action (Ending)** → Conclude with one at random:
"Join the waitlist" | "Retweet if you agree" | "Don't miss out" | "Be early" |
"Tag a friend" | "Check it out now" | "Try the demo" | "Spread the word"

🌀 **Structure Variability** →

* Randomly place the campaign link at the start, middle, or end.
* Mix sentence length (short punchy vs longer informative).
* Vary emoji count (0–3).`;

    // Add language requirement if specified
    if (language && language !== 'English') {
      prompt += `\n\n🌍 **Language**: Please write the tweet in ${language}.`;
    }

    // Add accounts to mention if specified
    if (accountsToMention && accountsToMention.length > 0) {
      prompt += `\n\n👥 **Accounts to Mention**: Please mention these accounts in the tweet: ${accountsToMention.map(account => `@${account}`).join(' ')}. Make sure to integrate the mentions naturally into the content.`;
    }

    // Add existing content for beautification if provided
    if (existingContent && existingContent.trim()) {
      prompt += `\n\n✨ **Existing Content to Improve**: "${existingContent.trim()}"\n\nPlease improve and beautify this existing content while keeping the core message intact. Make it more engaging, add appropriate emojis, and ensure it follows all the guidelines above.`;
    }

    prompt += `\n\n✅ **Final Requirements**:

* Tweet must be **under 280 characters**.
* Always include these hashtags: **${hashtags.map(tag => `#${tag}`).join(' ')}**.
* Each tweet must differ in at least 40% wording from previous ones (to avoid duplication).
* Must be engaging, authentic, and shareable.`;
    
    const conversation = await client.createChatSession(knowledgeBaseId, prompt);
    
    return conversation.answer;
  } catch (error) {
    console.error('Error generating tweet:', error);
    throw new Error('Failed to generate tweet');
  }
}

// Create Twitter intent link
export function createTwitterIntentLink(tweetText: string, hashtags?: string[]): string {
  let fullTweetText = tweetText;
  
  // Add hashtags if they're not already in the tweet
  if (hashtags && hashtags.length > 0) {
    const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');
    if (!tweetText.includes(hashtagString)) {
      fullTweetText = `${tweetText} ${hashtagString}`;
    }
  }
  
  const encodedText = encodeURIComponent(fullTweetText);
  return `https://twitter.com/intent/tweet?text=${encodedText}`;
}

// Generate multiple tweet variations
export async function generateMultipleTweets(
  knowledgeBaseId: string,
  campaignGoal: string,
  campaignDetails: string,
  hashtags: string[],
  count: number = 1,
  language?: string,
  accountsToMention?: string[],
  existingContent?: string
): Promise<{ tweet: string; twitterLink: string }[]> {
  // Always generate exactly 1 tweet
  const tweet = await generateTweet(
    knowledgeBaseId,
    campaignGoal,
    campaignDetails,
    hashtags,
    undefined, // tone
    language,
    accountsToMention,
    existingContent
  );

  const twitterLink = createTwitterIntentLink(tweet, hashtags);

  return [{ tweet, twitterLink }];
}
