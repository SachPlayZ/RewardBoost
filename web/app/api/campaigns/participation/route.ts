import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, userWallet } = body;

    if (!campaignId || !userWallet) {
      return NextResponse.json(
        { error: "Missing campaignId or userWallet" },
        { status: 400 }
      );
    }

    // Check if user is the campaign owner
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { ownerWallet: true }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const isOwner = campaign.ownerWallet.toLowerCase() === userWallet.toLowerCase();

    // Check if user has any submissions for this campaign
    const submissions = await prisma.submission.findMany({
      where: {
        campaignId,
        userWallet: userWallet.toLowerCase()
      },
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    });

    const hasJoined = submissions.length > 0;
    const joinedAt = hasJoined ? submissions[0].createdAt : null;
    const submissionStatus = hasJoined ? submissions[0].status : null;

    return NextResponse.json({
      success: true,
      participationStatus: {
        isOwner,
        hasJoined,
        joinedAt,
        submissionStatus,
        submissionCount: submissions.length
      }
    });

  } catch (error) {
    console.error("Participation check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
