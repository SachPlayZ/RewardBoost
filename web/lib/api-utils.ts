import { NextRequest } from "next/server";
import { z } from "zod";

export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function createApiResponse(
  success: boolean,
  data: any,
  status: number = 200
) {
  return {
    success,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: any
) {
  return {
    success: false,
    error,
    details,
    timestamp: new Date().toISOString(),
  };
}

export function extractWalletFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const walletParam = new URL(req.url).searchParams.get('wallet');
  return walletParam;
}

export function formatCampaignData(campaign: any) {
  return {
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
    createdAt: campaign.createdAt,
  };
}

export function formatTaskData(task: any) {
  return {
    id: task.id,
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
    xpReward: task.xpReward,
  };
}

export function formatSubmissionData(submission: any) {
  return {
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
  };
}
