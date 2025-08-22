'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import {
  useCampaign,
  useParticipant,
  useUserTotalQuestPoints,
  useUserTotalEarnings,
  useUserLevel,
  useQPForNextLevel,
  useCampaignParticipants,
  useCampaignWinners,
  useRewardEligibility
} from './use-quest-contract';
import { Campaign } from '@/lib/contracts/quest-rewards-contract';

// API response types
interface APICampaign {
  id: string;
  title: string;
  description: string;
  organizationName: string;
  organizationLogo?: string;
  questBanner?: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  rewardAmount: number;
  rewardType: string;
  distributionMethod: string;
  numberOfWinners?: number;
  ownerWallet: string;
  isActive: boolean;
  tasks: APITask[];
  submissionCount: number;
  createdAt: string;
}

interface APITask {
  id: string;
  type: string;
  title?: string;
  instruction?: string;
  completionCriteria?: string;
  enabled: boolean;
  accountToFollow?: string;
  postLimit?: number;
  hashtags: string[];
  accountsToTag: string[];
  customTitle?: string;
  customDescription?: string;
  qpReward: number;
}

interface UserStats {
  totalQP: number;
  totalEarnings: number;
  level: number;
  qpForNextLevel: number;
  completedQuests: number;
  createdCampaigns: number;
  participatedCampaigns: number;
  completedTasks: number;
  recentActivity: Array<{
    type: string;
    title: string;
    timestamp: string;
  }>;
}

interface LeaderboardUser {
  walletAddress: string;
  displayName: string;
  avatarUrl: string | null;
  totalQP: number;
  completedTasks: number;
  level: number;
  rank: number;
}

// Unified types
export interface UnifiedCampaign extends Campaign {
  // Off-chain data
  offChainId?: string;
  title?: string;
  description?: string;
  organizationName?: string;
  organizationLogo?: string;
  questBanner?: string;
  tasks?: APITask[];
  submissionCount?: number;
  createdAt?: string;

  // Computed properties
  isOffChainDataLoaded?: boolean;
  hasBothDataSources?: boolean;
}

export interface UnifiedUserStats {
  // Contract data
  contractQP?: bigint;
  contractEarnings?: bigint;
  contractLevel?: bigint;

  // API data
  apiQP?: number;
  apiEarnings?: number;
  apiLevel?: number;
  apiQpForNextLevel?: number;
  completedQuests?: number;
  createdCampaigns?: number;
  participatedCampaigns?: number;
  completedTasks?: number;
  recentActivity?: Array<{
    type: string;
    title: string;
    timestamp: string;
  }>;

  // Combined data (preferred source)
  totalQP: number;
  totalEarnings: number;
  level: number;
  qpForNextLevel: number;
  isLoaded: boolean;
}

// API fetch functions
const fetchAPICampaigns = async (ownerWallet?: string, status?: string): Promise<APICampaign[]> => {
  const params = new URLSearchParams();
  if (ownerWallet) params.append('ownerWallet', ownerWallet);
  if (status) params.append('status', status);

  const response = await fetch(`/api/campaigns?${params}`);
  if (!response.ok) throw new Error('Failed to fetch campaigns');
  const data = await response.json();
  return data.campaigns || [];
};

const fetchUserStats = async (userWallet: string): Promise<UserStats | null> => {
  try {
    const response = await fetch(`/api/user/stats?userWallet=${userWallet}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.stats || null;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
};

const fetchLeaderboard = async (limit = 10, offset = 0): Promise<LeaderboardUser[]> => {
  try {
    const response = await fetch(`/api/leaderboard?limit=${limit}&offset=${offset}`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.leaderboard || [];
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

// Unified hooks
export function useUnifiedCampaigns(status?: 'active' | 'completed' | 'all') {
  const { address } = useAccount();
  const [apiCampaigns, setApiCampaigns] = useState<APICampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch API campaigns
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const campaigns = await fetchAPICampaigns(address, status);
        setApiCampaigns(campaigns);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address, status]);

  return { apiCampaigns, loading, error };
}

export function useUnifiedCampaign(campaignId: bigint, offChainId?: string) {
  const contractCampaign = useCampaign(campaignId);
  const [offChainData, setOffChainData] = useState<APICampaign | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch off-chain data
  useEffect(() => {
    const fetchOffChainData = async () => {
      if (!offChainId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/campaigns/${offChainId}`);
        if (response.ok) {
          const data = await response.json();
          setOffChainData(data.campaign);
        }
      } catch (error) {
        console.error('Error fetching off-chain campaign data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffChainData();
  }, [offChainId]);

  // Combine contract and API data
  const unifiedCampaign: UnifiedCampaign | null = useMemo(() => {
    if (!contractCampaign.data && !offChainData) return null;

    const baseData = contractCampaign.data || {
      campaignId,
      creator: '0x' as `0x${string}`,
      rewardToken: '0x' as `0x${string}`,
      distributionMethod: 0,
      startTime: 0n,
      endTime: 0n,
      maxParticipants: 0n,
      status: 0,
      totalRewardAmount: 0n,
      platformFee: 0n,
      guaranteedRewardPerUser: 0n,
      depositRequired: 0n,
      numberOfWinners: 0n,
      totalParticipants: 0n,
      rewardsDistributed: false,
    };

    return {
      ...(baseData as Campaign),
      // Add off-chain data
      offChainId,
      title: offChainData?.title,
      description: offChainData?.description,
      organizationName: offChainData?.organizationName,
      organizationLogo: offChainData?.organizationLogo,
      questBanner: offChainData?.questBanner,
      tasks: offChainData?.tasks,
      submissionCount: offChainData?.submissionCount,
      createdAt: offChainData?.createdAt,
      // Status flags
      isOffChainDataLoaded: !!offChainData,
      hasBothDataSources: !!contractCampaign.data && !!offChainData,
    };
  }, [contractCampaign.data, offChainData, campaignId, offChainId]);

  return {
    unifiedCampaign,
    contractData: contractCampaign.data,
    offChainData,
    loading: contractCampaign.isLoading || loading,
    error: contractCampaign.error,
    isOffChainDataLoaded: !!offChainData,
    hasBothDataSources: !!contractCampaign.data && !!offChainData,
  };
}

