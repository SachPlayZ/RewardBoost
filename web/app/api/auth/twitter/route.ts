import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const TwitterAuthSchema = z.object({
  userWallet: z.string().min(1),
});

// Initialize Twitter client
function getTwitterClient() {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Twitter API credentials not configured");
  }

  return new TwitterApi({
    clientId,
    clientSecret,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userWallet } = TwitterAuthSchema.parse(body);

    const twitterClient = getTwitterClient();

    // Generate OAuth2 authorization URL
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
      {
        scope: [
          'tweet.read',
          'users.read',
          'follows.read',
          'offline.access'
        ]
      }
    );

    // Store the code verifier and state temporarily (in production, use Redis or similar)
    // For now, we'll store in the database
    await prisma.twitterAuth.upsert({
      where: { userWallet: userWallet.toLowerCase() },
      update: {
        codeVerifier,
        state,
        updatedAt: new Date(),
      },
      create: {
        userWallet: userWallet.toLowerCase(),
        codeVerifier,
        state,
      },
    });

    return NextResponse.json({
      success: true,
      authUrl: url,
      state,
    });

  } catch (error) {
    console.error("Twitter auth initiation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to initiate Twitter authentication" },
      { status: 500 }
    );
  }
}
