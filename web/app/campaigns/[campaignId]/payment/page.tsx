"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useChainId } from "wagmi";
import { seiTestnet } from "viem/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  useQuestContract,
  useTokenAllowance,
  useTokenBalance,
} from "@/hooks/use-quest-contract";
import { getTokenAddress, TOKEN_METADATA } from "@/lib/contracts/tokens";
import { parseUnits } from "viem";
import {
  calculatePlatformFee,
  calculateTotalDeposit,
  getDepositBreakdown,
  RewardType,
} from "@/lib/types/campaign";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Gift,
  Users,
} from "lucide-react";
import { toUnixTimestampUTC, ensureFutureTimestamp } from "@/lib/utils";
import { useNextCampaignId } from "@/hooks/use-quest-contract";
import { usePublicClient } from "wagmi";

interface Campaign {
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
  rewardType: "USDC" | "SEI";
  distributionMethod: "lucky_draw" | "equal_distribution";
  numberOfWinners?: number;
  ownerWallet: string;
  status: string;
  funded: boolean;
  tasks: Task[];
  submissionCount: number;
  createdAt: string;
}

interface Task {
  id: string;
  type: "x_follow" | "x_post" | "custom";
  title: string;
  instruction: string;
  completionCriteria: string;
  enabled: boolean;
}

