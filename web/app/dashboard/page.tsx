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
import { RewardDistributionMethod } from "@/lib/types/campaign";
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
} from "lucide-react";

// Mock data - in a real app, this would come from your backend/blockchain
const mockCampaigns = [
  {
    id: 1,
    title: "Web3 Community Builder Challenge",
    description:
      "Engage with the Web3 community by creating meaningful discussions about decentralized technologies.",
    image: "/images/campaign-1.jpg",
    status: "active",
    reward: {
      amount: 100,
      type: "USDC",
      distribution: "lucky_draw",
      winners: 10,
    },
    participants: 234,
    maxParticipants: 500,
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    xpReward: 150,
    difficulty: "Intermediate",
    tasks: [
      {
        id: 1,
        title: "Follow @web3project",
        type: "follow",
        completed: false,
        xp: 10,
      },
      {
        id: 2,
        title: "Create engagement post",
        type: "post",
        completed: false,
        xp: 50,
      },
      {
        id: 3,
        title: "Join community discussion",
        type: "custom",
        completed: false,
        xp: 30,
      },
    ],
    isParticipant: false,
  },
  {
    id: 2,
    title: "DeFi Explorer Quest",
    description:
      "Discover decentralized finance protocols and share your learning journey.",
    image: "/images/campaign-2.jpg",
    status: "active",
    reward: { amount: 200, type: "SEI", distribution: "equal", winners: 100 },
    participants: 89,
    maxParticipants: 100,
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    xpReward: 200,
    difficulty: "Advanced",
    tasks: [
      {
        id: 1,
        title: "Research DeFi protocol",
        type: "custom",
        completed: true,
        xp: 40,
      },
      {
        id: 2,
        title: "Share findings on X",
        type: "post",
        completed: false,
        xp: 60,
      },
    ],
    isParticipant: true,
  },
];

const mockUser = {
  address: "0x742d35Cc6635C0532925a3b8D7Fb8d22567b9E52",
  xp: 1250,
  level: 8,
  completedQuests: 12,
  totalEarnings: 456.78,
  rank: 142,
  achievements: [
    {
      id: 1,
      title: "Early Adopter",
      description: "Joined in the first week",
      icon: "🌟",
    },
    {
      id: 2,
      title: "Social Butterfly",
      description: "Completed 5 social tasks",
      icon: "🦋",
    },
    {
      id: 3,
      title: "Community Builder",
      description: "Referred 10+ users",
      icon: "🏗️",
    },
  ],
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("available");
  const { isConnected } = useAccount();
  const { joinCampaign, isPending } = useQuestContract();

  const handleJoinCampaign = async (campaignId: number) => {
    try {
      await joinCampaign(BigInt(campaignId));
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
                {mockUser.xp} XP
              </div>
              <div className="text-sm text-muted-foreground">
                Level {mockUser.level}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockCampaigns
                    .filter((c) => !c.isParticipant)
                    .map((campaign) => (
                      <Card key={campaign.id} className="overflow-hidden">
                        <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 relative">
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute top-4 left-4">
                            <Badge variant="secondary">
                              {campaign.difficulty}
                            </Badge>
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-green-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {getTimeRemaining(campaign.endDate)}
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
                        </div>

                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Gift className="h-4 w-4 text-primary" />
                                <span className="font-medium">
                                  ${campaign.reward.amount}{" "}
                                  {campaign.reward.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">
                                  {campaign.xpReward} XP
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {campaign.participants}/
                                {campaign.maxParticipants} joined
                              </div>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                {campaign.reward.distribution === "lucky_draw"
                                  ? `${campaign.reward.winners} winners`
                                  : "All participants"}
                              </div>
                            </div>

                            <Progress
                              value={
                                (campaign.participants /
                                  campaign.maxParticipants) *
                                100
                              }
                              className="h-2"
                            />

                            <div className="space-y-2">
                              <div className="text-sm font-medium">
                                Tasks Preview:
                              </div>
                              <div className="space-y-1">
                                {campaign.tasks.slice(0, 2).map((task) => (
                                  <div
                                    key={task.id}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                                    <span>{task.title}</span>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {task.xp} XP
                                    </Badge>
                                  </div>
                                ))}
                                {campaign.tasks.length > 2 && (
                                  <div className="text-xs text-muted-foreground">
                                    +{campaign.tasks.length - 2} more tasks
                                  </div>
                                )}
                              </div>
                            </div>

                            <Button
                              onClick={() => handleJoinCampaign(campaign.id)}
                              disabled={isPending}
                              className="w-full gap-2"
                            >
                              <PlayCircle className="h-4 w-4" />
                              Join Quest
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="active" className="space-y-6">
                {mockCampaigns
                  .filter((c) => c.isParticipant)
                  .map((campaign) => (
                    <Card key={campaign.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {campaign.title}
                              <Badge variant="secondary">Active</Badge>
                            </CardTitle>
                            <CardDescription>
                              {campaign.description}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              Progress
                            </div>
                            <div className="text-2xl font-bold">
                              {campaign.tasks.filter((t) => t.completed).length}
                              /{campaign.tasks.length}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Progress
                            value={
                              (campaign.tasks.filter((t) => t.completed)
                                .length /
                                campaign.tasks.length) *
                              100
                            }
                            className="h-3"
                          />

                          <div className="space-y-3">
                            {campaign.tasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  {task.completed ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                                  )}
                                  <div>
                                    <div className="font-medium">
                                      {task.title}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {task.type === "follow"
                                        ? "Social Follow Task"
                                        : task.type === "post"
                                        ? "Content Creation"
                                        : "Custom Task"}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{task.xp} XP</Badge>
                                  {!task.completed && (
                                    <Button size="sm" variant="outline">
                                      Complete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <Alert>
                            <Clock className="h-4 w-4" />
                            <AlertDescription>
                              Time remaining:{" "}
                              {getTimeRemaining(campaign.endDate)}
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
                    {mockUser.xp}
                  </div>
                  <div className="text-sm text-muted-foreground">Total XP</div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">
                      {mockUser.level}
                    </div>
                    <div className="text-xs text-muted-foreground">Level</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      #{mockUser.rank}
                    </div>
                    <div className="text-xs text-muted-foreground">Rank</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold">
                      {mockUser.completedQuests}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Completed
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      ${mockUser.totalEarnings}
                    </div>
                    <div className="text-xs text-muted-foreground">Earned</div>
                  </div>
                </div>

                <Progress value={65} className="h-2" />
                <div className="text-xs text-center text-muted-foreground">
                  350 XP to Level {mockUser.level + 1}
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
                <div className="space-y-3">
                  {mockUser.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3"
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <div className="font-medium text-sm">
                          {achievement.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                  ))}
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
                <div className="space-y-3">
                  {[
                    { rank: 1, name: "CryptoMaster", xp: 5420, icon: "🥇" },
                    { rank: 2, name: "Web3Builder", xp: 4890, icon: "🥈" },
                    { rank: 3, name: "DeFiExplorer", xp: 4250, icon: "🥉" },
                    {
                      rank: 142,
                      name: "You",
                      xp: mockUser.xp,
                      icon: "👤",
                      current: true,
                    },
                  ].map((user) => (
                    <div
                      key={user.rank}
                      className={`flex items-center justify-between ${
                        user.current
                          ? "bg-primary/10 p-2 rounded-lg border"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{user.icon}</span>
                        <div>
                          <div
                            className={`text-sm font-medium ${
                              user.current ? "text-primary" : ""
                            }`}
                          >
                            {user.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            #{user.rank}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{user.xp} XP</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
