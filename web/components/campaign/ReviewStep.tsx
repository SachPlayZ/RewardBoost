"use client";

import React from "react";
import {
  CampaignFormData,
  DistributionMethod,
  TaskType,
  calculateTotalDeposit,
} from "@/lib/types/campaign";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import {
  CheckCircle,
  Calendar,
  Users,
  Gift,
  Twitter,
  Hash,
  AtSign,
  MessageSquare,
  Target,
  DollarSign,
  Info,
  Clock,
} from "lucide-react";

interface ReviewStepProps {
  data: CampaignFormData;
}

export function ReviewStep({ data }: ReviewStepProps) {
  const totalDeposit = calculateTotalDeposit(data.rewardConfig?.amount || 0);
  const enabledTasks =
    data.compulsoryTasks?.filter((task) => task.enabled) || [];

  const calculateDuration = () => {
    if (!data.startDate || !data.endDate) return "Not set";
    const diffTime = data.endDate.getTime() - data.startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  };

  const calculateRewardPerWinner = () => {
    if (!data.rewardConfig) return "0";

    if (
      data.rewardConfig.distributionMethod === DistributionMethod.LUCKY_DRAW
    ) {
      return data.rewardConfig.numberOfWinners
        ? (
            data.rewardConfig.amount / data.rewardConfig.numberOfWinners
          ).toFixed(2)
        : "0";
    } else {
      return data.maxParticipants
        ? (data.rewardConfig.amount / data.maxParticipants).toFixed(2)
        : "0";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Review & Deploy</h2>
        <p className="text-muted-foreground">
          Review all campaign details before deployment to the blockchain
        </p>
      </div>

      {/* Campaign Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Campaign Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">
              {data.title || "Untitled Campaign"}
            </h3>
            <p className="text-muted-foreground mt-1">
              {data.description || "No description provided"}
            </p>
          </div>

          {data.questImage && (
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Quest Image
              </div>
              <div className="mt-2 w-full h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={data.questImage}
                  alt="Quest banner"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden"
                    );
                  }}
                />
                <div className="hidden text-muted-foreground text-sm">
                  Failed to load image
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline & Participation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline & Participation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Start Date
              </div>
              <div className="mt-1 font-medium">
                {data.startDate ? format(data.startDate, "PPP") : "Not set"}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                End Date
              </div>
              <div className="mt-1 font-medium">
                {data.endDate ? format(data.endDate, "PPP") : "Not set"}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                Duration
              </div>
              <div className="mt-1 font-medium">{calculateDuration()}</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              Maximum Participants
            </div>
            <div className="mt-1 text-xl font-semibold">
              {data.maxParticipants?.toLocaleString() || 0}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quest Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quest Steps ({data.questSteps?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.questSteps?.map((step, index) => (
              <div key={step.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Step {index + 1}</Badge>
                      <h4 className="font-medium">{step.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {step.instruction}
                    </p>
                    <div className="mt-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        Completion Criteria:
                      </div>
                      <div className="text-sm">{step.completionCriteria}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{step.xpReward} XP</Badge>
                </div>
              </div>
            )) || (
              <div className="text-center text-muted-foreground py-8">
                No quest steps configured
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compulsory Tasks */}
      {enabledTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitter className="h-5 w-5" />
              Compulsory Social Tasks ({enabledTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enabledTasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {task.type === TaskType.X_FOLLOW ? (
                      <Twitter className="h-4 w-4" />
                    ) : (
                      <MessageSquare className="h-4 w-4" />
                    )}
                    <h4 className="font-medium">
                      {task.type === TaskType.X_FOLLOW
                        ? "X/Twitter Follow"
                        : "X/Twitter Post"}
                    </h4>
                    <Badge variant="secondary">
                      {task.type === TaskType.X_FOLLOW ? "10 XP" : "50 XP"}
                    </Badge>
                  </div>

                  {task.type === TaskType.X_FOLLOW && task.accountToFollow && (
                    <div className="flex items-center gap-2 text-sm">
                      <AtSign className="h-3 w-3" />
                      <span>Follow: {task.accountToFollow}</span>
                    </div>
                  )}

                  {task.type === TaskType.X_POST && (
                    <div className="space-y-2 text-sm">
                      <div>Minimum characters: {task.minCharacters}</div>
                      <div>Post limit: {task.postLimit}</div>
                      {task.hashtags && task.hashtags.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3" />
                          <span>Hashtags: {task.hashtags.join(", ")}</span>
                        </div>
                      )}
                      {task.accountsToTag && task.accountsToTag.length > 0 && (
                        <div className="flex items-center gap-2">
                          <AtSign className="h-3 w-3" />
                          <span>Tags: {task.accountsToTag.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rewards Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Rewards Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Total Reward Pool
                </div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {data.rewardConfig?.amount || 0}{" "}
                  {data.rewardConfig?.type || "USDC"}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Distribution Method
                </div>
                <Badge variant="outline" className="mt-1">
                  {data.rewardConfig?.distributionMethod ===
                  DistributionMethod.LUCKY_DRAW
                    ? "Lucky Draw"
                    : "Equal Distribution"}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Number of Winners
                </div>
                <div className="text-xl font-semibold">
                  {data.rewardConfig?.distributionMethod ===
                  DistributionMethod.LUCKY_DRAW
                    ? data.rewardConfig.numberOfWinners?.toLocaleString() || 0
                    : data.maxParticipants?.toLocaleString() || 0}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Reward per Winner
                </div>
                <div className="text-xl font-semibold">
                  ${calculateRewardPerWinner()}{" "}
                  {data.rewardConfig?.type || "USDC"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deposit Summary */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-2">
            Total Deposit Required: ${totalDeposit}
          </div>
          <div className="text-sm space-y-1">
            <div>• Reward Pool: ${data.rewardConfig?.amount || 0}</div>
            <div>• Platform Fee: $5.00</div>
            <div className="text-muted-foreground">
              This amount will be transferred from your wallet to the smart
              contract upon campaign deployment.
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Final Warning */}
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-2">⚠️ Important Notice</div>
          <div className="text-sm">
            Once deployed to the blockchain, this campaign cannot be modified.
            Please review all details carefully before proceeding with
            deployment.
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
