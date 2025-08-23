import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userWallet = searchParams.get("userWallet");

    if (!userWallet) {
      return NextResponse.json(
        { error: "User wallet address is required" },
        { status: 400 }
      );
    }

    // Get user profile with Twitter info
    const userProfile = await prisma.userProfile.findUnique({
      where: { walletAddress: userWallet.toLowerCase() },
      select: {
        id: true,
        walletAddress: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        totalXP: true,
        twitterId: true,
        twitterUsername: true,
        twitterName: true,
        twitterProfileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json({
        success: true,
        profile: {
          walletAddress: userWallet.toLowerCase(),
          twitterLinked: false,
          twitterUsername: null,
          twitterName: null,
          twitterProfileImage: null,
          linkedAt: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile: {
        ...userProfile,
        twitterLinked: !!userProfile.twitterUsername,
        linkedAt: userProfile.twitterUsername ? userProfile.updatedAt : null,
      },
    });

  } catch (error) {
    console.error("User profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userWallet = searchParams.get("userWallet");

    if (!userWallet) {
      return NextResponse.json(
        { error: "User wallet address is required" },
        { status: 400 }
      );
    }

    // Remove Twitter linking from user profile
    const updatedProfile = await prisma.userProfile.update({
      where: { walletAddress: userWallet.toLowerCase() },
      data: {
        twitterId: null,
        twitterUsername: null,
        twitterName: null,
        twitterProfileImage: null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Twitter account delinked successfully",
      profile: {
        ...updatedProfile,
        twitterLinked: false,
        twitterUsername: null,
        twitterName: null,
        twitterProfileImage: null,
        linkedAt: null,
      },
    });

  } catch (error) {
    console.error("Twitter delink error:", error);
    return NextResponse.json(
      { error: "Failed to delink Twitter account" },
      { status: 500 }
    );
  }
}
