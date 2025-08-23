import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const { searchParams } = new URL(req.url);
    const userWallet = searchParams.get("userWallet");

    // If userWallet is provided, return only that user's submissions
    if (userWallet) {
      const submissions = await prisma.submission.findMany({
        where: {
          campaignId,
          userWallet: userWallet.toLowerCase(),
          submissionType: "task_completion",
        },
        include: {
          task: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
              submissions: await Promise.all(submissions.map(async (sub) => {
        // Get Twitter auth info for the user
        const userProfile = await prisma.userProfile.findUnique({
          where: { walletAddress: sub.userWallet.toLowerCase() },
          select: {
            twitterId: true,
            twitterUsername: true,
            twitterName: true,
          },
        });

        return {
          id: sub.id,
          taskId: sub.taskId,
          taskType: sub.task?.type,
          taskTitle: sub.task?.title,
          submissionData: sub.taskData,
          status: sub.status,
          createdAt: sub.createdAt,
          verifiedAt: sub.verifiedAt,
          verifierNotes: sub.verifierNotes,
          userWallet: sub.userWallet,
          twitterId: userProfile?.twitterId || null,
          twitterUsername: userProfile?.twitterUsername || null,
          twitterName: userProfile?.twitterName || null,
        };
      })),
      });
    }

    // Otherwise, return all submissions for the campaign (for campaign owners)
    const submissions = await prisma.submission.findMany({
      where: {
        campaignId,
        submissionType: "task_completion",
      },
      include: {
        task: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      submissions: await Promise.all(submissions.map(async (sub) => {
        // Get Twitter auth info for the user
        const userProfile = await prisma.userProfile.findUnique({
          where: { walletAddress: sub.userWallet.toLowerCase() },
          select: {
            twitterId: true,
            twitterUsername: true,
            twitterName: true,
          },
        });

        return {
          id: sub.id,
          taskId: sub.taskId,
          taskType: sub.task?.type,
          taskTitle: sub.task?.title,
          userWallet: sub.userWallet,
          submissionData: sub.taskData,
          status: sub.status,
          createdAt: sub.createdAt,
          verifiedAt: sub.verifiedAt,
          verifierNotes: sub.verifierNotes,
          twitterId: userProfile?.twitterId || null,
          twitterUsername: userProfile?.twitterUsername || null,
          twitterName: userProfile?.twitterName || null,
        };
      })),
    });

  } catch (error) {
    console.error("Submissions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const ReviewSubmissionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  verifierNotes: z.string().optional(),
  xpReward: z.number().min(0).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const body = await req.json();
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get("submissionId");

    if (!submissionId) {
      return NextResponse.json(
        { error: "Submission ID is required" },
        { status: 400 }
      );
    }

    const { status, verifierNotes, xpReward } = ReviewSubmissionSchema.parse(body);

    // Get the submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: true,
        campaign: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Verify the user is the campaign owner
    const { searchParams: reqSearchParams } = new URL(req.url);
    const reviewerWallet = reqSearchParams.get("reviewerWallet");

    if (!reviewerWallet) {
      return NextResponse.json(
        { error: "Reviewer wallet is required" },
        { status: 400 }
      );
    }

    if (submission.campaign.ownerWallet.toLowerCase() !== reviewerWallet.toLowerCase()) {
      return NextResponse.json(
        { error: "Only campaign owner can review submissions" },
        { status: 403 }
      );
    }

    // Update the submission status
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status,
        verifiedAt: new Date(),
        verifierNotes: verifierNotes || null,
      },
    });

    // If approved, we would call the contract to update XP
    // This would be done via the updateQuestScore function
    if (status === "approved" && xpReward && xpReward > 0) {
      console.log(`TODO: Call updateQuestScore for user ${submission.userWallet} with ${xpReward} XP`);
      // TODO: Integrate with blockchain contract to update user XP
      // await updateQuestScore(campaign.blockchainCampaignId, submission.userWallet, xpReward);
    }

    return NextResponse.json({
      success: true,
      message: `Submission ${status} successfully`,
      submission: {
        id: updatedSubmission.id,
        status: updatedSubmission.status,
        verifiedAt: updatedSubmission.verifiedAt,
        verifierNotes: updatedSubmission.verifierNotes,
      },
    });

  } catch (error) {
    console.error("Submission review error:", error);

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