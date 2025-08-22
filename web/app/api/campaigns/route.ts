import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const CreateCampaignSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  organizationName: z.string().min(1),
  organizationLogo: z.string().url().optional(),
  questBanner: z.string().url().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  maxParticipants: z.number().min(1).max(10000),
  rewardAmount: z.number().min(1),
  rewardType: z.enum(["USDC", "SEI"]),
  distributionMethod: z.enum(["lucky_draw", "equal_distribution"]),
  numberOfWinners: z.number().min(1).optional(),
  ownerWallet: z.string().min(1),
  tasks: z.array(z.object({
    type: z.enum(["x_follow", "x_post", "custom"]),
    title: z.string().optional(),
    instruction: z.string().optional(),
    completionCriteria: z.string().optional(),
    enabled: z.boolean().default(false),
    accountToFollow: z.string().optional(),
    postLimit: z.number().min(1).optional(),
    hashtags: z.array(z.string()).default([]),
    accountsToTag: z.array(z.string()).default([]),
    customTitle: z.string().optional(),
    customDescription: z.string().optional(),
    qpReward: z.number().min(0).default(10),
  })).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = CreateCampaignSchema.parse(body);

    // Validate dates
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Check campaign duration (max 7 days)
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
      return NextResponse.json(
        { error: "Campaign duration cannot exceed 7 days" },
        { status: 400 }
      );
    }

    // Validate lucky draw configuration
    if (validatedData.distributionMethod === "lucky_draw" && !validatedData.numberOfWinners) {
      return NextResponse.json(
        { error: "Number of winners is required for lucky draw" },
        { status: 400 }
      );
    }

    // Create campaign with tasks
    const campaign = await prisma.campaign.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        organizationName: validatedData.organizationName,
        organizationLogo: validatedData.organizationLogo,
        questBanner: validatedData.questBanner,
        startDate,
        endDate,
        maxParticipants: validatedData.maxParticipants,
        rewardAmount: validatedData.rewardAmount,
        rewardType: validatedData.rewardType,
        distributionMethod: validatedData.distributionMethod,
        numberOfWinners: validatedData.numberOfWinners,
        ownerWallet: validatedData.ownerWallet.toLowerCase(),
        tasks: {
          create: validatedData.tasks.map(task => ({
            type: task.type,
            title: task.title,
            instruction: task.instruction,
            completionCriteria: task.completionCriteria,
            enabled: task.enabled,
            accountToFollow: task.accountToFollow,
            postLimit: task.postLimit,
            hashtags: task.hashtags,
            accountsToTag: task.accountsToTag,
            customTitle: task.customTitle,
            customDescription: task.customDescription,
            qpReward: task.qpReward,
          })),
        },
      },
      include: {
        tasks: true,
      },
    });

    return NextResponse.json({
      success: true,
      campaign: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        tasks: campaign.tasks,
      },
    });

  } catch (error) {
    console.error("Campaign creation error:", error);

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerWallet = searchParams.get("ownerWallet");
    const status = searchParams.get("status"); // active, completed, all

    let whereClause: any = {};

    if (ownerWallet) {
      whereClause.ownerWallet = ownerWallet.toLowerCase();
    }

    if (status === "active") {
      whereClause.isActive = true;
      whereClause.endDate = {
        gte: new Date(),
      };
    } else if (status === "completed") {
      whereClause.OR = [
        { isActive: false },
        { endDate: { lt: new Date() } },
      ];
    }

    const campaigns = await prisma.campaign.findMany({
      where: whereClause,
      include: {
        tasks: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      campaigns: campaigns.map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        organizationName: campaign.organizationName,
        organizationLogo: campaign.organizationLogo,
        questBanner: campaign.questBanner,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        maxParticipants: campaign.maxParticipants,
        currentParticipants: campaign.currentParticipants,
        rewardAmount: campaign.rewardAmount,
        rewardType: campaign.rewardType,
        distributionMethod: campaign.distributionMethod,
        numberOfWinners: campaign.numberOfWinners,
        ownerWallet: campaign.ownerWallet,
        isActive: campaign.isActive,
        tasks: campaign.tasks,
        submissionCount: campaign._count.submissions,
        createdAt: campaign.createdAt,
      })),
    });

  } catch (error) {
    console.error("Campaign fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
