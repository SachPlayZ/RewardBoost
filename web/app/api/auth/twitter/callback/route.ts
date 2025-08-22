import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      console.error("Twitter OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/twitter?error=${error}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/twitter?error=missing_code_or_state`
      );
    }

    // Find the stored auth data by state
    const twitterAuth = await prisma.twitterAuth.findFirst({
      where: { state },
    });

    if (!twitterAuth) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/auth/twitter?error=invalid_state`
      );
    }

    const twitterClient = getTwitterClient();

    // Exchange code for tokens
    const {
      accessToken,
      refreshToken,
      expiresIn,
    } = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier: twitterAuth.codeVerifier,
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
    });

    // Get user information
    const userClient = new TwitterApi(accessToken);
    const user = await userClient.v2.me({
      "user.fields": ["profile_image_url", "public_metrics", "verified", "created_at"],
    });

    // Calculate token expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (expiresIn || 7200)); // Default 2 hours

    // Update the Twitter auth record
    await prisma.twitterAuth.update({
      where: { userWallet: twitterAuth.userWallet },
      data: {
        twitterId: user.data.id,
        twitterUsername: user.data.username,
        twitterName: user.data.name,
        twitterProfileImage: user.data.profile_image_url,
        accessToken,
        refreshToken,
        expiresAt,
        state: null, // Clear the state
        codeVerifier: null, // Clear the code verifier
        updatedAt: new Date(),
      },
    });

    // Update or create user profile
    await prisma.userProfile.upsert({
      where: { walletAddress: twitterAuth.userWallet },
      update: {
        twitterAuthId: twitterAuth.id,
        displayName: user.data.name,
        avatarUrl: user.data.profile_image_url,
        updatedAt: new Date(),
      },
      create: {
        walletAddress: twitterAuth.userWallet,
        displayName: user.data.name,
        avatarUrl: user.data.profile_image_url,
        twitterAuthId: twitterAuth.id,
      },
    });

    // Redirect to success page with user info
    const redirectUrl = new URL("/auth/twitter/success", process.env.NEXT_PUBLIC_APP_URL);
    redirectUrl.searchParams.set("username", user.data.username);
    redirectUrl.searchParams.set("wallet", twitterAuth.userWallet);

    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error("Twitter OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/twitter?error=oauth_callback_failed`
    );
  }
}
