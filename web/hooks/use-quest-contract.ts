'use client';

import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { 
  QuestRewardsContractABI, 
  QUEST_REWARDS_CONTRACT_ADDRESS,
  Campaign,
  Participant,
  RewardDistributionMethod
} from '@/lib/contracts/quest-rewards-contract';
import { useCallback } from 'react';
import { parseEther, parseUnits } from 'viem';
import { getTokenAddress, TOKEN_METADATA } from '@/lib/contracts/tokens';

// Read hooks
export function useCampaign(campaignId: bigint) {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'getCampaign',
    args: [campaignId],
  });
}

export function useParticipant(campaignId: bigint, participantAddress: `0x${string}`) {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'getParticipant',
    args: [campaignId, participantAddress],
  });
}

export function useMinimumRewardAmount() {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'MINIMUM_REWARD_AMOUNT',
  });
}

export function usePlatformFeePercentage() {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'PLATFORM_FEE_PERCENTAGE',
  });
}

// Write hooks
export function useQuestContract() {
  const { writeContract, isPending, error, data } = useWriteContract();

  const createCampaign = useCallback((params: {
    rewardTokenType: 'USDC' | 'SEI';
    distributionMethod: RewardDistributionMethod;
    startTime: number;
    endTime: number;
    maxParticipants: number;
    totalRewardAmount: string; // in token format
    numberOfWinners: number;
  }) => {
    const startTimestamp = BigInt(Math.floor(params.startTime / 1000));
    const endTimestamp = BigInt(Math.floor(params.endTime / 1000));
    
    // Get the appropriate token address based on type
    const tokenAddress = getTokenAddress(params.rewardTokenType === 'SEI' ? 'WSEI' : 'USDC');
    
    // Parse amount based on token decimals
    const tokenDecimals = TOKEN_METADATA[params.rewardTokenType].decimals;
    const parsedAmount = parseUnits(params.totalRewardAmount, tokenDecimals);
    
    writeContract({
      address: QUEST_REWARDS_CONTRACT_ADDRESS,
      abi: QuestRewardsContractABI,
      functionName: 'createCampaign',
      args: [
        tokenAddress as `0x${string}`,
        params.distributionMethod,
        startTimestamp,
        endTimestamp,
        BigInt(params.maxParticipants),
        parsedAmount,
        BigInt(params.numberOfWinners),
      ],
    });
  }, [writeContract]);

  const joinCampaign = useCallback((campaignId: bigint) => {
    writeContract({
      address: QUEST_REWARDS_CONTRACT_ADDRESS,
      abi: QuestRewardsContractABI,
      functionName: 'joinCampaign',
      args: [campaignId],
    });
  }, [writeContract]);

  const updateQuestScore = useCallback((params: {
    campaignId: bigint;
    participant: `0x${string}`;
    score: number;
  }) => {
    writeContract({
      address: QUEST_REWARDS_CONTRACT_ADDRESS,
      abi: QuestRewardsContractABI,
      functionName: 'updateQuestScore',
      args: [params.campaignId, params.participant, BigInt(params.score)],
    });
  }, [writeContract]);

  const endCampaignAndDistribute = useCallback((campaignId: bigint) => {
    writeContract({
      address: QUEST_REWARDS_CONTRACT_ADDRESS,
      abi: QuestRewardsContractABI,
      functionName: 'endCampaignAndDistribute',
      args: [campaignId],
    });
  }, [writeContract]);

  return {
    createCampaign,
    joinCampaign,
    updateQuestScore,
    endCampaignAndDistribute,
    isPending,
    error,
    data,
  };
}

// Event watching hooks
export function useWatchCampaignCreated(onCampaignCreated?: (log: any) => void) {
  return useWatchContractEvent({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    eventName: 'CampaignCreated',
    onLogs: onCampaignCreated,
  });
}

export function useWatchParticipantJoined(onParticipantJoined?: (log: any) => void) {
  return useWatchContractEvent({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    eventName: 'ParticipantJoined',
    onLogs: onParticipantJoined,
  });
}

export function useWatchRewardDistributed(onRewardDistributed?: (log: any) => void) {
  return useWatchContractEvent({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    eventName: 'RewardDistributed',
    onLogs: onRewardDistributed,
  });
}