export default function PaymentPage() {
  const { campaignId } = useParams();
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const isTestnet = chainId === seiTestnet.id;
  const publicClient = usePublicClient();
  const { data: nextCampaignId } = useNextCampaignId();
  const {
    createCampaign,
    isPending,
    diagnoseNetworkConfig,
    approveToken,
    getTokenAllowanceParams,
  } = useQuestContract();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalStep, setApprovalStep] = useState<
    "check" | "approve" | "approved" | "ready"
  >("check");

  // Get token info for USDC campaigns
  const tokenAddress =
    campaign?.rewardType === "USDC" ? getTokenAddress("USDC", isTestnet) : null;
  const totalDeposit = campaign
    ? calculateTotalDeposit(
        campaign.rewardAmount,
        campaign.rewardType === "SEI" ? RewardType.SEI : RewardType.USDC
      )
    : 0;
  const requiredAmount =
    campaign?.rewardType === "USDC"
      ? parseUnits(totalDeposit.toString(), TOKEN_METADATA.USDC.decimals)
      : BigInt(0);

  // Check token allowance for USDC campaigns
  const { data: currentAllowance, refetch: refetchAllowance } =
    useTokenAllowance(
      tokenAddress as `0x${string}`,
      address,
      getTokenAllowanceParams(tokenAddress as `0x${string}`).spender
    );

  // Check token balance for USDC campaigns
  const { data: tokenBalance } = useTokenBalance(
    tokenAddress as `0x${string}`,
    address
  );

  // Load campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/campaigns/${campaignId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch campaign");
        }

        const data = await response.json();
        setCampaign(data.campaign);

        // Debug logging
        console.log("🔍 Owner check:", {
          campaignOwner: data.campaign.ownerWallet,
          currentAddress: address,
          isSame:
            data.campaign.ownerWallet?.toLowerCase() === address?.toLowerCase(),
        });

        // Check if user is the owner (case-insensitive comparison)
        if (
          data.campaign.ownerWallet?.toLowerCase() !== address?.toLowerCase()
        ) {
          setError("You are not the owner of this campaign");
          return;
        }

        // Check if campaign is in draft status
        if (data.campaign.status !== "draft") {
          setError("This campaign is not in draft status");
          return;
        }
      } catch (err) {
        console.error("Error fetching campaign:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load campaign"
        );
      } finally {
        setLoading(false);
      }
    };

    if (campaignId && address) {
      fetchCampaign();
    }
  }, [campaignId, address]);

  // Check approval status for USDC campaigns
  useEffect(() => {
    if (
      campaign?.rewardType === "USDC" &&
      currentAllowance !== undefined &&
      requiredAmount > 0
    ) {
      const hasEnoughAllowance = (currentAllowance as bigint) >= requiredAmount;
      setApprovalStep(hasEnoughAllowance ? "ready" : "approve");
    } else if (campaign?.rewardType === "SEI") {
      setApprovalStep("ready"); // No approval needed for native SEI
    }
  }, [campaign, currentAllowance, requiredAmount]);

  const handleApproveToken = async () => {
    if (!campaign || !tokenAddress || campaign.rewardType !== "USDC") {
      return;
    }

    try {
      setIsApproving(true);
      console.log("🔓 Approving USDC spend for campaign activation...");

      const hash = await approveToken({
        tokenAddress: tokenAddress as `0x${string}`,
        amount: requiredAmount,
      });

      console.log("✅ Token approval successful:", hash);
      setApprovalStep("approved");

      // Refetch allowance to confirm approval
      setTimeout(() => {
        refetchAllowance();
      }, 2000);
    } catch (error) {
      console.error("❌ Token approval failed:", error);
      alert(error instanceof Error ? error.message : "Failed to approve token");
    } finally {
      setIsApproving(false);
    }
  };

  const handleActivateCampaign = async () => {
    if (!campaign || !isConnected || !address) {
      return;
    }

    try {
      setIsActivating(true);
      console.log("🚀 Activating campaign on blockchain...");

      // Prepare campaign data for contract call
      const startTimestamp = toUnixTimestampUTC(campaign.startDate);
      const endTimestamp = toUnixTimestampUTC(campaign.endDate);
      const currentTime = Math.floor(Date.now() / 1000);

      // Validate timestamps are valid
      if (startTimestamp === null) {
        throw new Error(`Invalid start date format: ${campaign.startDate}`);
      }
      if (endTimestamp === null) {
        throw new Error(`Invalid end date format: ${campaign.endDate}`);
      }

      // Debug logging for timezone issues
      console.log("🔍 Timestamp Debug:", {
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        startTimestamp,
        endTimestamp,
        currentTime,
        isStartInFuture: startTimestamp > currentTime,
        timeDifference: startTimestamp - currentTime,
        readableStart: new Date(startTimestamp * 1000).toISOString(),
        readableCurrent: new Date(currentTime * 1000).toISOString(),
      });

      // Use start time as provided (no validation needed)
      const safeStartTime = startTimestamp;

      const campaignData = {
        rewardTokenType: campaign.rewardType,
        distributionMethod:
          campaign.distributionMethod === "lucky_draw" ? 0 : 1,
        startTime: safeStartTime,
        endTime: endTimestamp,
        maxParticipants: campaign.maxParticipants,
        totalRewardAmount: campaign.rewardAmount.toString(),
        numberOfWinners: campaign.numberOfWinners || 1,
      };

      console.log("📡 Creating campaign on blockchain:", campaignData);

      // Get the nextCampaignId before creating the campaign
      console.log("📖 Getting nextCampaignId before campaign creation...");
      const nextIdBefore = nextCampaignId;
      console.log(
        "📊 nextCampaignId before creation:",
        nextIdBefore?.toString()
      );

      // Create campaign on blockchain
      const txHash = await createCampaign(campaignData);
      console.log("✅ Blockchain transaction successful:", txHash);

      // Wait for transaction to be mined
      console.log("⏳ Waiting for transaction confirmation...");
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds for mining

      // The blockchain campaign ID should be the nextCampaignId value we got before creation
      // This is because the contract increments nextCampaignId after assigning it to the new campaign
      let blockchainCampaignId = nextIdBefore?.toString();

      // Fallback if we couldn't get the nextCampaignId
      if (!blockchainCampaignId) {
        console.warn(
          "⚠️ Could not get nextCampaignId, using timestamp as fallback"
        );
        blockchainCampaignId = Date.now().toString();
      }

      console.log("🎯 Blockchain campaign ID assigned:", blockchainCampaignId);

      // Activate campaign in database
      const activateResponse = await fetch(
        `/api/campaigns/${campaignId}/activate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blockchainTxHash: txHash,
            blockchainCampaignId: blockchainCampaignId,
          }),
        }
      );

      if (!activateResponse.ok) {
        throw new Error("Failed to activate campaign in database");
      }

      console.log("✅ Campaign activated successfully!");

      // Redirect to campaign page
      router.push(`/campaigns/${campaignId}`);
    } catch (error) {
      console.error("❌ Campaign activation failed:", error);
      alert(
        error instanceof Error ? error.message : "Failed to activate campaign"
      );
    } finally {
      setIsActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error || "Campaign not found"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const platformFee = calculatePlatformFee(campaign.rewardAmount);
  const depositBreakdown = getDepositBreakdown(
    campaign.rewardAmount,
    campaign.rewardType === "SEI" ? RewardType.SEI : RewardType.USDC
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Activate Campaign</h1>
              <p className="text-muted-foreground">
                Complete payment to launch your quest
              </p>
            </div>
          </div>
          <Badge variant="secondary">Draft</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Campaign Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Campaign Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{campaign.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {campaign.description}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{campaign.maxParticipants} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {campaign.rewardAmount} {campaign.rewardType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>
                    Starts {new Date(campaign.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span>{campaign.tasks.length} tasks</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Required
              </CardTitle>
              <CardDescription>
                Complete this payment to activate your campaign on the
                blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Campaign Rewards:</span>
                  <span className="font-medium">
                    {depositBreakdown.rewards}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Platform Fee (5%):</span>
                  <span className="font-medium">
                    {depositBreakdown.platformFee}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total:</span>
                  <span>{depositBreakdown.total}</span>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This amount will be transferred to the smart contract to fund
                  your campaign rewards. The platform fee helps maintain and
                  improve the service.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Action Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Complete Activation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Connect your wallet to continue
                </p>
                <ConnectButton />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Wallet Connected:</strong> {address?.slice(0, 6)}...
                    {address?.slice(-4)}
                  </p>
                  {campaign.rewardType === "USDC" && tokenBalance && (
                    <p className="text-sm text-muted-foreground">
                      <strong>USDC Balance:</strong>{" "}
                      {(
                        Number(tokenBalance) /
                        Math.pow(10, TOKEN_METADATA.USDC.decimals)
                      ).toFixed(2)}{" "}
                      USDC
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const config = diagnoseNetworkConfig();
                      console.log(
                        "🔧 Network Configuration Diagnostics:",
                        config
                      );
                      alert(
                        `Network Config:\n${JSON.stringify(config, null, 2)}`
                      );
                    }}
                  >
                    🔧 Diagnose Network
                  </Button>
                </div>

                {/* Token Approval Section for USDC */}
                {campaign.rewardType === "USDC" && approvalStep !== "ready" && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Before activating your campaign, you need to approve the
                      smart contract to spend your USDC tokens.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Approval Step */}
                {campaign.rewardType === "USDC" &&
                  approvalStep === "approve" && (
                    <Button
                      onClick={handleApproveToken}
                      disabled={isApproving}
                      className="w-full"
                      size="lg"
                      variant="outline"
                    >
                      {isApproving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Approving USDC...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve {totalDeposit} USDC
                        </>
                      )}
                    </Button>
                  )}

                {/* Success message for approval */}
                {campaign.rewardType === "USDC" &&
                  approvalStep === "approved" && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        ✅ USDC approval successful! You can now activate your
                        campaign.
                      </AlertDescription>
                    </Alert>
                  )}

                {/* Activation Button */}
                <Button
                  onClick={handleActivateCampaign}
                  disabled={
                    isActivating ||
                    isPending ||
                    (campaign.rewardType === "USDC" && approvalStep !== "ready")
                  }
                  className="w-full"
                  size="lg"
                >
                  {isActivating || isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Activating Campaign...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      {campaign.rewardType === "USDC" &&
                      approvalStep !== "ready"
                        ? `Approve USDC First`
                        : `Pay ${totalDeposit} ${campaign.rewardType} & Activate`}
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {campaign.rewardType === "USDC"
                    ? "First approve USDC spending, then activate your campaign. Both transactions cannot be reversed once confirmed."
                    : "By clicking this button, you agree to fund the campaign with the specified amount. The transaction cannot be reversed once confirmed."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
