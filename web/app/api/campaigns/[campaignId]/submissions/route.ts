import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const GetSubmissionsSchema = z.object({
  ownerWallet: z.string().min(1),
  status: z.enum(["pending", "approved", "rejected", "verified"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    const { searchParams } = new URL(req.url);

    const query = GetSubmissionsSchema.parse({
      ownerWallet: searchParams.get("ownerWallet"),
      status: searchParams.get("status") as any,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    });

    // Verify campaign ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (campaign.ownerWallet !== query.ownerWallet.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized access to campaign" },
        { status: 403 }
      );
    }

    const skip = (query.page - 1) * query.limit;

    // Build where clause
    let whereClause: any = {
      campaignId,
    };

    if (query.status) {
      whereClause.status = query.status;
    }

    // Get submissions with pagination
    const [submissions, totalCount] = await Promise.all([
      prisma.submission.findMany({
        where: whereClause,
        include: {
          task: {
            select: {
              id: true,
              type: true,
              title: true,
              instruction: true,
              accountToFollow: true,
              hashtags: true,
              customTitle: true,
              customDescription: true,
              qpReward: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: query.limit,
      }),
      prisma.submission.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / query.limit);

    return NextResponse.json({
      success: true,
      submissions: submissions.map(submission => ({
        id: submission.id,
        userWallet: submission.userWallet,
        submissionType: submission.submissionType,
        status: submission.status,
        taskData: submission.taskData,
        twitterUsername: submission.twitterUsername,
        twitterPostUrl: submission.twitterPostUrl,
        proofImage: submission.proofImage,
        verifiedAt: submission.verifiedAt,
        verifierNotes: submission.verifierNotes,
        createdAt: submission.createdAt,
        task: submission.task,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        totalCount,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPrevPage: query.page > 1,
      },
    });

  } catch (error) {
    console.error("Submissions fetch error:", error);

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

const UpdateSubmissionSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "verified"]),
  verifierNotes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get("submissionId");
    const ownerWallet = searchParams.get("ownerWallet");

    if (!submissionId || !ownerWallet) {
      return NextResponse.json(
        { error: "Submission ID and owner wallet are required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, verifierNotes } = UpdateSubmissionSchema.parse(body);

    // Verify campaign ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (campaign.ownerWallet !== ownerWallet.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized access to campaign" },
        { status: 403 }
      );
    }

    // Verify submission belongs to campaign
    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        campaignId,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Update submission
    const updateData: any = {
      status,
      verifierNotes,
      updatedAt: new Date(),
    };

    if (status === "verified" || status === "approved") {
      updateData.verifiedAt = new Date();
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: updateData,
      include: {
        task: {
          select: {
            id: true,
            type: true,
            title: true,
            instruction: true,
            accountToFollow: true,
            hashtags: true,
            customTitle: true,
            customDescription: true,
            qpReward: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Submission updated successfully",
      submission: {
        id: updatedSubmission.id,
        userWallet: updatedSubmission.userWallet,
        status: updatedSubmission.status,
        verifierNotes: updatedSubmission.verifierNotes,
        verifiedAt: updatedSubmission.verifiedAt,
        task: updatedSubmission.task,
      },
    });

  } catch (error) {
    console.error("Submission update error:", error);

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
