"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { format, isAfter, isBefore } from "date-fns";
import {
  getDepositBreakdown,
  calculatePlatformFee,
  PLATFORM_FEE_PERCENTAGE,
  RewardType,
} from "@/lib/types/campaign";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Users,
  Gift,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Eye,
  PlayCircle,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useQuestContract } from "@/hooks/use-quest-contract";
import { SubmissionReviewTab } from "@/components/campaign/SubmissionReviewDialog";

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
  status: string; // 'draft', 'active', 'ended', 'cancelled'
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
  accountToFollow?: string;
  postLimit?: number;
  hashtags: string[];
  accountsToTag: string[];
  customTitle?: string;
  customDescription?: string;
  qpReward: number;
}

export default function CampaignPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { isPending } = useQuestContract();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const campaignId = params.campaignId as string;

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Campaign not found");
          return;
        }
        throw new Error("Failed to fetch campaign");
      }

      const data = await response.json();
      const campaignData = data.campaign;

      // Check if campaign is unfunded and user is the owner
      if (
        campaignData &&
        !campaignData.funded &&
        address &&
        campaignData.ownerWallet?.toLowerCase() === address.toLowerCase()
      ) {
        console.log("🔄 Redirecting unfunded campaign to review page");
        router.push(`/campaigns/create?edit=${campaignData.id}`);
        return;
      }

      setCampaign(campaignData);
    } catch (err) {
      console.error("Error fetching campaign:", err);
      setError("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

  const getCampaignStatus = () => {
    if (!campaign)
      return { status: "unknown", color: "gray", icon: AlertCircle };

    const now = new Date();
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);

    if (isBefore(now, startDate)) {
      return { status: "upcoming", color: "blue", icon: Clock };
    } else if (
      isAfter(now, endDate) ||
      campaign.status === "ended" ||
      campaign.status === "cancelled"
    ) {
      return { status: "ended", color: "red", icon: XCircle };
    } else {
      return { status: "active", color: "green", icon: CheckCircle };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTotalDepositDisplay = (rewardAmount: number, rewardType: string) => {
    return getDepositBreakdown(rewardAmount, rewardType as RewardType);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card>
            <CardContent className="py-12">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error || "The campaign you're looking for doesn't exist."}
              </p>
              <Button onClick={() => router.push("/campaigns")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const campaignStatus = getCampaignStatus();
  const StatusIcon = campaignStatus.icon;
  const isOwner = address?.toLowerCase() === campaign.ownerWallet.toLowerCase();
  const participantPercentage =
    (campaign.currentParticipants / campaign.maxParticipants) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/campaigns")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{campaign.title}</h1>
                <Badge className={getStatusColor(campaignStatus.status)}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {campaignStatus.status.charAt(0).toUpperCase() +
                    campaignStatus.status.slice(1)}
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                by {campaign.organizationName}
              </p>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/campaigns/${campaign.id}/edit`)}
                >
                  Edit Campaign
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation for Owners */}
            {isOwner && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  {/* Campaign Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-6">
                        {campaign.description}
                      </p>

                      {campaign.questBanner && (
                        <div className="rounded-lg overflow-hidden">
                          <img
                            src={campaign.questBanner}
                            alt="Campaign banner"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tasks" className="space-y-6 mt-6">
                  {/* Tasks */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quest Tasks</CardTitle>
                      <CardDescription>
                        Manage the tasks participants need to complete
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {campaign.tasks
                          .filter((task) => task.enabled)
                          .map((task, index) => (
                            <div
                              key={task.id}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                                      {index + 1}
                                    </span>
                                    <h4 className="font-medium">
                                      {task.customTitle ||
                                        `${task.type
                                          .replace("_", " ")
                                          .toUpperCase()} Task`}
                                    </h4>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {task.customDescription || task.instruction}
                                  </p>
                                  {task.accountToFollow && (
                                    <p className="text-xs text-muted-foreground">
                                      Account to follow: @{task.accountToFollow}
                                    </p>
                                  )}
                                  {task.hashtags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {task.hashtags.map((hashtag, i) => (
                                        <Badge
                                          key={i}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          #{hashtag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Badge variant="outline">
                                  {task.qpReward} QP
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="submissions" className="space-y-6 mt-6">
                  {/* Submissions Review */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Review Submissions
                      </CardTitle>
                      <CardDescription>
                        View participant submissions - all valid submissions are
                        auto-approved
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SubmissionReviewTab
                        campaignId={campaign.id}
                        campaignTitle={campaign.title}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}

            {/* Default view for non-owners */}
            {!isOwner && (
              <>
                {/* Campaign Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Campaign Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      {campaign.description}
                    </p>

                    {campaign.questBanner && (
                      <div className="rounded-lg overflow-hidden">
                        <img
                          src={campaign.questBanner}
                          alt="Campaign banner"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quest Tasks</CardTitle>
                    <CardDescription>
                      Complete these tasks to participate and earn rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaign.tasks
                        .filter((task) => task.enabled)
                        .map((task, index) => (
                          <div key={task.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                  </span>
                                  <h4 className="font-medium">
                                    {task.customTitle ||
                                      `${task.type
                                        .replace("_", " ")
                                        .toUpperCase()} Task`}
                                  </h4>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {task.customDescription || task.instruction}
                                </p>
                                {task.accountToFollow && (
                                  <p className="text-xs text-muted-foreground">
                                    Account to follow: @{task.accountToFollow}
                                  </p>
                                )}
                                {task.hashtags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {task.hashtags.map((hashtag, i) => (
                                      <Badge
                                        key={i}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        #{hashtag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Badge variant="outline">
                                {task.qpReward} QP
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Participants</span>
                  </div>
                  <span className="font-medium">
                    {campaign.currentParticipants} / {campaign.maxParticipants}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(participantPercentage)}%</span>
                  </div>
                  <Progress value={participantPercentage} className="h-2" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Start Date</span>
                  </div>
                  <span className="text-sm font-medium">
                    {format(new Date(campaign.startDate), "MMM dd, yyyy")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">End Date</span>
                  </div>
                  <span className="text-sm font-medium">
                    {format(new Date(campaign.endDate), "MMM dd, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Rewards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Reward Pool</span>
                  </div>
                  <span className="font-medium">
                    ${campaign.rewardAmount} {campaign.rewardType}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Distribution</span>
                  <Badge variant="secondary">
                    {campaign.distributionMethod === "lucky_draw"
                      ? "Lucky Draw"
                      : "Equal Split"}
                  </Badge>
                </div>

                {campaign.distributionMethod === "lucky_draw" &&
                  campaign.numberOfWinners && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Winners</span>
                      <span className="font-medium">
                        {campaign.numberOfWinners}
                      </span>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Campaign Status Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge className={getStatusColor(campaignStatus.status)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {campaignStatus.status.charAt(0).toUpperCase() +
                        campaignStatus.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Funds Deposited:
                    </span>
                    <Badge variant={campaign.funded ? "default" : "secondary"}>
                      {campaign.funded ? "Yes" : "Pending"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {campaign.funded
                      ? "This campaign was created and funded in a single transaction"
                      : "Campaign is pending funding approval"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Join Campaign - Only for non-owners */}
            {!isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Join Campaign</CardTitle>
                  <CardDescription>
                    Participate in this quest to earn rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isConnected ? (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect your wallet to join the campaign
                      </p>
                      <ConnectButton />
                    </div>
                  ) : (
                    <Button
                      onClick={() =>
                        router.push(`/campaigns/${campaign.id}/join`)
                      }
                      className="w-full"
                      disabled={campaignStatus.status !== "active"}
                    >
                      {campaignStatus.status === "active"
                        ? "Join Campaign"
                        : "Campaign Not Active"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Campaign Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Campaign ID
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {campaign.id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(campaign.id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Owner Wallet
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {campaign.ownerWallet.slice(0, 6)}...
                      {campaign.ownerWallet.slice(-4)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(campaign.ownerWallet)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Created
                  </div>
                  <div className="text-sm">
                    {format(new Date(campaign.createdAt), "PPP")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
