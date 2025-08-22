import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    // Get user's campaigns (created and participated)
    const createdCampaigns = await prisma.campaign.findMany({
      where: { ownerWallet: userWallet.toLowerCase() },
      select: {
        id: true,
        createdAt: true,
        _count: { select: { submissions: true } }
      }
    });

    const participatedCampaigns = await prisma.submission.findMany({
      where: { userWallet: userWallet.toLowerCase(), submissionType: "full_quest" },
      select: {
        campaignId: true,
        status: true,
        createdAt: true,
        campaign: {
          select: {
            title: true,
            rewardAmount: true,
            rewardType: true
          }
        }
      }
    });

    // Get user's completed tasks
    const completedTasks = await prisma.submission.findMany({
      where: {
        userWallet: userWallet.toLowerCase(),
        submissionType: "task_completion",
        status: "verified"
      },
      include: {
        task: { select: { qpReward: true } },
        campaign: { select: { title: true } }
      }
    });

    // Calculate total QP
    const totalQP = completedTasks.reduce((sum, task) => sum + (task.task?.qpReward || 0), 0);

    // Calculate total earnings (this would need to be updated with actual reward data)
    const totalEarnings = participatedCampaigns
      .filter(sub => sub.status === "verified")
      .reduce((sum, sub) => sum + (sub.campaign?.rewardAmount || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalQP,
        totalEarnings,
        level: Math.floor(totalQP / 500) + 1, // Level calculation based on QP (500 QP per level)
        qpForNextLevel: ((Math.floor(totalQP / 500) + 1) * 500) - totalQP,
        completedQuests: participatedCampaigns.filter(sub => sub.status === "verified").length,
        createdCampaigns: createdCampaigns.length,
        participatedCampaigns: participatedCampaigns.length,
        completedTasks: completedTasks.length,
        recentActivity: [
          ...createdCampaigns.slice(0, 3).map(c => ({
            type: "created_campaign",
            title: "Created a campaign",
            timestamp: c.createdAt
          })),
          ...participatedCampaigns.slice(0, 3).map(p => ({
            type: "joined_campaign",
            title: `Joined ${p.campaign?.title}`,
            timestamp: p.createdAt
          }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)
      }
    });

  } catch (error) {
    console.error("User stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
