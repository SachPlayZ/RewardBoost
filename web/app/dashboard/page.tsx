"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuestContract } from "@/hooks/use-quest-contract";
import {
  useUnifiedUserStats,
  useUnifiedCampaigns,
  useUnifiedLeaderboard,
  useUnifiedJoinCampaign,
} from "@/hooks/use-unified-data";
import { DistributionMethod } from "@/lib/types/campaign";
import { StreakCard, MonthlyRaffleCard } from "@/components/streaks/StreakCard";
import {
  Trophy,
  Zap,
  Clock,
  Users,
  Gift,
  Star,
  Calendar,
  Target,
  CheckCircle,
  PlayCircle,
  Twitter,
  Hash,
  AtSign,
  TrendingUp,
  Coins,
  Crown,
  Award,
  Shield,
} from "lucide-react";

// Real data is now fetched from unified hooks above

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("available");
  const { isConnected, address } = useAccount();
  const {
    joinCampaign,
    isJoining,
    error: joinError,
  } = useUnifiedJoinCampaign();

  // Get real data from unified hooks
  const userStats = useUnifiedUserStats();
  const { apiCampaigns: availableCampaigns, loading: campaignsLoading } =
    useUnifiedCampaigns("all");
  const { leaderboard, loading: leaderboardLoading } = useUnifiedLeaderboard(
    10,
    0
  );

  const handleJoinCampaign = async (campaignId: string) => {
    try {
      const success = await joinCampaign(campaignId);
      if (success) {
        // Optionally refresh the campaigns data
        // You could call a refresh function here
        console.log("Successfully joined campaign:", campaignId);
      }
    } catch (error) {
      console.error("Error joining campaign:", error);
    }
  };

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date().getTime();
    const end = endDate.getTime();
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>
                Connect your wallet to access the quest dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ConnectButton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Quest Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Participate in quests, earn rewards, and build your reputation
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {userStats.isLoaded ? userStats.totalQP : "..."} QP
              </div>
              <div className="text-sm text-muted-foreground">
                Level {userStats.isLoaded ? userStats.level : "..."}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="available">Available Quests</TabsTrigger>
                <TabsTrigger value="active">My Active Quests</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="space-y-6">
                {campaignsLoading ? (
                  <div className="text-muted-foreground">
                    Loading campaigns...
                  </div>
                ) : availableCampaigns.length === 0 ? (
                  <div className="text-muted-foreground">
                    No available campaigns at the moment.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {availableCampaigns
                      .filter((c) => c.currentParticipants < c.maxParticipants)
                      .map((campaign) => (
                        <Card key={campaign.id} className="overflow-hidden">
                          <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 relative">
                            <div className="absolute inset-0 bg-black/20" />

                            <div className="absolute top-4 right-4">
                              <Badge className="bg-green-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {getTimeRemaining(new Date(campaign.endDate))}
                              </Badge>
                            </div>
                            <div className="absolute bottom-4 left-4 text-white">
                              <h3 className="font-bold text-xl mb-1">
                                {campaign.title}
                              </h3>
                              <p className="text-sm opacity-90">
                                {campaign.description}
                              </p>
                            </div>
                            <div className="absolute -bottom-10 right-4">
                              <Avatar className="h-20 w-20 border-3 border-white shadow-lg">
                                <AvatarImage
                                  src={
                                    campaign.organizationLogo ||
                                    "/placeholder-logo.png"
                                  }
                                />
                                <AvatarFallback className="text-white bg-black/50 text-lg">
                                  {campaign.organizationName?.charAt(0) || "O"}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>

                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="text-sm text-muted-foreground mb-2">
                                by {campaign.organizationName}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Gift className="h-4 w-4 text-primary" />
                                  <span className="font-medium">
                                    {campaign.rewardAmount}{" "}
                                    {campaign.rewardType}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Zap className="h-4 w-4 text-yellow-500" />
                                  <span className="font-medium">
                                    {campaign.tasks?.[0]?.qpReward || 10} QP
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div>
                                  {campaign.distributionMethod === "lucky_draw"
                                    ? `${(
                                        campaign.rewardAmount /
                                        (campaign.numberOfWinners || 1)
                                      ).toFixed(2)} ${
                                        campaign.rewardType
                                      } per winner (${
                                        campaign.numberOfWinners
                                      } winners)`
                                    : `${(
                                        campaign.rewardAmount /
                                        Math.max(
                                          campaign.currentParticipants,
                                          1
                                        )
                                      ).toFixed(2)} ${
                                        campaign.rewardType
                                      } per winner (all participants)`}
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-3 w-3" />
                                  <span>Platform Guarantee: $0.02 USDC</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {campaign.currentParticipants}/
                                  {campaign.maxParticipants} joined
                                </div>
                                <div className="flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  {campaign.distributionMethod === "lucky_draw"
                                    ? `${campaign.numberOfWinners} winners`
                                    : "All participants"}
                                </div>
                              </div>

                              <Progress
                                value={
                                  (campaign.currentParticipants /
                                    campaign.maxParticipants) *
                                  100
                                }
                                className="h-2"
                              />

                              <Button
                                onClick={() => handleJoinCampaign(campaign.id)}
                                disabled={isJoining}
                                className="w-full gap-2"
                              >
                                <PlayCircle className="h-4 w-4" />
                                {isJoining ? "Joining..." : "Join Quest"}
                              </Button>
                              {joinError && (
                                <div className="text-sm text-red-500 mt-2">
                                  {joinError}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active" className="space-y-6">
                <div className="text-muted-foreground">
                  Active campaigns feature coming soon. This will show campaigns
                  you've joined and are currently participating in.
                </div>
                {/* TODO: Implement active campaigns based on user's participation */}
                {availableCampaigns
                  .filter((c) => c.currentParticipants > 0)
                  .slice(0, 2)
                  .map((campaign) => (
                    <Card key={campaign.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12 border-2 border-border">
                              <AvatarImage
                                src={
                                  campaign.organizationLogo ||
                                  "/placeholder-logo.png"
                                }
                              />
                              <AvatarFallback>
                                {campaign.organizationName?.charAt(0) || "O"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {campaign.title}
                                <Badge variant="secondary">Active</Badge>
                              </CardTitle>
                              <CardDescription>
                                {campaign.description}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              Tasks
                            </div>
                            <div className="text-2xl font-bold">
                              {campaign.tasks?.length || 0}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-3">
                            {campaign.tasks?.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                                  <div>
                                    <div className="font-medium">
                                      {task.title ||
                                        task.customTitle ||
                                        `Task ${task.id}`}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {task.type === "x_follow"
                                        ? "Social Follow Task"
                                        : task.type === "x_post"
                                        ? "Content Creation"
                                        : "Custom Task"}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {task.qpReward} QP
                                  </Badge>
                                  <Button size="sm" variant="outline">
                                    View Task
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <Alert>
                            <Clock className="h-4 w-4" />
                            <AlertDescription>
                              Time remaining:{" "}
                              {getTimeRemaining(new Date(campaign.endDate))}
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="completed">
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No completed quests yet
                  </h3>
                  <p className="text-muted-foreground">
                    Complete your first quest to see your achievements here!
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Daily Streaks */}
            <StreakCard />

            {/* Monthly Raffle */}
            <MonthlyRaffleCard />
            {/* User Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userStats.isLoaded ? userStats.totalQP : "..."}
                  </div>
                  <div className="text-sm text-muted-foreground">Total QP</div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">
                      {userStats.isLoaded ? userStats.level : "..."}
                    </div>
                    <div className="text-xs text-muted-foreground">Level</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      #
                      {leaderboard.find((u) => u.walletAddress === address)
                        ?.rank || "..."}
                    </div>
                    <div className="text-xs text-muted-foreground">Rank</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">
                      {userStats.completedQuests || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Completed
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      $
                      {userStats.isLoaded
                        ? userStats.totalEarnings.toFixed(2)
                        : "..."}
                    </div>
                    <div className="text-xs text-muted-foreground">Earned</div>
                  </div>
                </div>

                <Progress
                  value={
                    userStats.isLoaded
                      ? ((userStats.totalQP % 500) / 500) * 100
                      : 0
                  }
                  className="h-2"
                />
                <div className="text-xs text-center text-muted-foreground">
                  {userStats.isLoaded ? userStats.qpForNextLevel : "..."} QP to
                  Level {userStats.isLoaded ? userStats.level + 1 : "..."}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 text-muted-foreground">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Achievements coming soon!</p>
                  <p className="text-xs mt-1">
                    Complete quests to unlock achievements
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboardLoading ? (
                  <div className="text-muted-foreground">
                    Loading leaderboard...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((user, index) => {
                      const isCurrentUser = user.walletAddress === address;
                      const rankIcon =
                        index === 0
                          ? "🥇"
                          : index === 1
                          ? "🥈"
                          : index === 2
                          ? "🥉"
                          : "👤";

                      return (
                        <div
                          key={user.walletAddress}
                          className={`flex items-center justify-between ${
                            isCurrentUser
                              ? "bg-primary/10 p-2 rounded-lg border"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{rankIcon}</span>
                            <div>
                              <div
                                className={`text-sm font-medium ${
                                  isCurrentUser ? "text-primary" : ""
                                }`}
                              >
                                {isCurrentUser ? "You" : user.displayName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                #{user.rank}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {user.totalQP} QP
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
