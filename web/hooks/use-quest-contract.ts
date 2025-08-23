'use client';

import { useReadContract, useWriteContract, useWatchContractEvent, useChainId, useAccount } from 'wagmi';
import {
  QuestRewardsContractABI,
  QUEST_REWARDS_CONTRACT_ADDRESS,
  Campaign,
  Participant,
  RewardDistributionMethod
} from '@/lib/contracts/quest-rewards-contract';

import { parseEther, parseUnits } from 'viem';
import { getTokenAddress, TOKEN_METADATA, ERC20_ABI } from '@/lib/contracts/tokens';
import { calculateTotalDeposit, RewardType } from '@/lib/types/campaign';
import { sei, seiTestnet } from 'viem/chains';
import { TOKEN_ADDRESSES } from '@/lib/contracts/tokens';

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

export function useNextCampaignId() {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'nextCampaignId',
  });
}

export function usePlatformFeePercentage() {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'PLATFORM_FEE_PERCENTAGE',
  });
}

// Token approval hooks
export function useTokenAllowance(tokenAddress: `0x${string}`, owner: `0x${string}` | undefined, spender: `0x${string}`) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: owner ? [owner, spender] : undefined,
    query: {
      enabled: !!owner && !!tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000',
    },
  });
}

export function useTokenBalance(tokenAddress: `0x${string}`, owner: `0x${string}` | undefined) {
  return useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: owner ? [owner] : undefined,
    query: {
      enabled: !!owner && !!tokenAddress && tokenAddress !== '0x0000000000000000000000000000000000000000',
    },
  });
}

