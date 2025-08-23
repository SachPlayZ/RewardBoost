import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, twitterUsername, twitterName, twitterProfileImage } = await request.json();

    if (!walletAddress || !twitterUsername) {
      return NextResponse.json(
        { error: "Wallet address and Twitter username are required" },
        { status: 400 }
      );
    }

    // Validate Twitter username format (basic validation)
    const usernameRegex = /^[a-zA-Z0-9_]{1,15}$/;
    if (!usernameRegex.test(twitterUsername)) {
      return NextResponse.json(
        { error: "Invalid Twitter username format" },
        { status: 400 }
      );
    }

    // Check if user profile exists, create if not
    let userProfile = await prisma.userProfile.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!userProfile) {
      userProfile = await prisma.userProfile.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          twitterUsername: twitterUsername.trim(),
          twitterName: twitterName?.trim() || twitterUsername.trim(),
          twitterProfileImage: twitterProfileImage?.trim() || `https://unavatar.io/twitter/${twitterUsername.trim()}`,
        },
      });
    } else {
      // Update existing profile with Twitter info
      userProfile = await prisma.userProfile.update({
        where: { walletAddress: walletAddress.toLowerCase() },
        data: {
          twitterUsername: twitterUsername.trim(),
          twitterName: twitterName?.trim() || twitterUsername.trim(),
          twitterProfileImage: twitterProfileImage?.trim() || `https://unavatar.io/twitter/${twitterUsername.trim()}`,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Twitter account linked successfully",
      data: {
        twitterUsername: userProfile.twitterUsername,
        twitterName: userProfile.twitterName,
        twitterProfileImage: userProfile.twitterProfileImage,
        linkedAt: userProfile.updatedAt,
      },
    });

  } catch (error) {
    console.error("Twitter linking error:", error);
    return NextResponse.json(
      { error: "Failed to link Twitter account" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Get user profile with Twitter info
    const userProfile = await prisma.userProfile.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
      select: {
        twitterUsername: true,
        twitterName: true,
        twitterProfileImage: true,
        updatedAt: true,
      },
    });

    if (!userProfile || !userProfile.twitterUsername) {
      return NextResponse.json({
        linked: false,
        twitterUsername: null,
        twitterName: null,
        twitterProfileImage: null,
      });
    }

    return NextResponse.json({
      linked: true,
      twitterUsername: userProfile.twitterUsername,
      twitterName: userProfile.twitterName,
      twitterProfileImage: userProfile.twitterProfileImage,
      linkedAt: userProfile.updatedAt,
    });

  } catch (error) {
    console.error("Twitter verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify Twitter link" },
      { status: 500 }
    );
  }
}
