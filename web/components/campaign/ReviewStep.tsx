"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "@/components/ui/form";
import {
  CampaignFormData,
  DistributionMethod,
  TaskType,
  calculateTotalDeposit,
  getDepositBreakdown,
  calculatePlatformFee,
  PLATFORM_FEE_PERCENTAGE,
} from "@/lib/types/campaign";
import { useQuestContract } from "@/hooks/use-quest-contract";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  CheckCircle,
  Calendar,
  Users,
  Gift,
  Twitter,
  Hash,
  AtSign,
  MessageSquare,
  Target,
  DollarSign,
  Info,
  Clock,
  Zap,
} from "lucide-react";

interface ReviewStepProps {
  data: CampaignFormData;
}

export function ReviewStep({ data }: ReviewStepProps) {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { getValues } = useFormContext<CampaignFormData>();
  const { isConnected, address } = useAccount();
  const { createCampaign, isPending } = useQuestContract();

  const totalDeposit = calculateTotalDeposit(
    data.rewardConfig?.amount || 0,
    data.rewardConfig?.type
  );
  const depositBreakdown = getDepositBreakdown(
    data.rewardConfig?.amount || 0,
    data.rewardConfig?.type
  );
  const enabledTasks =
    data.compulsoryTasks?.filter((task) => task.enabled) || [];

  const handleDepositAndCreate = async () => {
    console.log("🚀 Deposit & Create button clicked!");

    if (!isConnected) {
      console.log("❌ Wallet not connected");
      alert("Please connect your wallet first");
      return;
    }

    if (!address) {
      console.log("❌ Wallet address not found");
      alert("Wallet address not found");
      return;
    }

    console.log("✅ Wallet connected:", address);
    console.log("📊 Form data:", data);

    try {
      setIsCreating(true);
      console.log("🔄 Starting campaign creation process...");

      // Get form data
      console.log("📝 Getting form values...");
      const formData = getValues();
      console.log("📋 Form data retrieved:", formData);

      // Step 1: Create campaign in database via API
      console.log("📡 Creating campaign in database...");
      const campaignData = {
        title: formData.title,
        description:
          formData.description || "Join our quest campaign and earn rewards!",
        organizationName: formData.organizationName,
        organizationLogo: formData.organizationLogo,
        questBanner: formData.questBanner,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        maxParticipants: formData.maxParticipants,
        rewardAmount: formData.rewardConfig.amount,
        rewardType: formData.rewardConfig.type,
        distributionMethod:
          formData.rewardConfig.distributionMethod ===
          DistributionMethod.LUCKY_DRAW
            ? "lucky_draw"
            : "equal_distribution",
        numberOfWinners: formData.rewardConfig.numberOfWinners,
        ownerWallet: address,
        tasks:
          formData.compulsoryTasks?.map((task) => ({
            type:
              task.type === TaskType.X_FOLLOW
                ? "x_follow"
                : task.type === TaskType.X_POST
                ? "x_post"
                : "custom",
            title: task.customTitle || `${task.type} task`,
            instruction:
              task.customDescription || `Complete the ${task.type} task`,
            completionCriteria: `Successfully complete the ${task.type} task`,
            enabled: task.enabled,
            accountToFollow: task.accountToFollow,
            postLimit: task.postLimit,
            hashtags: task.hashtags || [],
            accountsToTag: task.accountsToTag || [],
            customTitle: task.customTitle,
            customDescription: task.customDescription,
            qpReward:
              task.type === TaskType.X_FOLLOW
                ? 10 // Follow task: 10 QP
                : task.type === TaskType.X_POST
                ? 50 // Post task: 50 QP
                : 10, // Custom tasks: 10 QP default
          })) || [],
      };

      console.log("📤 Sending API request with data:", campaignData);
      console.log("📝 Description being sent:", campaignData.description);
      console.log(
        "📏 Description length:",
        campaignData.description?.length || 0
      );

      // Save campaign as draft in database
      const apiResponse = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      console.log("📥 API response status:", apiResponse.status);

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error("❌ API error:", errorText);
        throw new Error(`Failed to save draft campaign: ${errorText}`);
      }

      const { campaignId } = await apiResponse.json();
      console.log("✅ Draft campaign saved:", campaignId);

      // Redirect to payment page instead of creating blockchain campaign
      console.log("🔄 Redirecting to payment page...");
      router.push(`/campaigns/${campaignId}/payment`);

      return; // Exit here, redirect to payment page instead
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const calculateDuration = () => {
    if (!data.startDate || !data.endDate) return "Not set";
    const diffTime = data.endDate.getTime() - data.startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  };

  const calculateRewardPerWinner = () => {
    if (!data.rewardConfig) return "0";

    if (
      data.rewardConfig.distributionMethod === DistributionMethod.LUCKY_DRAW
    ) {
      return data.rewardConfig.numberOfWinners
        ? (
            data.rewardConfig.amount / data.rewardConfig.numberOfWinners
          ).toFixed(2)
        : "0";
    } else {
      return data.maxParticipants
        ? (data.rewardConfig.amount / data.maxParticipants).toFixed(2)
        : "0";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Review & Deploy</h2>
        <p className="text-muted-foreground">
          Review all campaign details before deployment to the blockchain
        </p>
      </div>

      {/* Campaign Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Campaign Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">
              {data.title || "Untitled Campaign"}
            </h3>
            <p className="text-muted-foreground mt-1">
              {data.description || "No description provided"}
            </p>

            {data.organizationName && (
              <div className="mt-3 flex items-center gap-3">
                {data.organizationLogo && (
                  <img
                    src={data.organizationLogo}
                    alt="Organization logo"
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <span className="text-sm font-medium text-muted-foreground">
                  {data.organizationName}
                </span>
              </div>
            )}
          </div>

          {data.questBanner && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Quest Banner
              </div>
              <div className="mt-2 w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={data.questBanner}
                  alt="Quest banner"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden"
                    );
                  }}
                />
                <div className="hidden text-muted-foreground text-sm">
                  Failed to load image
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline & Participation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline & Participation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Start Date
              </div>
              <div className="mt-1 font-medium">
                {data.startDate ? format(data.startDate, "PPP") : "Not set"}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                End Date
              </div>
              <div className="mt-1 font-medium">
                {data.endDate ? format(data.endDate, "PPP") : "Not set"}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                Duration
              </div>
              <div className="mt-1 font-medium">{calculateDuration()}</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              Maximum Participants
            </div>
            <div className="mt-1 text-xl font-semibold">
              {data.maxParticipants?.toLocaleString() || 0}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Tasks */}
      {enabledTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitter className="h-5 w-5" />
              Required Social Tasks ({enabledTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enabledTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {task.type === TaskType.X_FOLLOW ? (
                      <Twitter className="h-4 w-4" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                    <h4 className="font-medium">
                      {task.type === TaskType.X_FOLLOW
                        ? "X/Twitter Follow"
                        : "X/Twitter Post"}
                    </h4>
                    <Badge variant="secondary">
                      {task.type === TaskType.X_FOLLOW ? "10 XP" : "50 XP"}
                    </Badge>
                  </div>

                  {task.type === TaskType.X_FOLLOW && task.accountToFollow && (
                    <div className="flex items-center gap-2 text-sm">
                      <AtSign className="h-3 w-3" />
                      <span>Follow: {task.accountToFollow}</span>
                    </div>
                  )}

                  {task.type === TaskType.X_POST && (
                    <div className="space-y-2 text-sm">
                      <div>Post limit: {task.postLimit}</div>
                      {task.hashtags && task.hashtags.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3" />
                          <span>
                            Hashtags:{" "}
                            {task.hashtags
                              .map((hashtag) =>
                                hashtag.startsWith("#")
                                  ? hashtag
                                  : `#${hashtag}`
                              )
                              .join(", ")}
                          </span>
                        </div>
                      )}
                      {task.accountsToTag && task.accountsToTag.length > 0 && (
                        <div className="flex items-center gap-2">
                          <AtSign className="h-3 w-3" />
                          <span>
                            Tags:{" "}
                            {task.accountsToTag
                              .map((account) =>
                                account.startsWith("@")
                                  ? account
                                  : `@${account}`
                              )
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rewards Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Rewards Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Reward Pool
                </div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {data.rewardConfig?.amount || 0}{" "}
                  {data.rewardConfig?.type || "USDC"}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Distribution Method
                </div>
                <Badge variant="outline" className="mt-1">
                  {data.rewardConfig?.distributionMethod ===
                  DistributionMethod.LUCKY_DRAW
                    ? "Lucky Draw"
                    : "Equal Distribution"}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Number of Winners
                </div>
                <div className="text-xl font-semibold">
                  {data.rewardConfig?.distributionMethod ===
                  DistributionMethod.LUCKY_DRAW
                    ? data.rewardConfig.numberOfWinners?.toLocaleString() || 0
                    : data.maxParticipants?.toLocaleString() || 0}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Reward per Winner
                </div>
                <div className="text-xl font-semibold">
                  ${calculateRewardPerWinner()}{" "}
                  {data.rewardConfig?.type || "USDC"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Summary */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-2">
            Total Deposit Required: {depositBreakdown.displayText}
          </div>
          <div className="text-sm space-y-1">
            <div>• Rewards: {depositBreakdown.rewards}</div>
            <div>
              • Platform Fee: {calculatePlatformFee(data.rewardConfig.amount)}{" "}
              {data.rewardConfig.type} ({PLATFORM_FEE_PERCENTAGE}% of reward
              amount)
            </div>
            <div className="text-muted-foreground">
              This amount will be transferred from your wallet in a single
              transaction when you create the campaign.
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Deposit and Create Campaign Button */}
      <div className="flex flex-col items-center space-y-4">
        {!isConnected ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Connect your wallet to create and fund the campaign
            </p>
            <ConnectButton />
          </div>
        ) : (
          <Button
            onClick={handleDepositAndCreate}
            disabled={isCreating || isPending}
            className="w-full max-w-md gap-2"
            size="lg"
          >
            {isCreating || isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                Creating & Funding Campaign...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Deposit & Create Campaign
              </>
            )}
          </Button>
        )}

        <p className="text-xs text-muted-foreground text-center max-w-md">
          By clicking this button, you'll create the campaign and automatically
          deposit the required funds in a single blockchain transaction.
        </p>
      </div>

      {/* Final Warning */}
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-2">⚠️ Important Notice</div>
          <div className="text-sm">
            Once deployed to the blockchain, this campaign cannot be modified.
            Please review all details carefully before proceeding with
            deployment.
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