// Write hooks
export function useQuestContract() {
  const { writeContractAsync, isPending, error, data } = useWriteContract();
  const { address } = useAccount();
  const chainId = useChainId();
  const isTestnet = chainId === seiTestnet.id;

  // Helper function to validate token addresses for current network
  const validateTokenAddress = (tokenSymbol: 'USDC' | 'SEI', address: string): boolean => {
    const network = isTestnet ? 'TESTNET' : 'MAINNET';
    const expectedAddress = TOKEN_ADDRESSES[network][tokenSymbol];
    return address.toLowerCase() === expectedAddress.toLowerCase();
  };

  // Token approval function
  const approveToken = async (params: {
    tokenAddress: `0x${string}`;
    amount: bigint;
  }) => {
    console.log("🔓 Approving token spend:", {
      tokenAddress: params.tokenAddress,
      spender: QUEST_REWARDS_CONTRACT_ADDRESS,
      amount: params.amount.toString(),
    });

    const hash = await writeContractAsync({
      address: params.tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [QUEST_REWARDS_CONTRACT_ADDRESS, params.amount],
    } as any);

    console.log("✅ Token approval transaction successful:", hash);
    return hash;
  };

  // Helper function to get token allowance (this will be used externally with the hook)
  const getTokenAllowanceParams = (tokenAddress: `0x${string}`) => ({
    tokenAddress,
    owner: address,
    spender: QUEST_REWARDS_CONTRACT_ADDRESS,
  });

  const createCampaign = async (params: {
    rewardTokenType: 'USDC' | 'SEI';
    distributionMethod: RewardDistributionMethod;
    startTime: number;
    endTime: number;
    maxParticipants: number;
    totalRewardAmount: string; // in token format
    numberOfWinners: number;
  }) => {
    // Validate all parameters are defined
    if (!params.rewardTokenType) throw new Error("rewardTokenType is required");
    if (params.distributionMethod === undefined || params.distributionMethod === null) throw new Error("distributionMethod is required");
    if (!params.startTime) throw new Error("startTime is required");
    if (!params.endTime) throw new Error("endTime is required");
    if (!params.maxParticipants) throw new Error("maxParticipants is required");
    if (!params.totalRewardAmount) throw new Error("totalRewardAmount is required");
    if (!params.numberOfWinners) throw new Error("numberOfWinners is required");

    const startTimestamp = BigInt(Math.floor(params.startTime / 1000));
    const endTimestamp = BigInt(Math.floor(params.endTime / 1000));

    // Note: Time validation has been removed from the contract
    // Start time and end time are now passed as-is without validation

    // Get the appropriate token address based on type and current network
    const tokenSymbol = params.rewardTokenType === 'SEI' ? 'SEI' : 'USDC';
    const tokenAddress = getTokenAddress(tokenSymbol, isTestnet);

    // Validate token address is not undefined
    if (!tokenAddress) {
      throw new Error(`Token address not found for symbol: ${tokenSymbol} on ${isTestnet ? 'SEI Testnet' : 'SEI Mainnet'}`);
    }

    // Validate token address format
    if (typeof tokenAddress !== 'string' || !tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
      throw new Error(`Invalid token address format: ${tokenAddress} for symbol: ${tokenSymbol}`);
    }

    // Validate token address matches expected address for current network
    if (!validateTokenAddress(tokenSymbol, tokenAddress)) {
      const network = isTestnet ? 'TESTNET' : 'MAINNET';
      const expectedAddress = TOKEN_ADDRESSES[network][tokenSymbol];
      throw new Error(
        `Token address mismatch for ${tokenSymbol} on ${isTestnet ? 'SEI Testnet' : 'SEI Mainnet'}. ` +
        `Expected: ${expectedAddress}, Got: ${tokenAddress}. ` +
        `This indicates a network configuration issue.`
      );
    }

    console.log("🪙 Contract call details:", {
      tokenSymbol,
      tokenAddress,
      network: isTestnet ? 'SEI Testnet' : 'SEI Mainnet',
      chainId,
      params: {
        rewardTokenType: params.rewardTokenType,
        distributionMethod: params.distributionMethod,
        startTime: params.startTime,
        endTime: params.endTime,
        maxParticipants: params.maxParticipants,
        totalRewardAmount: params.totalRewardAmount,
        numberOfWinners: params.numberOfWinners,
      }
    });

    // Parse amount based on token decimals
    const tokenDecimals = TOKEN_METADATA[params.rewardTokenType].decimals;
    const parsedRewardAmount = parseUnits(params.totalRewardAmount, tokenDecimals);

    // Calculate total deposit including platform fee
    const rewardAmount = parseFloat(params.totalRewardAmount);
    const totalDeposit = calculateTotalDeposit(rewardAmount, params.rewardTokenType === 'SEI' ? RewardType.SEI : RewardType.USDC);
    const parsedTotalDeposit = parseUnits(totalDeposit.toString(), tokenDecimals);

    console.log("💰 Fee calculation:", {
      rewardAmount: params.totalRewardAmount,
      totalDeposit: totalDeposit.toString(),
      platformFee: (totalDeposit - rewardAmount).toString(),
      parsedRewardAmount: parsedRewardAmount.toString(),
      parsedTotalDeposit: parsedTotalDeposit.toString()
    });

    // Prepare transaction options based on token type
    let txOptions: any;

    if (params.rewardTokenType === 'USDC') {
      // For USDC campaigns, use the new createCampaignWithUSDC function
      console.log("📡 Using createCampaignWithUSDC for USDC campaign");
      txOptions = {
        address: QUEST_REWARDS_CONTRACT_ADDRESS,
        abi: QuestRewardsContractABI,
        functionName: 'createCampaignWithUSDC',
        args: [
          params.distributionMethod,
          startTimestamp,
          endTimestamp,
          BigInt(params.maxParticipants),
          parsedRewardAmount,
          BigInt(params.numberOfWinners),
        ],
      };
    } else {
      // For SEI campaigns, use the original createCampaign function
      console.log("📡 Using createCampaign for SEI campaign");
      txOptions = {
        address: QUEST_REWARDS_CONTRACT_ADDRESS,
        abi: QuestRewardsContractABI,
        functionName: 'createCampaign',
        args: [
          tokenAddress as `0x${string}`,
          params.distributionMethod,
          startTimestamp,
          endTimestamp,
          BigInt(params.maxParticipants),
          parsedRewardAmount,
          BigInt(params.numberOfWinners),
        ],
        value: parsedTotalDeposit, // Send total amount including platform fee
      };
    }

    console.log("📡 Preparing contract call:", {
      contractAddress: QUEST_REWARDS_CONTRACT_ADDRESS,
      functionName: txOptions.functionName,
      args: txOptions.args,
      value: txOptions.value || '0',
    });

    try {
      const hash = await writeContractAsync(txOptions);

      console.log("✅ Contract call successful, transaction hash:", hash);
      return hash;
    } catch (contractError) {
      console.error("❌ Contract call failed:", {
        error: contractError,
        message: contractError.message,
        cause: contractError.cause,
        network: isTestnet ? 'SEI Testnet' : 'SEI Mainnet',
        chainId,
        tokenAddress,
        totalDeposit: parsedTotalDeposit.toString(),
        functionName: txOptions.functionName,
      });

      // Provide specific error messages for common issues
      if (contractError.message?.includes('awaiting_internal_transactions')) {
        throw new Error(
          `Transaction is stuck awaiting internal transactions. This usually indicates a network issue. ` +
          `Please check: 1) You're connected to the correct network (${isTestnet ? 'SEI Testnet' : 'SEI Mainnet'}), ` +
          `2) You have sufficient funds for gas and the total deposit amount, ` +
          `3) The token contract addresses are correct for this network. ` +
          `Transaction details: Chain ID: ${chainId}, Token: ${tokenAddress}, Amount: ${parsedTotalDeposit.toString()}`
        );
      }

      if (contractError.message?.includes('insufficient funds')) {
        throw new Error(
          `Insufficient funds for transaction. You need at least ${totalDeposit.toString()} ${params.rewardTokenType} ` +
          `(including ${((totalDeposit - parseFloat(params.totalRewardAmount)) * 100 / parseFloat(params.totalRewardAmount)).toFixed(1)}% platform fee)`
        );
      }

      throw contractError;
    }
  };

  const joinCampaign = async (campaignId: bigint) => {
    const hash = await writeContractAsync({
      address: QUEST_REWARDS_CONTRACT_ADDRESS,
      abi: QuestRewardsContractABI,
      functionName: 'joinCampaign',
      args: [campaignId],
    } as any);
    return hash;
  };

  const updateQuestScore = async (params: {
    campaignId: bigint;
    participant: `0x${string}`;
    score: number;
  }) => {
    const hash = await writeContractAsync({
      address: QUEST_REWARDS_CONTRACT_ADDRESS,
      abi: QuestRewardsContractABI,
      functionName: 'updateQuestScore',
      args: [params.campaignId, params.participant, BigInt(params.score)],
    } as any);
    return hash;
  };

  const endCampaignAndDistribute = async (campaignId: bigint) => {
    const hash = await writeContractAsync({
      address: QUEST_REWARDS_CONTRACT_ADDRESS,
      abi: QuestRewardsContractABI,
      functionName: 'endCampaignAndDistribute',
      args: [campaignId],
    } as any);
    return hash;
  };



  // Diagnostic function to help debug network issues
  const diagnoseNetworkConfig = () => {
    const network = isTestnet ? 'TESTNET' : 'MAINNET';
    const expectedUSDC = TOKEN_ADDRESSES[network].USDC;
    const expectedSEI = TOKEN_ADDRESSES[network].SEI;

    return {
      currentNetwork: isTestnet ? 'SEI Testnet' : 'SEI Mainnet',
      chainId,
      expectedTokens: {
        USDC: expectedUSDC,
        SEI: expectedSEI,
      },
      contractAddress: QUEST_REWARDS_CONTRACT_ADDRESS,
    };
  };

  return {
    createCampaign,
    joinCampaign,
    updateQuestScore,
    endCampaignAndDistribute,
    approveToken,
    getTokenAllowanceParams,
    diagnoseNetworkConfig,
    isPending,
    error,
    data,
  };
}

