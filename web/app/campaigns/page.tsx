"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { useUnifiedCampaigns } from "@/hooks/use-unified-data";
import { TOKEN_METADATA } from "@/lib/contracts/tokens";
import { getTokenAddress } from "@/lib/contracts/tokens";

export default function CampaignsPage() {
  const { address } = useAccount();
  const { apiCampaigns, loading, error } = useUnifiedCampaigns("active");

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

  // Format reward amount with token info
  const formatReward = (amount: number, tokenType: string) => {
    const tokenInfo = TOKEN_METADATA[tokenType] || TOKEN_METADATA.USDC;
    const formattedAmount =
      tokenType === "SEI" ? amount.toFixed(2) : amount.toFixed(2);
    return `${formattedAmount} ${tokenInfo.symbol}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Active Campaigns</h1>
        <Link href="/campaigns/create">
          <Button>Create Campaign</Button>
        </Link>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          Error loading campaigns: {error}
        </div>
      )}

      {loading ? (
        <div className="text-muted-foreground">Loading campaigns...</div>
      ) : apiCampaigns.length === 0 ? (
        <div className="text-muted-foreground">No active campaigns yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apiCampaigns.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {campaign.title}
                      </CardTitle>
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
                        {formatReward(
                          campaign.rewardAmount,
                          campaign.rewardType
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {campaign.currentParticipants}/{campaign.maxParticipants}{" "}
                      joined
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {campaign.distributionMethod === "lucky_draw"
                        ? `${campaign.numberOfWinners} winners`
                        : "All participants"}
                    </span>
                    <span className="text-orange-500 font-medium">
                      {getTimeRemaining(campaign.endDate)}
                    </span>
                  </div>

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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