export function useUnifiedUserStats() {
  const { address } = useAccount();
  const [apiStats, setApiStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Contract data - Note: contract functions may not exist, so we'll handle errors gracefully
  const contractQP = useUserTotalQuestPoints(address as `0x${string}`);
  const contractEarnings = useUserTotalEarnings(address as `0x${string}`);
  const contractLevel = useUserLevel(address as `0x${string}`);
  // const contractQpForNextLevel = useQPForNextLevel(address as `0x${string}`); // Function may not exist yet

  // Fetch API data
  useEffect(() => {
    const fetchData = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const stats = await fetchUserStats(address);
        setApiStats(stats);
      } catch (error) {
        console.error('Error fetching API user stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  // Combine contract and API data
  const unifiedStats: UnifiedUserStats = useMemo(() => {
    // Prefer API data for most stats, but use contract data as backup
    const totalQP = apiStats?.totalQP || Number(contractQP.data || 0n);
    const totalEarnings = apiStats?.totalEarnings || Number(contractEarnings.data || 0n);
    const level = apiStats?.level || Number(contractLevel.data || 1n);
    // For now, calculate QP for next level based on simple formula since contract function may not exist
    const qpForNextLevel = apiStats?.qpForNextLevel || ((Math.floor(totalQP / 500) + 1) * 500 - totalQP);

    return {
      // Raw data
      contractQP: contractQP.data as bigint | undefined,
      contractEarnings: contractEarnings.data as bigint | undefined,
      contractLevel: contractLevel.data as bigint | undefined,
      apiQP: apiStats?.totalQP,
      apiEarnings: apiStats?.totalEarnings,
      apiLevel: apiStats?.level,
      apiQpForNextLevel: apiStats?.qpForNextLevel,
      completedQuests: apiStats?.completedQuests,
      createdCampaigns: apiStats?.createdCampaigns,
      participatedCampaigns: apiStats?.participatedCampaigns,
      completedTasks: apiStats?.completedTasks,
      recentActivity: apiStats?.recentActivity,
      // Combined data
      totalQP,
      totalEarnings,
      level,
      qpForNextLevel,
      isLoaded: !contractQP.isLoading && !loading,
    };
  }, [
    apiStats,
    contractQP.data,
    contractQP.isLoading,
    contractEarnings.data,
    contractLevel.data,
    loading,
  ]);

  return unifiedStats;
}

export function useUnifiedLeaderboard(limit = 10, offset = 0) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchLeaderboard(limit, offset);
        setLeaderboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit, offset]);

  return { leaderboard, loading, error };
}

export function useUnifiedParticipant(campaignId: bigint, userAddress: `0x${string}`) {
  const contractParticipant = useParticipant(campaignId, userAddress);
  const [apiParticipation, setApiParticipation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check API participation
  useEffect(() => {
    const fetchParticipation = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId.toString()}/join?userWallet=${userAddress}`);
        if (response.ok) {
          const data = await response.json();
          setApiParticipation(data);
        }
      } catch (error) {
        console.error('Error fetching API participation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId && userAddress) {
      fetchParticipation();
    }
  }, [campaignId, userAddress]);

  return {
    contractData: contractParticipant.data,
    apiData: apiParticipation,
    hasJoinedContract: (contractParticipant.data as any)?.isParticipant || false,
    hasJoinedAPI: apiParticipation?.hasJoined || false,
    loading: contractParticipant.isLoading || loading,
    error: contractParticipant.error,
  };
}

export function useUnifiedJoinCampaign() {
  const { address } = useAccount();
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinCampaign = async (campaignId: string | bigint) => {
    if (!address) {
      setError("Wallet not connected");
      return false;
    }

    try {
      setIsJoining(true);
      setError(null);

      // Convert bigint to string for API call
      const campaignIdStr = typeof campaignId === 'bigint' ? campaignId.toString() : campaignId;

      // Step 1: Join via API (creates database record)
      const apiResponse = await fetch(`/api/campaigns/${campaignIdStr}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userWallet: address,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || 'Failed to join via API');
      }

      // Step 2: Join via contract (for on-chain record)
      // Note: This would typically be called via the contract hook
      // For now, we rely on the API to handle the database updates

      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join campaign';
      setError(errorMessage);
      console.error('Error joining campaign:', err);
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  return {
    joinCampaign,
    isJoining,
    error,
  };
}
