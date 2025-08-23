"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  useCampaignParticipation,
  APICampaign,
} from "@/hooks/use-unified-data";
import { PlayCircle, Send, Crown, CheckCircle } from "lucide-react";

interface CampaignActionButtonProps {
  campaign: APICampaign;
  address: string;
  isJoining: boolean;
  onJoinCampaign: (campaignId: string) => void;
  onOpenTaskDialog: () => void;
  onOpenReviewDialog?: () => void;
}

export function CampaignActionButton({
  campaign,
  address,
  isJoining,
  onJoinCampaign,
  onOpenTaskDialog,
  onOpenReviewDialog,
}: CampaignActionButtonProps) {
  const router = useRouter();
  const participation = useCampaignParticipation(campaign.id, address);
  const { isOwner, hasJoined, isLoading, error } = participation;
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [checkingSubmissions, setCheckingSubmissions] = useState(false);

  // Check for existing submissions when user has joined
  useEffect(() => {
    if (hasJoined && address && campaign.id) {
      checkExistingSubmissions();
    }
  }, [hasJoined, address, campaign.id]);

  const checkExistingSubmissions = async () => {
    if (!address || !campaign.id) return;

    try {
      setCheckingSubmissions(true);
      const response = await fetch(
        `/api/campaigns/${campaign.id}/submissions?userWallet=${address}`
      );

      if (response.ok) {
        const data = await response.json();
        const submissions = data.submissions || [];
        setHasSubmitted(submissions.length > 0);
      }
    } catch (err) {
      console.error("Error checking existing submissions:", err);
    } finally {
      setCheckingSubmissions(false);
    }
  };

  if (isLoading || checkingSubmissions) {
    return (
      <Button disabled className="w-full gap-2">
        <PlayCircle className="h-4 w-4" />
        Loading...
      </Button>
    );
  }

  if (error) {
    return (
      <Button disabled className="w-full gap-2">
        <PlayCircle className="h-4 w-4" />
        Error
      </Button>
    );
  }

  if (isOwner) {
    return (
      <Button
        onClick={() => router.push(`/campaigns/${campaign.id}`)}
        className="w-full gap-2"
        variant="outline"
      >
        <Crown className="h-4 w-4" />
        Manage Campaign
      </Button>
    );
  }

  if (hasJoined) {
    if (hasSubmitted) {
      return (
        <Button disabled className="w-full gap-2" variant="outline">
          <CheckCircle className="h-4 w-4" />
          Submitted Already
        </Button>
      );
    }

    return (
      <Button
        onClick={onOpenTaskDialog}
        className="w-full gap-2"
        variant="outline"
      >
        <Send className="h-4 w-4" />
        Submit Tasks
      </Button>
    );
  }

  return (
    <Button
      onClick={() => onJoinCampaign(campaign.id)}
      disabled={isJoining}
      className="w-full gap-2"
    >
      <PlayCircle className="h-4 w-4" />
      {isJoining ? "Joining..." : "Join Quest"}
    </Button>
  );
}
