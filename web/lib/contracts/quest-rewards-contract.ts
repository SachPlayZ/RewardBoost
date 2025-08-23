import questRewardsContractAbiJson from './quest-rewards-contract-abi.json';
export const QuestRewardsContractABI = questRewardsContractAbiJson as any;

// Contract addresses - updated with latest deployed contract (SEI Testnet)
export const QUEST_REWARDS_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_QUEST_REWARDS_CONTRACT_ADDRESS as `0x${string}` || "0x318Fb7B367F00504Af594A290Bdc3C2cCD7b2BFd" as const;

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
