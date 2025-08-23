import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("Twitter OAuth error:", error);
    return NextResponse.redirect(
      new URL("/?error=twitter_oauth_failed", request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/?error=missing_oauth_params", request.url)
    );
  }

  try {
    // Check if required environment variables are set
    if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
      console.error("Missing Twitter OAuth credentials");
      return NextResponse.redirect(
        new URL("/?error=missing_twitter_credentials", request.url)
      );
    }

    // Decode the state parameter
    const decodedState = JSON.parse(
      Buffer.from(state, 'base64url').toString()
    );

    const { walletAddress, callbackUrl, codeVerifier } = decodedState;

    // Exchange authorization code for access token
    const clientId = process.env.TWITTER_CLIENT_ID;
    const clientSecret = process.env.TWITTER_CLIENT_SECRET;

    // Try both Twitter and X API endpoints
    let tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/twitter/oauth/callback`,
        code_verifier: codeVerifier,
      }),
    });

    // If Twitter API fails, try X API
    if (!tokenResponse.ok) {
      console.log("Twitter API failed, trying X API...");
      tokenResponse = await fetch("https://api.x.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          code,
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/twitter/oauth/callback`,
          code_verifier: codeVerifier,
        }),
      });
    }

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed on both APIs:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        response: errorText,
        clientId: clientId ? "present" : "missing",
        clientSecret: clientSecret ? "present" : "missing",
      });
      return NextResponse.redirect(
        new URL("/?error=token_exchange_failed", request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log("Token received:", {
      hasAccessToken: !!accessToken,
      tokenType: tokenData.token_type,
      scopes: tokenData.scope,
      expiresIn: tokenData.expires_in,
      accessTokenPreview: accessToken.substring(0, 20) + "...",
    });

    // Test the access token with a simple API call first
    console.log("Testing access token validity...");
    console.log("Making API call to: https://api.twitter.com/2/users/me");
    console.log("Using Authorization header: Bearer " + accessToken.substring(0, 30) + "...");

    let testResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": "TwitterOAuthTest/1.0",
      },
    });

    // If Twitter API fails, try X API
    if (!testResponse.ok) {
      console.log("Twitter API failed, trying X API for user data...");
      testResponse = await fetch("https://api.x.com/2/users/me", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "User-Agent": "TwitterOAuthTest/1.0",
        },
      });
    }

    console.log("Test API response:", {
      status: testResponse.status,
      statusText: testResponse.statusText,
      ok: testResponse.ok,
      headers: Object.fromEntries(testResponse.headers.entries()),
    });

    // Log the raw response if it's not successful
    if (!testResponse.ok) {
      const responseText = await testResponse.text();
      console.log("Raw API response:", responseText);

      // Try to parse as JSON for better error details
      try {
        const errorJson = JSON.parse(responseText);
        console.log("Parsed error response:", errorJson);
      } catch (e) {
        console.log("Response is not JSON:", responseText);
      }
    }

    if (testResponse.ok) {
      const userData = await testResponse.json();
      console.log("User data retrieved successfully:", userData);
      const twitterUser = userData.data;

      // Store only essential Twitter profile data
      let userProfile = await prisma.userProfile.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
      });

      if (!userProfile) {
        userProfile = await prisma.userProfile.create({
          data: {
            walletAddress: walletAddress.toLowerCase(),
            twitterId: twitterUser.id,
            twitterUsername: twitterUser.username,
            twitterName: twitterUser.name,
            twitterProfileImage: twitterUser.profile_image_url,
          },
        });
      } else {
        // Update existing profile with Twitter info
        userProfile = await prisma.userProfile.update({
          where: { walletAddress: walletAddress.toLowerCase() },
          data: {
            twitterId: twitterUser.id,
            twitterUsername: twitterUser.username,
            twitterName: twitterUser.name,
            twitterProfileImage: twitterUser.profile_image_url,
            updatedAt: new Date(),
          },
        });
      }

      // Redirect back to the original callback URL with success
      const finalCallbackUrl = new URL(callbackUrl, request.url);
      finalCallbackUrl.searchParams.set("twitter_linked", "true");
      finalCallbackUrl.searchParams.set("twitter_username", twitterUser.username);

      return NextResponse.redirect(finalCallbackUrl);
    }

    // If test fails, try with user fields on both APIs
    let userResponse = await fetch("https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "User-Agent": "TwitterOAuthTest/1.0",
      },
    });

    // If Twitter fails, try X API with user fields
    if (!userResponse.ok) {
      console.log("Trying X API with user.fields parameter...");
      userResponse = await fetch("https://api.x.com/2/users/me?user.fields=id,name,username,profile_image_url", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "User-Agent": "TwitterOAuthTest/1.0",
        },
      });
    }

    // If that fails, try without user fields on both APIs
    if (!userResponse.ok) {
      console.log("Trying Twitter API without user.fields parameter...");
      userResponse = await fetch("https://api.twitter.com/2/users/me", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "User-Agent": "TwitterOAuthTest/1.0",
        },
      });
    }

    // Final fallback to X API without user fields
    if (!userResponse.ok) {
      console.log("Trying X API without user.fields parameter...");
      userResponse = await fetch("https://api.x.com/2/users/me", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "User-Agent": "TwitterOAuthTest/1.0",
        },
      });
    }

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("User data fetch failed:", {
        status: userResponse.status,
        statusText: userResponse.statusText,
        response: errorText,
        accessToken: accessToken ? "present" : "missing",
        tokenType: tokenData.token_type,
        scopes: tokenData.scope,
      });
      return NextResponse.redirect(
        new URL("/?error=user_data_fetch_failed", request.url)
      );
    }

    const userData = await userResponse.json();
    const twitterUser = userData.data;

    // Store only essential Twitter profile data
    let userProfile = await prisma.userProfile.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!userProfile) {
      userProfile = await prisma.userProfile.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          twitterId: twitterUser.id,
          twitterUsername: twitterUser.username,
          twitterName: twitterUser.name,
          twitterProfileImage: twitterUser.profile_image_url,
        },
      });
    } else {
      // Update existing profile with Twitter info
      userProfile = await prisma.userProfile.update({
        where: { walletAddress: walletAddress.toLowerCase() },
        data: {
          twitterId: twitterUser.id,
          twitterUsername: twitterUser.username,
          twitterName: twitterUser.name,
          twitterProfileImage: twitterUser.profile_image_url,
          updatedAt: new Date(),
        },
      });
    }

    // Redirect back to the original callback URL with success
    const finalCallbackUrl = new URL(callbackUrl, request.url);
    finalCallbackUrl.searchParams.set("twitter_linked", "true");
    finalCallbackUrl.searchParams.set("twitter_username", twitterUser.username);

    return NextResponse.redirect(finalCallbackUrl);

  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/?error=oauth_callback_error", request.url)
    );
  }
}
