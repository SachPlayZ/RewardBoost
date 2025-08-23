import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;

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

    return NextResponse.json({
      success: true,
      campaign: {
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
      },
    });

  } catch (error) {
    console.error("Campaign fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const body = await req.json();

    // Handle funding campaign
    if (body.action === "fund") {
      const campaign = await prisma.campaign.update({
        where: { id: campaignId },
        data: { funded: true },
      });

      return NextResponse.json({
        success: true,
        message: "Campaign funded successfully",
        campaign: {
          id: campaign.id,
          funded: campaign.funded,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Campaign update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
