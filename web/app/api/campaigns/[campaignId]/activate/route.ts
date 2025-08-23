import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const ActivateCampaignSchema = z.object({
  blockchainTxHash: z.string().optional(),
  blockchainCampaignId: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const body = await req.json();

    // Validate the request body
    const validatedData = ActivateCampaignSchema.parse(body);

    // Find the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if campaign is in draft status
    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: "Campaign is not in draft status" },
        { status: 400 }
      );
    }

    // Update campaign status to active and add blockchain info
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'active',
        funded: true,
        blockchainTxHash: validatedData.blockchainTxHash,
        blockchainCampaignId: validatedData.blockchainCampaignId,
      },
    });

    console.log("Campaign activated:", updatedCampaign.id);

    return NextResponse.json({
      success: true,
      campaign: {
        id: updatedCampaign.id,
        status: updatedCampaign.status,
        funded: updatedCampaign.funded,
        blockchainTxHash: updatedCampaign.blockchainTxHash,
        blockchainCampaignId: updatedCampaign.blockchainCampaignId,
      },
      message: "Campaign activated successfully"
    });

  } catch (error) {
    console.error("Campaign activation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

