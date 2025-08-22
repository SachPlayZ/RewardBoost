import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const VerifyFollowSchema = z.object({
  userWallet: z.string().min(1),
  targetUsername: z.string().min(1),
});

const VerifyPostSchema = z.object({
  userWallet: z.string().min(1),
  postUrl: z.string().url(),
  requiredHashtags: z.array(z.string()).default([]),
  requiredMentions: z.array(z.string()).default([]),
});

// Helper function to refresh Twitter access token
async function refreshTwitterToken(userWallet: string) {
  const twitterAuth = await prisma.twitterAuth.findUnique({
    where: { userWallet: userWallet.toLowerCase() },
  });

  if (!twitterAuth || !twitterAuth.refreshToken) {
    throw new Error("No refresh token available");
  }

  const twitterClient = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID!,
    clientSecret: process.env.TWITTER_CLIENT_SECRET!,
  });

  try {
    const {
      accessToken,
      refreshToken,
      expiresIn,
    } = await twitterClient.refreshOAuth2Token(twitterAuth.refreshToken);

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (expiresIn || 7200));

    await prisma.twitterAuth.update({
      where: { userWallet: userWallet.toLowerCase() },
      data: {
        accessToken,
        refreshToken,
        expiresAt,
        updatedAt: new Date(),
      },
    });

    return accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw new Error("Failed to refresh Twitter access token");
  }
}

// Helper function to get valid Twitter client
async function getTwitterUserClient(userWallet: string) {
  const twitterAuth = await prisma.twitterAuth.findUnique({
    where: { userWallet: userWallet.toLowerCase() },
  });

  if (!twitterAuth || !twitterAuth.accessToken) {
    throw new Error("User not authenticated with Twitter");
  }

  // Check if token is expired and refresh if needed
  if (twitterAuth.expiresAt && twitterAuth.expiresAt < new Date()) {
    if (twitterAuth.refreshToken) {
      const newAccessToken = await refreshTwitterToken(userWallet);
      return new TwitterApi(newAccessToken);
    } else {
      throw new Error("Twitter access token expired and no refresh token available");
    }
  }

  return new TwitterApi(twitterAuth.accessToken);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...data } = body;

    switch (type) {
      case "verify_follow":
        return await verifyFollow(VerifyFollowSchema.parse(data));
      case "verify_post":
        return await verifyPost(VerifyPostSchema.parse(data));
      default:
        return NextResponse.json(
          { error: "Invalid verification type" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Twitter verification error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Twitter verification failed" },
      { status: 500 }
    );
  }
}

async function verifyFollow(data: z.infer<typeof VerifyFollowSchema>) {
  try {
    const userClient = await getTwitterUserClient(data.userWallet);

    // Get target user ID
    const targetUser = await userClient.v2.userByUsername(data.targetUsername);
    if (!targetUser.data) {
      return NextResponse.json({
        success: false,
        error: "Target user not found",
      });
    }

    // Get user's following list
    const following = await userClient.v2.following(data.userWallet, {
      max_results: 1000,
    });

    const isFollowing = following.data.some(user => user.id === targetUser.data.id);

    return NextResponse.json({
      success: true,
      verified: isFollowing,
      targetUser: {
        id: targetUser.data.id,
        username: targetUser.data.username,
        name: targetUser.data.name,
      },
    });

  } catch (error) {
    console.error("Follow verification error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to verify follow relationship",
    });
  }
}

async function verifyPost(data: z.infer<typeof VerifyPostSchema>) {
  try {
    const userClient = await getTwitterUserClient(data.userWallet);

    // Extract tweet ID from URL
    const tweetId = extractTweetId(data.postUrl);
    if (!tweetId) {
      return NextResponse.json({
        success: false,
        error: "Invalid tweet URL",
      });
    }

    // Get tweet details
    const tweet = await userClient.v2.singleTweet(tweetId, {
      "tweet.fields": ["author_id", "created_at", "public_metrics", "entities"],
    });

    if (!tweet.data) {
      return NextResponse.json({
        success: false,
        error: "Tweet not found",
      });
    }

    // Verify tweet belongs to authenticated user
    const twitterAuth = await prisma.twitterAuth.findUnique({
      where: { userWallet: data.userWallet.toLowerCase() },
    });

    if (!twitterAuth || tweet.data.author_id !== twitterAuth.twitterId) {
      return NextResponse.json({
        success: false,
        error: "Tweet does not belong to authenticated user",
      });
    }

    // Check hashtags
    const tweetHashtags = extractHashtags(tweet.data.text);
    const missingHashtags = data.requiredHashtags.filter(
      hashtag => !tweetHashtags.includes(hashtag.toLowerCase())
    );

    // Check mentions
    const tweetMentions = extractMentions(tweet.data.text);
    const missingMentions = data.requiredMentions.filter(
      mention => !tweetMentions.includes(mention.toLowerCase())
    );

    const isValid = missingHashtags.length === 0 && missingMentions.length === 0;

    return NextResponse.json({
      success: true,
      verified: isValid,
      tweet: {
        id: tweet.data.id,
        text: tweet.data.text,
        createdAt: tweet.data.created_at,
        publicMetrics: tweet.data.public_metrics,
      },
      verification: {
        hasAllHashtags: missingHashtags.length === 0,
        missingHashtags,
        hasAllMentions: missingMentions.length === 0,
        missingMentions,
        foundHashtags: tweetHashtags,
        foundMentions: tweetMentions,
      },
    });

  } catch (error) {
    console.error("Post verification error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to verify post",
    });
  }
}

// Helper functions
function extractTweetId(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
}

function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = text.match(mentionRegex);
  return matches ? matches.map(mention => mention.slice(1).toLowerCase()) : [];
}
