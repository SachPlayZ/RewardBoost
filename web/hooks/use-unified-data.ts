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
  useRewardEligibility,
  useQuestContract
} from './use-quest-contract';
import { Campaign } from '@/lib/contracts/quest-rewards-contract';

// API response types
export interface APICampaign {
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
  status: string;
  funded: boolean;
  blockchainTxHash?: string;
  blockchainCampaignId?: number | null;
  knowledgeBase?: {
    enabled: boolean;
    pdfFileName?: string;
    pdfUrl?: string;
    knowledgeBaseId?: string;
    status?: 'uploading' | 'processing' | 'ready' | 'error';
    errorMessage?: string;
    manualText?: string;
  };
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
  // Only add ownerWallet if it's a valid string
  if (ownerWallet && ownerWallet.trim()) params.append('ownerWallet', ownerWallet.toLowerCase());
  // Always add status parameter, even if it's 'all'
  if (status) params.append('status', status);

  const url = `/api/campaigns?${params}`;
  console.log(`📋 fetchAPICampaigns: Making request to ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`📋 fetchAPICampaigns: HTTP ${response.status} error`);
    throw new Error('Failed to fetch campaigns');
  }

  const data = await response.json();
  console.log(`📋 fetchAPICampaigns: Received data:`, data);
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

// Consolidated campaign fetch hook - single source of truth
export function useValidatedCampaigns(status?: 'active' | 'completed' | 'draft' | 'all') {
  const { address } = useAccount();
  const [apiCampaigns, setApiCampaigns] = useState<APICampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch API campaigns with consolidated logging
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (isMounted) setLoading(true);
        const fetchAddress = address || null;
        console.log(`📋 useValidatedCampaigns("${status || 'all'}"): Starting fetch with address: ${fetchAddress || 'none (fetching all campaigns)'}`);
        const campaigns = await fetchAPICampaigns(address, status);

        if (isMounted) {
          console.log(`📋 useValidatedCampaigns("${status || 'all'}"): Fetched ${campaigns.length} campaigns from API`);
          console.log(`📋 API Response:`, campaigns);

          if (campaigns.length > 0) {
            campaigns.forEach(campaign => {
              console.log(`📋 Campaign ${campaign.id}:`, {
                title: campaign.title,
                ownerWallet: campaign.ownerWallet,
                funded: campaign.funded,
                status: campaign.status
              });
            });
          } else {
            console.log(`📋 No campaigns found. Checking API response structure...`);
            console.log(`📋 Full API response:`, JSON.stringify(await fetchAPICampaigns(address, status), null, 2));
          }

          setApiCampaigns(campaigns);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error(`📋 useValidatedCampaigns("${status || 'all'}"): Error fetching campaigns:`, err);
          setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [address, status]);

  return {
    apiCampaigns,
    loading,
    error,
    totalCampaigns: apiCampaigns.length,
    validatedCount: apiCampaigns.length // For now, all campaigns are "validated"
  };
}

// DEPRECATED: Use useValidatedCampaigns instead - this function is kept for backward compatibility
export function useUnifiedCampaigns(status?: 'active' | 'completed' | 'draft' | 'all') {
  const { address } = useAccount();
  const [apiCampaigns, setApiCampaigns] = useState<APICampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch API campaigns using the consolidated function
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const campaigns = await fetchAPICampaigns(address, status);

        console.log(`📋 useUnifiedCampaigns("${status || 'all'}"): Fetched ${campaigns.length} campaigns from API`);

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

// Hook to check user participation status for a campaign
export function useCampaignParticipation(campaignId: string, userWallet: string) {
  const [participationStatus, setParticipationStatus] = useState<{
    isOwner: boolean;
    hasJoined: boolean;
    joinedAt: Date | null;
    submissionStatus: string | null;
    submissionCount: number;
    isLoading: boolean;
    error: string | null;
  }>({
    isOwner: false,
    hasJoined: false,
    joinedAt: null,
    submissionStatus: null,
    submissionCount: 0,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const checkParticipation = async () => {
      if (!campaignId || !userWallet) {
        setParticipationStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        setParticipationStatus(prev => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch('/api/campaigns/participation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            campaignId,
            userWallet: userWallet.toLowerCase()
          })
        });

        if (!response.ok) {
          throw new Error('Failed to check participation status');
        }

        const data = await response.json();

        if (data.success) {
          setParticipationStatus({
            ...data.participationStatus,
            isLoading: false,
            error: null
          });
        } else {
          throw new Error(data.error || 'Failed to check participation');
        }
      } catch (err) {
        console.error('Error checking participation status:', err);
        setParticipationStatus(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to check participation'
        }));
      }
    };

    checkParticipation();
  }, [campaignId, userWallet]);

  return participationStatus;
}

export function useUnifiedJoinCampaign() {
  const { address } = useAccount();
  const { joinCampaign: joinCampaignContract } = useQuestContract();
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

      console.log('🔍 Join attempt for campaign ID:', campaignIdStr);
      console.log('🔍 Campaign ID type:', typeof campaignIdStr);

      // Step 1: Check if campaign has blockchain campaign ID
      console.log('🔍 Checking campaign blockchain status...');
      const apiUrl = `/api/campaigns/${campaignIdStr}`;
      console.log('🔍 Calling API URL:', apiUrl);

      const campaignResponse = await fetch(apiUrl);
      if (!campaignResponse.ok) {
        throw new Error('Failed to fetch campaign details');
      }

      const campaignData = await campaignResponse.json();
      const campaign = campaignData.campaign;

      // Debug logging to show what data we're receiving
      console.log('🔍 Campaign data received from API:', {
        id: campaign.id,
        status: campaign.status,
        funded: campaign.funded,
        blockchainCampaignId: campaign.blockchainCampaignId,
        blockchainCampaignIdType: typeof campaign.blockchainCampaignId,
        isNull: campaign.blockchainCampaignId === null,
        isUndefined: campaign.blockchainCampaignId === undefined,
        isFalsy: !campaign.blockchainCampaignId,
        isZero: campaign.blockchainCampaignId === 0,
      });

      if (campaign.blockchainCampaignId === null || campaign.blockchainCampaignId === undefined) {
        console.log('❌ Campaign rejected as unfunded:', campaign.blockchainCampaignId);
        throw new Error('Campaign is not yet funded on the blockchain. Please wait for the campaign creator to fund it.');
      }

      console.log('✅ Campaign approved for joining:', campaign.blockchainCampaignId);

      // Use the blockchain campaign ID for contract calls
      const contractCampaignIdBigInt = BigInt(campaign.blockchainCampaignId);
      console.log('📋 Using blockchain campaign ID:', campaign.blockchainCampaignId);

      // Step 2: Join via contract (for on-chain record) - FIRST
      console.log('🔄 Step 2: Joining via contract...');
      const contractHash = await joinCampaignContract(contractCampaignIdBigInt);
      console.log('✅ Contract join successful, transaction hash:', contractHash);

      // Step 3: Join via API (creates database record) - ONLY if contract call succeeds
      console.log('🔄 Step 3: Joining via API...');
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
        console.error('❌ API join failed after successful contract join:', errorData);
        // Contract join succeeded but API failed
        // This is a data consistency issue, but the onchain record exists
        console.warn('⚠️ API join failed after contract join. User has onchain record but no database record.');
        throw new Error(errorData.error || 'Failed to join via API after contract join');
      }

      console.log('✅ API join successful');
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
