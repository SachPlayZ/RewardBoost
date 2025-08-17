export const QuestRewardsContractABI = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "_treasury", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "MINIMUM_REWARD_AMOUNT",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "PLATFORM_FEE_PERCENTAGE",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createCampaign",
    "inputs": [
      {
        "name": "_rewardToken",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_distributionMethod",
        "type": "uint8",
        "internalType": "enum QuestRewardsContract.RewardDistributionMethod"
      },
      { "name": "_startTime", "type": "uint256", "internalType": "uint256" },
      { "name": "_endTime", "type": "uint256", "internalType": "uint256" },
      {
        "name": "_maxParticipants",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_totalRewardAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_numberOfWinners",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "joinCampaign",
    "inputs": [
      { "name": "_campaignId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getCampaign",
    "inputs": [
      { "name": "_campaignId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct QuestRewardsContract.Campaign",
        "components": [
          {
            "name": "campaignId",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "creator", "type": "address", "internalType": "address" },
          {
            "name": "rewardToken",
            "type": "address",
            "internalType": "contract IERC20"
          },
          {
            "name": "distributionMethod",
            "type": "uint8",
            "internalType": "enum QuestRewardsContract.RewardDistributionMethod"
          },
          {
            "name": "startTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "endTime", "type": "uint256", "internalType": "uint256" },
          {
            "name": "maxParticipants",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum QuestRewardsContract.CampaignStatus"
          },
          {
            "name": "totalRewardAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "platformFee",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "guaranteedRewardPerUser",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "depositRequired",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "numberOfWinners",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "totalParticipants",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "rewardsDistributed",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getParticipant",
    "inputs": [
      { "name": "_campaignId", "type": "uint256", "internalType": "uint256" },
      { "name": "_participant", "type": "address", "internalType": "address" }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct QuestRewardsContract.Participant",
        "components": [
          { "name": "isParticipant", "type": "bool", "internalType": "bool" },
          {
            "name": "questScore",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "joinedAt",
            "type": "uint256",
            "internalType": "uint256"
          },
          { "name": "rewardClaimed", "type": "bool", "internalType": "bool" }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "updateQuestScore",
    "inputs": [
      { "name": "_campaignId", "type": "uint256", "internalType": "uint256" },
      {
        "name": "_participant",
        "type": "address",
        "internalType": "address"
      },
      { "name": "_score", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "endCampaignAndDistribute",
    "inputs": [
      { "name": "_campaignId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "CampaignCreated",
    "inputs": [
      {
        "name": "campaignId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "rewardToken",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "distributionMethod",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum QuestRewardsContract.RewardDistributionMethod"
      },
      {
        "name": "totalRewardAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "startTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "endTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ParticipantJoined",
    "inputs": [
      {
        "name": "campaignId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "participant",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "timestamp",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RewardDistributed",
    "inputs": [
      {
        "name": "campaignId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "recipient",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "method",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum QuestRewardsContract.RewardDistributionMethod"
      }
    ],
    "anonymous": false
  }
] as const;

// Contract address - update this with your deployed contract address
// Example: Replace with your actual deployed contract address
export const QUEST_REWARDS_CONTRACT_ADDRESS = "0x742d35Cc6635C0532925a3b8D7Fb8d22567b9E52" as const;

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
