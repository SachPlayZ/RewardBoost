import { z } from 'zod';

// Enums for form selections
export enum RewardType {
  USDC = 'USDC',
  SEI = 'SEI'
}

export enum DistributionMethod {
  LUCKY_DRAW = 'lucky_draw',
  EQUAL_DISTRIBUTION = 'equal_distribution'
}

export enum TaskType {
  X_FOLLOW = 'x_follow',
  X_POST = 'x_post',
  CUSTOM = 'custom'
}

export enum ContentTone {
  CASUAL = 'casual',
  FORMAL = 'formal',
  FRIENDLY = 'friendly',
  PROFESSIONAL = 'professional',
  ENGAGING = 'engaging'
}

// Quest Step Schema
export const QuestStepSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Step title is required'),
  instruction: z.string().min(1, 'Instruction is required'),
  completionCriteria: z.string().min(1, 'Completion criteria is required'),
  xpReward: z.number().min(0, 'XP reward must be non-negative').default(10),
});

// Compulsory Task Schema
export const CompulsoryTaskSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(TaskType),
  enabled: z.boolean().default(false),
  // X Follow specific
  accountToFollow: z.string().optional(),
  // X Post specific
  postLimit: z.number().min(1).optional(),
  hashtags: z.array(z.string()).default([]),
  accountsToTag: z.array(z.string()).default([]),
  // Custom task specific
  customTitle: z.string().optional(),
  customDescription: z.string().optional(),
});

// Reward Configuration Schema
export const RewardConfigSchema = z.object({
  amount: z.number().min(1, 'Reward amount must be greater than 0'),
  type: z.nativeEnum(RewardType),
  distributionMethod: z.nativeEnum(DistributionMethod),
  // Lucky Draw specific
  numberOfWinners: z.number().min(1).optional(),
  // Equal Distribution (numberOfWinners = total participants)
});

// Knowledge Base Schema
export const KnowledgeBaseSchema = z.object({
  enabled: z.boolean().default(false),
  // PDF Upload option
  pdfFileName: z.string().optional(),
  pdfUrl: z.string().url().optional(),
  knowledgeBaseId: z.string().optional(),
  status: z.enum(['uploading', 'processing', 'ready', 'error']).optional(),
  errorMessage: z.string().optional(),
  // Manual text input option
  manualText: z.string().optional(),
  inputMethod: z.enum(['pdf', 'text']).default('pdf'),
  // Processing method
  provider: z.enum(['rivalz', 'groq']).default('rivalz'),
});

// Main Campaign Schema
export const CampaignFormSchema = z.object({
  // Basic Campaign Info
  title: z.string().min(1, 'Campaign title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  
  // Organization Info
  organizationName: z.string().min(1, 'Organization name is required').max(100, 'Organization name too long'),
  organizationLogo: z.string().url('Must be a valid URL').optional(),
  
  // Quest Configuration
  questBanner: z.string().url('Must be a valid URL').optional(),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  maxParticipants: z.number().min(1, 'Must allow at least 1 participant').max(10000, 'Too many participants'),
  compulsoryTasks: z.array(CompulsoryTaskSchema).default([]),
  
  // Knowledge Base for AI Tweet Generation
  knowledgeBase: KnowledgeBaseSchema.optional(),
  
  // Rewards
  rewardConfig: RewardConfigSchema,
  
  // AI Content Generation (for user quests)
  aiContentConfig: z.object({
    platform: z.string().default('X/Twitter'),
    tone: z.nativeEnum(ContentTone).default(ContentTone.CASUAL),
    language: z.string().default('English'),
    generateContent: z.boolean().default(false),
    customContent: z.string().optional(),
  }).optional(),
}).refine((data) => {
  // For lucky draw, numberOfWinners is required
  if (data.rewardConfig.distributionMethod === DistributionMethod.LUCKY_DRAW) {
    return data.rewardConfig.numberOfWinners && data.rewardConfig.numberOfWinners > 0;
  }
  return true;
}, {
  message: "Number of winners is required for lucky draw",
  path: ["rewardConfig", "numberOfWinners"],
});

export type CampaignFormData = z.infer<typeof CampaignFormSchema>;
export type QuestStep = z.infer<typeof QuestStepSchema>;
export type CompulsoryTask = z.infer<typeof CompulsoryTaskSchema>;
export type RewardConfig = z.infer<typeof RewardConfigSchema>;
export type KnowledgeBase = z.infer<typeof KnowledgeBaseSchema>;

// Platform Fee Configuration - 5% of reward amount
export const PLATFORM_FEE_PERCENTAGE = 5; // 5% platform fee

// Helper function to calculate platform fee dynamically
export function calculatePlatformFee(rewardAmount: number): number {
  return (rewardAmount * PLATFORM_FEE_PERCENTAGE) / 100;
}

// XP Configuration
export const XP_REWARDS = {
  FOLLOW: 10,
  POST: 50,
  VERIFIED_MULTIPLIER: 2,
  QUEST_COMPLETION: 100,
};

// Helper function to calculate total deposit required
export function calculateTotalDeposit(rewardAmount: number, rewardType: RewardType): number {
  // Platform fee is 5% of the reward amount in the same token
  const platformFee = calculatePlatformFee(rewardAmount);
  return rewardAmount + platformFee;
}

// Helper function to get deposit breakdown for display
export function getDepositBreakdown(rewardAmount: number, rewardType: RewardType) {
  const platformFee = calculatePlatformFee(rewardAmount);

  return {
    rewards: `${rewardAmount} ${rewardType}`,
    platformFee: `${platformFee} ${rewardType}`,
    total: `${rewardAmount + platformFee} ${rewardType}`,
    displayText: `${rewardAmount} ${rewardType} + ${platformFee} ${rewardType} (Platform Fee)`
  };
}

// Helper function to calculate XP rewards
export function calculateXPReward(taskType: TaskType, isVerified: boolean = false): number {
  let baseXP = 0;
  
  switch (taskType) {
    case TaskType.X_FOLLOW:
      baseXP = XP_REWARDS.FOLLOW;
      break;
    case TaskType.X_POST:
      baseXP = XP_REWARDS.POST;
      break;
    default:
      baseXP = 10;
  }
  
  return isVerified ? baseXP * XP_REWARDS.VERIFIED_MULTIPLIER : baseXP;
}
