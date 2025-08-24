"use client";

import React, { useState, useCallback, useEffect } from "react";
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
import Link from "next/link";

import {
  useUnifiedUserStats,
  useValidatedCampaigns,
  useUnifiedJoinCampaign,
} from "@/hooks/use-unified-data";
import { TaskSubmissionDialog } from "@/components/campaign/TaskSubmissionDialog";

import { CampaignActionButton } from "@/components/campaign/CampaignActionButton";
import { APICampaign } from "@/hooks/use-unified-data";

import { Trophy, Zap, Clock, Users, Gift, User } from "lucide-react";
import { format } from "date-fns";

// Real data is now fetched from unified hooks above

export default function DashboardPage() {
  const [selectedCampaignForTasks, setSelectedCampaignForTasks] =
    useState<APICampaign | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [countdownTick, setCountdownTick] = useState(0);

  const { isConnected, address } = useAccount();
  const {
    joinCampaign,
    isJoining,
    error: joinError,
  } = useUnifiedJoinCampaign();

  // Get real data from unified hooks
  const userStats = useUnifiedUserStats();
  const [availableCampaigns, setAvailableCampaigns] = useState<APICampaign[]>(
    []
  );
  const [campaignsLoading, setCampaignsLoading] = useState(true);

  // Fetch campaigns with refresh capability
  const fetchCampaigns = useCallback(async () => {
    try {
      setCampaignsLoading(true);
      const response = await fetch("/api/campaigns?status=all");
      if (response.ok) {
        const data = await response.json();
        setAvailableCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  // Initial fetch and refresh when trigger changes
  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns, refreshTrigger]);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleJoinCampaign = async (campaignId: string) => {
    try {
      const success = await joinCampaign(campaignId);
      if (success) {
        // Refresh the campaigns data to update UI state
        console.log("Successfully joined campaign:", campaignId);
        setRefreshTrigger((prev) => prev + 1);
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
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    if (minutes > 0) return `${minutes}m ${seconds}s left`;
    return `${seconds}s left`;
  };

  const getCountdownTimer = (startDate: Date) => {
    const now = new Date().getTime();
    const start = startDate.getTime();
    const diff = start - now;

    if (diff <= 0) return "Started";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0)
      return `${days}:${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    if (hours > 0)
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    if (minutes > 0) return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    return `${seconds}s`;
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
              <h1 className="text-3xl font-bold">Quests</h1>
              <p className="text-muted-foreground mt-2">
                Participate in quests, earn rewards, and build your reputation
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/profile">
                  <User className="w-4 h-4 mr-2" />
                  My Profile
                </Link>
              </Button>
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
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Main Content */}
          <div>
            <Tabs value="available">
              <TabsList className="mb-6">
                <TabsTrigger value="available">Available Quests</TabsTrigger>
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
                  <div className="space-y-8">
                    {/* Funded/Active Campaigns */}
                    {availableCampaigns.some(
                      (c) =>
                        c.currentParticipants < c.maxParticipants &&
                        c.blockchainCampaignId !== null &&
                        c.blockchainCampaignId !== undefined &&
                        new Date(c.startDate) <= new Date() &&
                        new Date(c.endDate) > new Date()
                    ) && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Available Campaigns
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {availableCampaigns
                            .filter(
                              (c) =>
                                c.currentParticipants < c.maxParticipants &&
                                c.blockchainCampaignId !== null &&
                                c.blockchainCampaignId !== undefined &&
                                new Date(c.startDate) <= new Date() &&
                                new Date(c.endDate) > new Date()
                            )
                            .map((campaign) => (
                              <Card
                                key={campaign.id}
                                className="overflow-hidden"
                              >
                                <div className="h-48 relative">
                                  {campaign.questBanner ? (
                                    <img
                                      src={campaign.questBanner}
                                      alt={`${campaign.title} banner`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                                  )}
                                  <div className="absolute inset-0 bg-black/40" />

                                  <div className="absolute top-4 right-4">
                                    <Badge className="bg-green-500">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {getTimeRemaining(
                                        new Date(campaign.endDate)
                                      )}
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
                                        {campaign.organizationName?.charAt(0) ||
                                          "O"}
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
                                          {campaign.rewardType} + $0.02
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-yellow-500" />
                                        <span className="font-medium">
                                          {campaign.tasks
                                            ?.filter((task) => task.enabled)
                                            .reduce(
                                              (total, task) =>
                                                total + (task.qpReward || 0),
                                              0
                                            ) || 0}{" "}
                                          QP
                                        </span>
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
                                        {campaign.distributionMethod ===
                                        "lucky_draw"
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

                                    <div className="space-y-2">
                                      {/* Campaign action button based on participation status */}
                                      {address && (
                                        <CampaignActionButton
                                          campaign={campaign}
                                          address={address}
                                          isJoining={isJoining}
                                          onJoinCampaign={handleJoinCampaign}
                                          onOpenTaskDialog={() => {
                                            setSelectedCampaignForTasks(
                                              campaign
                                            );
                                            setTaskDialogOpen(true);
                                          }}
                                          onOpenReviewDialog={() => {
                                            // No longer needed - owners redirect to campaign page
                                          }}
                                        />
                                      )}

                                      {/* Campaign owner logic is now handled in CampaignActionButton */}
                                    </div>
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
                      </div>
                    )}

                    {/* Upcoming Campaigns */}
                    {availableCampaigns.some(
                      (c) =>
                        c.currentParticipants < c.maxParticipants &&
                        c.blockchainCampaignId !== null &&
                        c.blockchainCampaignId !== undefined &&
                        new Date(c.startDate) > new Date()
                    ) && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Upcoming Campaigns
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {availableCampaigns
                            .filter(
                              (c) =>
                                c.currentParticipants < c.maxParticipants &&
                                c.blockchainCampaignId !== null &&
                                c.blockchainCampaignId !== undefined &&
                                new Date(c.startDate) > new Date()
                            )
                            .map((campaign) => (
                              <Card
                                key={campaign.id}
                                className="overflow-hidden opacity-90"
                              >
                                <div className="h-48 relative">
                                  {campaign.questBanner ? (
                                    <img
                                      src={campaign.questBanner}
                                      alt={`${campaign.title} banner`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500" />
                                  )}
                                  <div className="absolute inset-0 bg-black/40" />

                                  <div className="absolute top-4 right-4">
                                    <Badge className="bg-blue-500">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Starts in{" "}
                                      {getTimeRemaining(
                                        new Date(campaign.startDate)
                                      )}
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
                                        {campaign.organizationName?.charAt(0) ||
                                          "O"}
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
                                          {campaign.rewardType} + $0.02
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-yellow-500" />
                                        <span className="font-medium">
                                          {campaign.tasks
                                            ?.filter((task) => task.enabled)
                                            .reduce(
                                              (total, task) =>
                                                total + (task.qpReward || 0),
                                              0
                                            ) || 0}{" "}
                                          QP
                                        </span>
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
                                        {campaign.distributionMethod ===
                                        "lucky_draw"
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

                                    <div className="space-y-2">
                                      <Button
                                        disabled
                                        className="w-full gap-2"
                                        variant="outline"
                                      >
                                        <Clock className="h-4 w-4" />
                                        {getCountdownTimer(
                                          new Date(campaign.startDate)
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Ended Campaigns */}
                    {availableCampaigns.some(
                      (c) =>
                        c.blockchainCampaignId !== null &&
                        c.blockchainCampaignId !== undefined &&
                        new Date(c.endDate) <= new Date()
                    ) && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                          Ended Campaigns
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {availableCampaigns
                            .filter(
                              (c) =>
                                c.blockchainCampaignId !== null &&
                                c.blockchainCampaignId !== undefined &&
                                new Date(c.endDate) <= new Date()
                            )
                            .map((campaign) => (
                              <Card
                                key={campaign.id}
                                className="overflow-hidden opacity-75"
                              >
                                <div className="h-48 relative">
                                  {campaign.questBanner ? (
                                    <img
                                      src={campaign.questBanner}
                                      alt={`${campaign.title} banner`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
                                  )}
                                  <div className="absolute inset-0 bg-black/60" />

                                  <div className="absolute top-4 right-4">
                                    <Badge className="bg-red-500">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Ended
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
                                        {campaign.organizationName?.charAt(0) ||
                                          "O"}
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
                                          {campaign.rewardType} + $0.02
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-yellow-500" />
                                        <span className="font-medium">
                                          {campaign.tasks
                                            ?.filter((task) => task.enabled)
                                            .reduce(
                                              (total, task) =>
                                                total + (task.qpReward || 0),
                                              0
                                            ) || 0}{" "}
                                          QP
                                        </span>
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
                                        {campaign.distributionMethod ===
                                        "lucky_draw"
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

                                    <div className="space-y-2">
                                      <Button
                                        disabled
                                        className="w-full gap-2"
                                        variant="outline"
                                      >
                                        <Clock className="h-4 w-4" />
                                        Campaign Ended
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Task Submission Dialog */}
      {selectedCampaignForTasks && (
        <TaskSubmissionDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          campaignId={selectedCampaignForTasks.id}
          apiCampaign={selectedCampaignForTasks}
          onSubmissionSuccess={() => {
            // Force re-render to update button status
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
