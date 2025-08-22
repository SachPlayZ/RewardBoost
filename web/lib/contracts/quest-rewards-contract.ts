import questRewardsContractAbiJson from './quest-rewards-contract-abi.json';
export const QuestRewardsContractABI = questRewardsContractAbiJson;

// Contract address - update this with your deployed contract address
// Example: Replace with your actual deployed contract address
export const QUEST_REWARDS_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_QUEST_REWARDS_CONTRACT_ADDRESS as `0x${string}` || "0x742d35Cc6635C0532925a3b8D7Fb8d22567b9E52" as const;

// Enum mappings
export enum RewardDistributionMethod {
  LuckyDraw = 0,
  EqualDistribution = 1
}

export enum CampaignStatus {
  Draft = 0,
  Active = 1,
  Ended = 2,
  Cancelled = 3
}

// Type definitions based on contract structs
export interface Campaign {
  campaignId: bigint;
  creator: `0x${string}`;
  rewardToken: `0x${string}`;
  distributionMethod: RewardDistributionMethod;
  startTime: bigint;
  endTime: bigint;
  maxParticipants: bigint;
  status: CampaignStatus;
  totalRewardAmount: bigint;
  platformFee: bigint;
  guaranteedRewardPerUser: bigint;
  depositRequired: bigint;
  numberOfWinners: bigint;
  totalParticipants: bigint;
  rewardsDistributed: boolean;
}

export interface Participant {
  isParticipant: boolean;
  questScore: bigint;
  joinedAt: bigint;
  rewardClaimed: boolean;
}
