"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { useValidatedCampaigns } from "@/hooks/use-unified-data";
import { TOKEN_METADATA } from "@/lib/contracts/tokens";
import { getTokenAddress } from "@/lib/contracts/tokens";
import {
  Clock,
  Users,
  Gift,
  AlertCircle,
  Play,
  FileText,
  CheckCircle,
} from "lucide-react";

export default function CampaignsPage() {
  const { address } = useAccount();
  const {
    apiCampaigns: allCampaigns,
    loading: campaignsLoading,
    error: campaignsError,
  } = useValidatedCampaigns("all");

  // Filter to only show campaigns created by the current user
  const userCampaigns = address
    ? allCampaigns.filter(
        (c) => c.ownerWallet.toLowerCase() === address.toLowerCase()
      )
    : [];

  // Filter campaigns by status client-side to avoid multiple API calls
  const activeCampaigns = userCampaigns.filter((c) => c.status === "active");
  const draftCampaigns = userCampaigns.filter((c) => c.status === "draft");

  const [activeTab, setActiveTab] = useState("active");

  // Calculate time remaining for a campaign
  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  // Get status display for campaigns
  const getStatusDisplay = (campaign: any) => {
    if (campaign.status === "draft") {
      return {
        label: "Draft",
        color: "bg-yellow-100 text-yellow-800",
        icon: FileText,
      };
    } else if (campaign.status === "active") {
      return {
        label: "Active",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      };
    } else if (campaign.status === "ended" || campaign.status === "cancelled") {
      return {
        label: "Ended",
        color: "bg-red-100 text-red-800",
        icon: Clock,
      };
    }
    return {
      label: "Unknown",
      color: "bg-gray-100 text-gray-800",
      icon: FileText,
    };
  };

  // Format reward amount with token info
  const formatReward = (amount: number, tokenType: string) => {
    const tokenInfo = TOKEN_METADATA[tokenType] || TOKEN_METADATA.USDC;
    const formattedAmount =
      tokenType === "SEI" ? amount.toFixed(2) : amount.toFixed(2);
    return `${formattedAmount} ${tokenInfo.symbol}`;
  };

  // Render campaign card
  const renderCampaignCard = (campaign: any, showActivateButton = false) => {
    const statusDisplay = getStatusDisplay(campaign);
    const StatusIcon = statusDisplay.icon;

    return (
      <Card key={campaign.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg line-clamp-2">
                  {campaign.title}
                </CardTitle>
                <Badge className={statusDisplay.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusDisplay.label}
                </Badge>
              </div>
              <CardDescription className="text-sm">
                by {campaign.organizationName}
              </CardDescription>
            </div>
            {campaign.organizationLogo && (
              <img
                src={campaign.organizationLogo}
                alt={campaign.organizationName}
                className="w-12 h-12 rounded-lg object-cover ml-3"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {campaign.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium text-primary">
                {formatReward(campaign.rewardAmount, campaign.rewardType)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {campaign.currentParticipants}/{campaign.maxParticipants} joined
            </div>
          </div>

          {campaign.status === "draft" ? (
            <div className="space-y-2">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This campaign is in draft mode. Complete the payment to
                  activate it.
                </AlertDescription>
              </Alert>
              <Link href={`/campaigns/${campaign.id}/payment`}>
                <Button className="w-full" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Activate Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {campaign.distributionMethod === "lucky_draw"
                    ? `${campaign.numberOfWinners} winners`
                    : "All participants"}
                </span>
                {campaign.status === "active" && (
                  <span className="text-secondary font-medium">
                    {getTimeRemaining(campaign.endDate)}
                  </span>
                )}
              </div>

              {campaign.status === "active" && (
                <div className="pt-2">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (campaign.currentParticipants /
                            campaign.maxParticipants) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Campaigns</h1>
        <Link href="/campaigns/create">
          <Button>
            <Gift className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            <CheckCircle className="w-4 h-4 mr-2" />
            Active ({activeCampaigns?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="draft">
            <FileText className="w-4 h-4 mr-2" />
            Drafts ({draftCampaigns?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {!address ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-muted-foreground mb-4">
                Please connect your wallet to view your campaigns.
              </p>
            </div>
          ) : campaignsError ? (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading active campaigns: {campaignsError}
              </AlertDescription>
            </Alert>
          ) : campaignsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading active campaigns...
              </p>
            </div>
          ) : !activeCampaigns || activeCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No Active Campaigns
              </h3>
              <p className="text-muted-foreground mb-4">
                You don't have any active campaigns yet.{" "}
                {address
                  ? "Create one to get started!"
                  : "Connect your wallet to see your campaigns."}
              </p>
              {address ? (
                <Link href="/campaigns/create">
                  <Button>Create Your First Campaign</Button>
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Please connect your wallet to create campaigns.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCampaigns.map((campaign) => (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  {renderCampaignCard(campaign)}
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          {!address ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-muted-foreground mb-4">
                Please connect your wallet to view your campaigns.
              </p>
            </div>
          ) : campaignsError ? (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading draft campaigns: {campaignsError}
              </AlertDescription>
            </Alert>
          ) : campaignsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Loading draft campaigns...
              </p>
            </div>
          ) : !draftCampaigns || draftCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Draft Campaigns</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any draft campaigns.{" "}
                {address
                  ? "Create one to get started!"
                  : "Connect your wallet to create campaigns."}
              </p>
              {address ? (
                <Link href="/campaigns/create">
                  <Button>Create Campaign</Button>
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Please connect your wallet to create campaigns.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {draftCampaigns.map((campaign) => (
                <div key={campaign.id}>
                  {renderCampaignCard(campaign, true)}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
