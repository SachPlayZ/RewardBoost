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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuestContract } from "@/hooks/use-quest-contract";
import { format } from "date-fns";
import {
  Settings,
  Users,
  Trophy,
  DollarSign,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Edit,
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  Award,
  Target,
  AlertCircle,
} from "lucide-react";

// Mock data for admin dashboard
const mockCampaigns = [
  {
    id: 1,
    title: "Web3 Community Builder Challenge",
    status: "active",
    creator: "0x742d35Cc6635C0532925a3b8D7Fb8d22567b9E52",
    participants: 234,
    maxParticipants: 500,
    reward: { amount: 100, type: "USDC", distributed: false },
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    totalTasks: 3,
    completedTasks: 156,
  },
  {
    id: 2,
    title: "DeFi Explorer Quest",
    status: "completed",
    creator: "0x123d35Cc6635C0532925a3b8D7Fb8d22567b9E52",
    participants: 89,
    maxParticipants: 100,
    reward: { amount: 200, type: "SEI", distributed: true },
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    totalTasks: 2,
    completedTasks: 89,
  },
  {
    id: 3,
    title: "NFT Creator Showcase",
    status: "draft",
    creator: "0x456d35Cc6635C0532925a3b8D7Fb8d22567b9E52",
    participants: 0,
    maxParticipants: 300,
    reward: { amount: 150, type: "USDC", distributed: false },
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    totalTasks: 4,
    completedTasks: 0,
  },
];

const mockStats = {
  totalCampaigns: 15,
  activeCampaigns: 8,
  totalParticipants: 2456,
  totalRewardsDistributed: 12450.75,
  averageParticipation: 74.2,
  topPerformingCampaign: "Web3 Community Builder Challenge",
};

const mockUsers = [
  {
    address: "0x742d35Cc6635C0532925a3b8D7Fb8d22567b9E52",
    totalQP: 2450,
    level: 12,
    completedQuests: 24,
    totalEarnings: 456.78,
    joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: "verified",
  },
  {
    address: "0x123d35Cc6635C0532925a3b8D7Fb8d22567b9E52",
    totalXP: 1890,
    level: 9,
    completedQuests: 18,
    totalEarnings: 342.5,
    joinedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    status: "active",
  },
  {
    address: "0x456d35Cc6635C0532925a3b8D7Fb8d22567b9E52",
    totalXP: 3120,
    level: 15,
    completedQuests: 32,
    totalEarnings: 789.25,
    joinedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    status: "verified",
  },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { isConnected } = useAccount();
  const { endCampaignAndDistribute, isPending } = useQuestContract();

  const handleDistributeRewards = async (campaignId: number) => {
    try {
      await endCampaignAndDistribute(BigInt(campaignId));
    } catch (error) {
      console.error("Error distributing rewards:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: "default" as const, color: "bg-green-500" },
      completed: { variant: "secondary" as const, color: "bg-blue-500" },
      draft: { variant: "outline" as const, color: "bg-gray-500" },
      cancelled: { variant: "destructive" as const, color: "bg-red-500" },
    };

    return variants[status as keyof typeof variants] || variants.draft;
  };

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.creator.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Admin Access Required</CardTitle>
              <CardDescription>
                Connect your wallet to access the admin dashboard
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
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Manage campaigns, users, and platform analytics
              </p>
            </div>
            <Button className="gap-2">
              <Settings className="h-4 w-4" />
              Platform Settings
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {mockStats.totalCampaigns}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Campaigns
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-500/10">
                      <Play className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {mockStats.activeCampaigns}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Active Campaigns
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-500/10">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {mockStats.totalParticipants.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Participants
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-yellow-500/10">
                      <DollarSign className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        ${mockStats.totalRewardsDistributed.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rewards Distributed
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaign Activity</CardTitle>
                <CardDescription>
                  Latest updates from active campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCampaigns.slice(0, 3).map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            getStatusBadge(campaign.status).color
                          }`}
                        />
                        <div>
                          <div className="font-medium">{campaign.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {campaign.participants} participants • $
                            {campaign.reward.amount} {campaign.reward.type}
                          </div>
                        </div>
                      </div>
                      <Badge {...getStatusBadge(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Campaigns Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Campaigns</CardTitle>
                <CardDescription>
                  Manage and monitor campaign performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Reward Pool</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Creator: {campaign.creator.slice(0, 10)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge {...getStatusBadge(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-center">
                            <div className="font-medium">
                              {campaign.participants}/{campaign.maxParticipants}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {Math.round(
                                (campaign.participants /
                                  campaign.maxParticipants) *
                                  100
                              )}
                              % filled
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ${campaign.reward.amount} {campaign.reward.type}
                          </div>
                          {campaign.reward.distributed && (
                            <div className="text-xs text-green-600">
                              ✓ Distributed
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(campaign.endDate, "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            {campaign.status === "completed" &&
                              !campaign.reward.distributed && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleDistributeRewards(campaign.id)
                                  }
                                  disabled={isPending}
                                  className="gap-1"
                                >
                                  <Trophy className="h-3 w-3" />
                                  Distribute
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Management */}
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Monitor user activity and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Total QP</TableHead>
                      <TableHead>Completed Quests</TableHead>
                      <TableHead>Total Earnings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.address}>
                        <TableCell>
                          <div>
                            <div className="font-mono text-sm">
                              {user.address.slice(0, 10)}...
                              {user.address.slice(-8)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Joined {format(user.joinedDate, "MMM dd, yyyy")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-bold">
                              {user.level}
                            </div>
                            <Award className="h-4 w-4 text-yellow-500" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {user.totalQP.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {user.completedQuests}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ${user.totalEarnings}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "verified"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Platform Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Participation Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Average Participation Rate
                      </span>
                      <span className="font-bold">
                        {mockStats.averageParticipation}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Top Performing Campaign</span>
                      <span className="font-medium text-sm">
                        {mockStats.topPerformingCampaign}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Platform Completion Rate</span>
                      <span className="font-bold">82.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        Total Platform Fees Collected
                      </span>
                      <span className="font-bold">$425.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Campaign Value</span>
                      <span className="font-bold">$163.75</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly Growth Rate</span>
                      <span className="font-bold text-green-600">+12.3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">
                  Platform Performance Summary
                </div>
                <div className="text-sm">
                  Your quest platform is performing well with strong user
                  engagement and consistent campaign completion rates. Consider
                  promoting high-performing campaign formats to maximize user
                  satisfaction.
                </div>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
