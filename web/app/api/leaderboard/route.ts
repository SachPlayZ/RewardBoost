import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get users ordered by total QP (completed tasks)
    const leaderboardData = await prisma.submission.groupBy({
      by: ['userWallet'],
      where: {
        submissionType: "task_completion",
        status: "verified"
      },
      _count: {
        id: true
      }
    });

    // Get detailed user stats including QP
    const usersWithStats = await Promise.all(
      leaderboardData.slice(offset, offset + limit).map(async (userGroup) => {
        const userWallet = userGroup.userWallet;

        // Get user's completed tasks with QP
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

        const totalQP = completedTasks.reduce((sum, task) => sum + (task.task?.qpReward || 0), 0);

        // Get user profile if exists
        const userProfile = await prisma.userProfile.findUnique({
          where: { walletAddress: userWallet.toLowerCase() },
          select: {
            displayName: true,
            avatarUrl: true,
            twitterUsername: true
          }
        });

        return {
          walletAddress: userWallet,
          displayName: userProfile?.displayName || userProfile?.twitterUsername || `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}`,
          avatarUrl: userProfile?.avatarUrl || null,
          totalQP,
          completedTasks: completedTasks.length,
          level: Math.floor(totalQP / 500) + 1 // Level calculation based on QP (500 QP per level)
        };
      })
    );

    // Sort by QP and add ranks
    const sortedUsers = usersWithStats
      .sort((a, b) => b.totalQP - a.totalQP)
      .map((user, index) => ({
        ...user,
        rank: offset + index + 1
      }));

    return NextResponse.json({
      success: true,
      leaderboard: sortedUsers,
      totalUsers: leaderboardData.length,
      hasMore: offset + limit < leaderboardData.length
    });

  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
