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
  minCharacters: z.number().min(1).default(150),
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

// Main Campaign Schema
export const CampaignFormSchema = z.object({
  // Basic Campaign Info
  title: z.string().min(1, 'Campaign title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  
  // Quest Configuration
  questImage: z.string().url('Must be a valid URL').optional(),
  questSteps: z.array(QuestStepSchema).min(1, 'At least one quest step is required'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  maxParticipants: z.number().min(1, 'Must allow at least 1 participant').max(10000, 'Too many participants'),
  compulsoryTasks: z.array(CompulsoryTaskSchema).default([]),
  
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
  // End date must be after start date
  return data.endDate > data.startDate;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
}).refine((data) => {
  // Max duration check (7 days)
  const diffTime = data.endDate.getTime() - data.startDate.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}, {
  message: "Campaign duration cannot exceed 7 days",
  path: ["endDate"],
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

// Platform Fee Configuration (display-only, configurable later)
export const PLATFORM_FEE = {
  FLAT_FEE: 5, // $5 USD
  PERCENTAGE: 0, // 0% for now
};

// XP Configuration
export const XP_REWARDS = {
  FOLLOW: 10,
  POST: 50,
  VERIFIED_MULTIPLIER: 2,
  QUEST_COMPLETION: 100,
};

// Helper function to calculate total deposit required
export function calculateTotalDeposit(rewardAmount: number): number {
  return rewardAmount + PLATFORM_FEE.FLAT_FEE;
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
