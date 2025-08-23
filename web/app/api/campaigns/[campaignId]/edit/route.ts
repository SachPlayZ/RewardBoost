import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const UpdateCampaignSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  organizationName: z.string().min(1, "Organization name is required"),
  organizationLogo: z.string().nullable().optional(),
  questBanner: z.string().nullable().optional(),
  updatedBy: z.string().min(1, "Updater wallet is required"),
  knowledgeBase: z.object({
    enabled: z.boolean().optional(),
    pdfFileName: z.string().optional(),
    pdfUrl: z.string().optional(),
    knowledgeBaseId: z.string().optional(),
    status: z.enum(['uploading', 'processing', 'ready', 'error']).optional(),
    errorMessage: z.string().optional(),
    manualText: z.string().optional(),
  }).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const body = await req.json();

    // Validate request body
    const validatedData = UpdateCampaignSchema.parse(body);
    const { updatedBy, knowledgeBase, ...updateData } = validatedData;

    // Find the campaign
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Verify the updater is the campaign owner
    if (existingCampaign.ownerWallet.toLowerCase() !== updatedBy.toLowerCase()) {
      return NextResponse.json(
        { error: "Only the campaign owner can update this campaign" },
        { status: 403 }
      );
    }

    // Update the campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...updateData,
        ...(knowledgeBase && {
          knowledgeBaseEnabled: knowledgeBase.enabled,
          knowledgeBasePdfFileName: knowledgeBase.pdfFileName,
          knowledgeBasePdfUrl: knowledgeBase.pdfUrl,
          knowledgeBaseId: knowledgeBase.knowledgeBaseId,
          knowledgeBaseStatus: knowledgeBase.status,
          knowledgeBaseErrorMessage: knowledgeBase.errorMessage,
          knowledgeBaseManualText: knowledgeBase.manualText,
        }),
        updatedAt: new Date(),
      },
      include: {
        tasks: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    // Return the updated campaign data
    return NextResponse.json({
      success: true,
      campaign: {
        id: updatedCampaign.id,
        title: updatedCampaign.title,
        description: updatedCampaign.description,
        organizationName: updatedCampaign.organizationName,
        organizationLogo: updatedCampaign.organizationLogo,
        questBanner: updatedCampaign.questBanner,
        startDate: updatedCampaign.startDate.toISOString(),
        endDate: updatedCampaign.endDate.toISOString(),
        maxParticipants: updatedCampaign.maxParticipants,
        currentParticipants: updatedCampaign.currentParticipants,
        rewardAmount: updatedCampaign.rewardAmount,
        rewardType: updatedCampaign.rewardType,
        distributionMethod: updatedCampaign.distributionMethod,
        numberOfWinners: updatedCampaign.numberOfWinners,
        ownerWallet: updatedCampaign.ownerWallet,
        status: updatedCampaign.status,
        funded: updatedCampaign.funded,
        blockchainTxHash: updatedCampaign.blockchainTxHash,
        blockchainCampaignId: updatedCampaign.blockchainCampaignId ? parseInt(updatedCampaign.blockchainCampaignId) : null,
        knowledgeBase: {
          enabled: updatedCampaign.knowledgeBaseEnabled,
          pdfFileName: updatedCampaign.knowledgeBasePdfFileName,
          pdfUrl: updatedCampaign.knowledgeBasePdfUrl,
          knowledgeBaseId: updatedCampaign.knowledgeBaseId,
          status: updatedCampaign.knowledgeBaseStatus as 'uploading' | 'processing' | 'ready' | 'error' | undefined,
          errorMessage: updatedCampaign.knowledgeBaseErrorMessage,
          manualText: updatedCampaign.knowledgeBaseManualText,
        },
        tasks: updatedCampaign.tasks.map(task => ({
          id: task.id,
          type: task.type,
          title: task.title || task.customTitle,
          instruction: task.instruction || task.customDescription,
          completionCriteria: task.completionCriteria,
          enabled: task.enabled,
          accountToFollow: task.accountToFollow,
          postLimit: task.postLimit,
          hashtags: task.hashtags || [],
          accountsToTag: task.accountsToTag || [],
          customTitle: task.customTitle,
          customDescription: task.customDescription,
          qpReward: task.qpReward,
        })),
        submissionCount: updatedCampaign._count.submissions,
        createdAt: updatedCampaign.createdAt.toISOString(),
      },
    });

  } catch (error) {
    console.error("Campaign update error:", error);

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
