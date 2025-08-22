import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const JoinQuestSchema = z.object({
  userWallet: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    const body = await req.json();
    const { userWallet } = JoinQuestSchema.parse(body);

    // Check if campaign exists and is active
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        tasks: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (!campaign.isActive) {
      return NextResponse.json(
        { error: "Campaign is not active" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now < campaign.startDate || now > campaign.endDate) {
      return NextResponse.json(
        { error: "Campaign is not currently active" },
        { status: 400 }
      );
    }

    // Check if user already joined
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        campaignId,
        userWallet: userWallet.toLowerCase(),
        submissionType: "full_quest",
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "User has already joined this quest" },
        { status: 400 }
      );
    }

    // Check participant limit
    if (campaign.currentParticipants >= campaign.maxParticipants) {
      return NextResponse.json(
        { error: "Campaign has reached maximum participants" },
        { status: 400 }
      );
    }

    // Create quest participation record
    const submission = await prisma.submission.create({
      data: {
        campaignId,
        userWallet: userWallet.toLowerCase(),
        submissionType: "full_quest",
        status: "pending",
      },
    });

    // Update participant count
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        currentParticipants: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully joined the quest",
      submission: {
        id: submission.id,
        campaignId: submission.campaignId,
        userWallet: submission.userWallet,
        status: submission.status,
        createdAt: submission.createdAt,
      },
      campaign: {
        id: campaign.id,
        title: campaign.title,
        tasks: campaign.tasks.filter(task => task.enabled),
      },
    });

  } catch (error) {
    console.error("Quest join error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    const { searchParams } = new URL(req.url);
    const userWallet = searchParams.get("userWallet");

    if (!userWallet) {
      return NextResponse.json(
        { error: "User wallet address is required" },
        { status: 400 }
      );
    }

    // Check if user has joined the quest
    const submission = await prisma.submission.findFirst({
      where: {
        campaignId,
        userWallet: userWallet.toLowerCase(),
        submissionType: "full_quest",
      },
    });

    return NextResponse.json({
      success: true,
      hasJoined: !!submission,
      submission: submission ? {
        id: submission.id,
        status: submission.status,
        createdAt: submission.createdAt,
      } : null,
    });

  } catch (error) {
    console.error("Quest join status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
