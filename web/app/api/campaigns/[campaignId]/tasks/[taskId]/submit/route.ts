import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const SubmitTaskSchema = z.object({
  userWallet: z.string().min(1),
  taskData: z.object({
    twitterUsername: z.string().optional(),
    twitterPostUrl: z.string().url().optional(),
    proofImage: z.string().url().optional(),
    additionalData: z.record(z.any()).optional(),
  }).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { campaignId: string; taskId: string } }
) {
  try {
    const { campaignId, taskId } = params;
    const body = await req.json();
    const { userWallet, taskData } = SubmitTaskSchema.parse(body);

    // Check if campaign exists and is active
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
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

    // Check if task exists and is enabled
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || !task.enabled) {
      return NextResponse.json(
        { error: "Task not found or not enabled" },
        { status: 404 }
      );
    }

    if (task.campaignId !== campaignId) {
      return NextResponse.json(
        { error: "Task does not belong to this campaign" },
        { status: 400 }
      );
    }

    // Check if user has joined the quest
    const questParticipation = await prisma.submission.findFirst({
      where: {
        campaignId,
        userWallet: userWallet.toLowerCase(),
        submissionType: "full_quest",
      },
    });

    if (!questParticipation) {
      return NextResponse.json(
        { error: "User has not joined this quest" },
        { status: 400 }
      );
    }

    // Check if user already submitted this task
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        userWallet_campaignId_taskId: {
          userWallet: userWallet.toLowerCase(),
          campaignId,
          taskId,
        },
      },
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: "Task already submitted" },
        { status: 400 }
      );
    }

    // Validate task-specific requirements
    if (task.type === "x_follow" && !taskData?.twitterUsername) {
      return NextResponse.json(
        { error: "Twitter username is required for follow tasks" },
        { status: 400 }
      );
    }

    if (task.type === "x_post" && !taskData?.twitterPostUrl) {
      return NextResponse.json(
        { error: "Twitter post URL is required for post tasks" },
        { status: 400 }
      );
    }

    // Create task submission
    const submission = await prisma.submission.create({
      data: {
        campaignId,
        taskId,
        userWallet: userWallet.toLowerCase(),
        submissionType: "task_completion",
        taskData: taskData || {},
        twitterUsername: taskData?.twitterUsername,
        twitterPostUrl: taskData?.twitterPostUrl,
        proofImage: taskData?.proofImage,
        status: "pending", // Will be verified by admin or automated system
      },
    });

    return NextResponse.json({
      success: true,
      message: "Task submitted successfully",
      submission: {
        id: submission.id,
        taskId: submission.taskId,
        userWallet: submission.userWallet,
        status: submission.status,
        taskData: submission.taskData,
        createdAt: submission.createdAt,
      },
    });

  } catch (error) {
    console.error("Task submission error:", error);

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
  { params }: { params: { campaignId: string; taskId: string } }
) {
  try {
    const { campaignId, taskId } = params;
    const { searchParams } = new URL(req.url);
    const userWallet = searchParams.get("userWallet");

    if (!userWallet) {
      return NextResponse.json(
        { error: "User wallet address is required" },
        { status: 400 }
      );
    }

    // Get task details
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.campaignId !== campaignId) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Check if user has submitted this task
    const submission = await prisma.submission.findUnique({
      where: {
        userWallet_campaignId_taskId: {
          userWallet: userWallet.toLowerCase(),
          campaignId,
          taskId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        type: task.type,
        title: task.title,
        instruction: task.instruction,
        completionCriteria: task.completionCriteria,
        accountToFollow: task.accountToFollow,
        postLimit: task.postLimit,
        hashtags: task.hashtags,
        accountsToTag: task.accountsToTag,
        customTitle: task.customTitle,
        customDescription: task.customDescription,
        qpReward: task.qpReward,
      },
      submission: submission ? {
        id: submission.id,
        status: submission.status,
        taskData: submission.taskData,
        createdAt: submission.createdAt,
      } : null,
      hasSubmitted: !!submission,
    });

  } catch (error) {
    console.error("Task details error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
