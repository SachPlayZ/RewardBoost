"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePublicClient } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import {
  QuestRewardsContractABI,
  QUEST_REWARDS_CONTRACT_ADDRESS,
  Campaign,
} from "@/lib/contracts/quest-rewards-contract";

type CampaignListItem = Pick<
  Campaign,
  | "campaignId"
  | "startTime"
  | "endTime"
  | "totalRewardAmount"
  | "totalParticipants"
>;

export default function CampaignsPage() {
  const publicClient = usePublicClient();
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        if (!publicClient) return;
        // Read CampaignCreated logs to infer campaignIds
        const logs = await publicClient.getLogs({
          address: QUEST_REWARDS_CONTRACT_ADDRESS,
          event: {
            type: "event",
            name: "CampaignCreated",
            inputs: [
              { name: "campaignId", type: "uint256", indexed: true },
              { name: "creator", type: "address", indexed: true },
              { name: "rewardToken", type: "address", indexed: true },
              { name: "distributionMethod", type: "uint8", indexed: false },
              { name: "totalRewardAmount", type: "uint256", indexed: false },
              { name: "startTime", type: "uint256", indexed: false },
              { name: "endTime", type: "uint256", indexed: false },
            ],
            anonymous: false,
          },
          fromBlock: 0n,
          toBlock: "latest",
        } as any);

        const ids = Array.from(
          new Set(logs.map((l: any) => BigInt(l.args.campaignId)))
        );

        // Fetch each campaign details
        const results = await Promise.all(
          ids.map(async (id) => {
            const data = await publicClient.readContract({
              address: QUEST_REWARDS_CONTRACT_ADDRESS,
              abi: QuestRewardsContractABI,
              functionName: "getCampaign",
              args: [id],
            });
            const c = data as unknown as Campaign;
            return {
              campaignId: c.campaignId,
              startTime: c.startTime,
              endTime: c.endTime,
              totalRewardAmount: c.totalRewardAmount,
              totalParticipants: c.totalParticipants,
            } satisfies CampaignListItem;
          })
        );

        // Keep only ongoing campaigns (now between start and end)
        const nowSec = BigInt(Math.floor(Date.now() / 1000));
        const ongoing = results.filter(
          (c) => c.startTime <= nowSec && c.endTime >= nowSec
        );
        // Sort by start time desc
        ongoing.sort((a, b) => Number(b.startTime - a.startTime));
        setCampaigns(ongoing);
      } catch (e) {
        console.error("Failed to fetch campaigns", e);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, [publicClient]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Campaigns</h1>
        <Link href="/campaigns/create">
          <Button>Create Campaign</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading campaigns...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-muted-foreground">No campaigns yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <Link
              key={c.campaignId.toString()}
              href={`/campaigns/${c.campaignId.toString()}`}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Campaign #{c.campaignId.toString()}</CardTitle>
                  <CardDescription>
                    {format(new Date(Number(c.startTime) * 1000), "PP")} -{" "}
                    {format(new Date(Number(c.endTime) * 1000), "PP")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <div>Total Reward: {c.totalRewardAmount.toString()}</div>
                  <div>Participants: {c.totalParticipants.toString()}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
