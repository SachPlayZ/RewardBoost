import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const CreateCampaignSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  organizationName: z.string().min(1),
  organizationLogo: z.string().optional(),
  questBanner: z.string().optional(),
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
  knowledgeBase: z.object({
    enabled: z.boolean().default(false),
    pdfFileName: z.string().optional(),
    pdfUrl: z.string().optional(),
    knowledgeBaseId: z.string().optional(),
    status: z.enum(['uploading', 'processing', 'ready', 'error']).optional(),
    errorMessage: z.string().optional(),
    manualText: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("🔍 API received data:", body);
    console.log("📝 Description received:", body.description);
    console.log("🏢 Organization logo:", body.organizationLogo);
    console.log("🎨 Quest banner:", body.questBanner);
    const validatedData = CreateCampaignSchema.parse(body);

    // Parse dates
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

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
        funded: false, // Campaigns start as unfunded
        // Knowledge base fields
        knowledgeBaseEnabled: validatedData.knowledgeBase?.enabled || false,
        knowledgeBasePdfFileName: validatedData.knowledgeBase?.pdfFileName,
        knowledgeBasePdfUrl: validatedData.knowledgeBase?.pdfUrl,
        knowledgeBaseId: validatedData.knowledgeBase?.knowledgeBaseId,
        knowledgeBaseStatus: validatedData.knowledgeBase?.status,
        knowledgeBaseErrorMessage: validatedData.knowledgeBase?.errorMessage,
        knowledgeBaseManualText: validatedData.knowledgeBase?.manualText,
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
      campaignId: campaign.id,
      message: "Draft campaign saved successfully"
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
      const lowerOwnerWallet = ownerWallet.toLowerCase();

      if (status === "all") {
        // For "all" status with connected wallet, show:
        // 1. Campaigns owned by the user, OR
        // 2. Funded campaigns from other users (that they can join)
        whereClause.OR = [
          { ownerWallet: lowerOwnerWallet }, // User's own campaigns
          { funded: true } // Funded campaigns they can join
        ];
      } else {
        // For specific status (active, completed), show only user's campaigns
        whereClause.ownerWallet = lowerOwnerWallet;
      }
    }
    // Note: When no ownerWallet is specified, we show ALL campaigns
    // This allows users to see all campaigns even when not connected

    if (status === "active") {
      if (whereClause.OR) {
        // For "all" status with OR condition, apply status filter to both parts
        whereClause.OR = whereClause.OR.map((condition: any) => ({
          ...condition,
          status: "active",
          endDate: { gte: new Date() }
        }));
      } else {
        whereClause.status = "active";
        whereClause.endDate = {
          gte: new Date(),
        };
      }
    } else if (status === "completed") {
      const completedConditions = [
        { status: "ended" },
        { status: "cancelled" },
        { endDate: { lt: new Date() } },
      ];

      if (whereClause.OR) {
        // For "all" status with OR condition, combine with completed conditions
        whereClause.OR = whereClause.OR.flatMap((baseCondition: any) =>
          completedConditions.map((completedCondition: any) => ({
            ...baseCondition,
            ...completedCondition
          }))
        );
      } else {
        whereClause.OR = completedConditions;
      }
    }

    console.log(`📋 API: Received parameters - ownerWallet: ${ownerWallet}, status: ${status}`);
    console.log(`📋 API: Fetching campaigns with whereClause:`, JSON.stringify(whereClause, null, 2));

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

    console.log(`📋 API: Found ${campaigns.length} campaigns matching criteria`);

    // Log campaign details for debugging
    if (campaigns.length > 0) {
      console.log(`📋 API: Campaign breakdown:`);
      campaigns.forEach(campaign => {
        const isOwned = ownerWallet && campaign.ownerWallet.toLowerCase() === ownerWallet.toLowerCase();
        console.log(`  - ${campaign.title} (${campaign.id}): status=${campaign.status}, funded=${campaign.funded}, owned=${isOwned}`);
      });
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns.map(campaign => ({
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        organizationName: campaign.organizationName,
        organizationLogo: campaign.organizationLogo,
        questBanner: campaign.questBanner,
        startDate: campaign.startDate.toISOString(),
        endDate: campaign.endDate.toISOString(),
        maxParticipants: campaign.maxParticipants,
        currentParticipants: campaign.currentParticipants,
        rewardAmount: campaign.rewardAmount,
        rewardType: campaign.rewardType,
        distributionMethod: campaign.distributionMethod,
        numberOfWinners: campaign.numberOfWinners,
        ownerWallet: campaign.ownerWallet,
        status: campaign.status,
        funded: campaign.funded,
        blockchainTxHash: campaign.blockchainTxHash,
        blockchainCampaignId: campaign.blockchainCampaignId ? parseInt(campaign.blockchainCampaignId) : null,
        knowledgeBase: {
          enabled: campaign.knowledgeBaseEnabled,
          pdfFileName: campaign.knowledgeBasePdfFileName,
          pdfUrl: campaign.knowledgeBasePdfUrl,
          knowledgeBaseId: campaign.knowledgeBaseId,
          status: campaign.knowledgeBaseStatus as 'uploading' | 'processing' | 'ready' | 'error' | undefined,
          errorMessage: campaign.knowledgeBaseErrorMessage,
          manualText: campaign.knowledgeBaseManualText,
        },
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