// Read hooks for user dashboard
export function useUserTotalQuestPoints(user: `0x${string}`) {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'getUserTotalQuestPoints',
    args: [user],
  });
}

export function useUserTotalEarnings(user: `0x${string}`) {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'getUserTotalEarnings',
    args: [user],
  });
}

export function useUserLevel(user: `0x${string}`) {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'getUserLevel',
    args: [user],
  });
}

export function useQPForNextLevel(user: `0x${string}`) {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'getQPForNextLevel',
    args: [user],
  });
}

export function useCampaignParticipants(campaignId: bigint) {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'getParticipants',
    args: [campaignId],
  });
}

export function useCampaignWinners(campaignId: bigint) {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'getWinners',
    args: [campaignId],
  });
}

export function useRewardEligibility(campaignId: bigint, user: `0x${string}`) {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'isEligibleForReward',
    args: [campaignId, user],
  });
}

// Platform fee management hooks
export function usePlatformFeeBalance(tokenAddress: `0x${string}`) {
  return useReadContract({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    functionName: 'getPlatformFeeBalance',
    args: [tokenAddress],
  });
}

export function useWithdrawPlatformFees() {
  const { writeContractAsync, isPending, error, data } = useWriteContract();

  const withdrawPlatformFees = async (params: {
    tokenAddress: `0x${string}`;
    amount: bigint;
    to: `0x${string}`;
  }) => {
    return writeContractAsync({
      address: QUEST_REWARDS_CONTRACT_ADDRESS,
      abi: QuestRewardsContractABI,
      functionName: 'withdrawPlatformFees',
      args: [params.tokenAddress, params.amount, params.to],
    } as any);
  };

  return {
    withdrawPlatformFees,
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

// Platform fee event watching hooks
export function useWatchPlatformFeeCollected(onPlatformFeeCollected?: (log: any) => void) {
  return useWatchContractEvent({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    eventName: 'PlatformFeeCollected',
    onLogs: onPlatformFeeCollected,
  });
}

export function useWatchPlatformFeeWithdrawn(onPlatformFeeWithdrawn?: (log: any) => void) {
  return useWatchContractEvent({
    address: QUEST_REWARDS_CONTRACT_ADDRESS,
    abi: QuestRewardsContractABI,
    eventName: 'PlatformFeeWithdrawn',
    onLogs: onPlatformFeeWithdrawn,
  });
}
