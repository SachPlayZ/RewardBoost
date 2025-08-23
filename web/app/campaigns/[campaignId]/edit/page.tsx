"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  Calendar,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

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
  accountToFollow?: string;
  postLimit?: number;
  hashtags: string[];
  accountsToTag: string[];
  customTitle?: string;
  customDescription?: string;
  qpReward: number;
}

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const campaignId = params.campaignId as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state for editable fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationLogo, setOrganizationLogo] = useState("");
  const [questBanner, setQuestBanner] = useState("");

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaign) {
      setTitle(campaign.title);
      setDescription(campaign.description);
      setOrganizationName(campaign.organizationName);
      setOrganizationLogo(campaign.organizationLogo || "");
      setQuestBanner(campaign.questBanner || "");
    }
  }, [campaign]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch campaign");
      }

      const data = await response.json();
      setCampaign(data.campaign);
    } catch (err) {
      console.error("Error fetching campaign:", err);
      setError("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!campaign || !address) return;

    // Validate required fields
    if (!title.trim() || !description.trim() || !organizationName.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/campaigns/${campaignId}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          organizationName: organizationName.trim(),
          organizationLogo: organizationLogo.trim() || null,
          questBanner: questBanner.trim() || null,
          updatedBy: address,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update campaign");
      }

      const result = await response.json();

      setSuccess("Campaign updated successfully!");

      toast({
        title: "Campaign Updated",
        description: "Your campaign details have been successfully updated.",
        variant: "default",
      });

      // Refresh campaign data
      setCampaign(result.campaign);

      // Redirect after short delay
      setTimeout(() => {
        router.push(`/campaigns/${campaignId}`);
      }, 2000);
    } catch (err) {
      console.error("Error updating campaign:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update campaign";
      setError(errorMessage);

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/campaigns/${campaignId}`);
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

  if (error && !campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card>
            <CardContent className="py-12">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
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

  if (!campaign) return null;

  // Check if user is the owner
  const isOwner = address?.toLowerCase() === campaign.ownerWallet.toLowerCase();

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>
                Connect your wallet to edit campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => router.push("/campaigns")}>
                Back to Campaigns
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Only the campaign owner can edit this campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => router.push(`/campaigns/${campaignId}`)}>
                View Campaign
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/campaigns/${campaignId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaign
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Edit Campaign</h1>
              <p className="text-muted-foreground mt-2">
                Update your campaign details. Changes are saved immediately.
              </p>
            </div>
            <Badge
              variant={campaign.status === "active" ? "default" : "secondary"}
            >
              {campaign.status}
            </Badge>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  Edit the basic information about your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter campaign title"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your campaign..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="organization">Organization Name *</Label>
                  <Input
                    id="organization"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="Your organization name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="logo">Organization Logo URL</Label>
                  <Input
                    id="logo"
                    value={organizationLogo}
                    onChange={(e) => setOrganizationLogo(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="banner">Quest Banner URL</Label>
                  <Input
                    id="banner"
                    value={questBanner}
                    onChange={(e) => setQuestBanner(e.target.value)}
                    placeholder="https://example.com/banner.png"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge
                    variant={
                      campaign.status === "active" ? "default" : "secondary"
                    }
                  >
                    {campaign.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Participants</span>
                  <span className="font-medium">
                    {campaign.currentParticipants} / {campaign.maxParticipants}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Submissions</span>
                  <span className="font-medium">
                    {campaign.submissionCount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rewards</span>
                  <span className="font-medium">
                    ${campaign.rewardAmount} {campaign.rewardType}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full"
                >
                  Cancel
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => router.push(`/campaigns/${campaignId}`)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Campaign
                </Button>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  • You can edit campaign details even when the campaign is live
                </p>
                <p>• Changes are saved immediately and visible to all users</p>
                <p>
                  • Task configurations and rewards cannot be modified once live
                </p>
                <p>• Only the campaign owner can make these edits</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
