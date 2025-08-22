"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CampaignFormSchema,
  type CampaignFormData,
  DistributionMethod,
  RewardType,
  TaskType,
  ContentTone,
  calculateTotalDeposit,
} from "@/lib/types/campaign";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuestContract } from "@/hooks/use-quest-contract";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import {
  Sparkles,
  Calendar,
  Users,
  Gift,
  Zap,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { BasicInfoStep } from "@/components/campaign/BasicInfoStep";
import { QuestConfigStep } from "@/components/campaign/QuestConfigStep";
import { RewardsStep } from "@/components/campaign/RewardsStep";
import { ReviewStep } from "@/components/campaign/ReviewStep";
import { AIAssistantPanel } from "@/components/campaign/AIAssistantPanel";
import { format } from "date-fns";

const steps = [
  {
    id: "basic",
    title: "Basic Info",
    description: "Campaign details and overview",
    icon: Sparkles,
  },
  {
    id: "quest",
    title: "Quest Setup",
    description: "Configure tasks and requirements",
    icon: Calendar,
  },
  {
    id: "rewards",
    title: "Rewards",
    description: "Set up reward distribution",
    icon: Gift,
  },
  {
    id: "review",
    title: "Review",
    description: "Review and deploy campaign",
    icon: Check,
  },
];

export default function CreateCampaignPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { createCampaign, isPending } = useQuestContract();

  const methods = useForm<CampaignFormData>({
    resolver: zodResolver(CampaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      organizationName: "",
      organizationLogo: "",
      questBanner: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      maxParticipants: 500,
      compulsoryTasks: [
        {
          id: "1",
          type: TaskType.X_FOLLOW,
          enabled: true,
          accountToFollow: "",
        },
        {
          id: "2",
          type: TaskType.X_POST,
          enabled: true,
          postLimit: 1,
          hashtags: [],
          accountsToTag: [],
        },
      ],
      rewardConfig: {
        amount: 100,
        type: RewardType.USDC,
        distributionMethod: DistributionMethod.LUCKY_DRAW,
        numberOfWinners: 10,
      },
      aiContentConfig: {
        platform: "X/Twitter",
        tone: ContentTone.CASUAL,
        language: "English",
        generateContent: false,
        customContent: "",
      },
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { isValid },
  } = methods;
  const watchedValues = watch();

  const onSubmit = async (data: CampaignFormData) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    if (!address) {
      alert("Wallet address not found");
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Create campaign in database via API
      const campaignData = {
        title: data.title,
        description: data.description,
        organizationName: data.organizationName,
        organizationLogo: data.organizationLogo,
        questBanner: data.questBanner,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        maxParticipants: data.maxParticipants,
        rewardAmount: data.rewardConfig.amount,
        rewardType: data.rewardConfig.type,
        distributionMethod:
          data.rewardConfig.distributionMethod === DistributionMethod.LUCKY_DRAW
            ? "lucky_draw"
            : "equal_distribution",
        numberOfWinners: data.rewardConfig.numberOfWinners,
        ownerWallet: address,
        tasks:
          data.compulsoryTasks?.map((task) => ({
            type:
              task.type === TaskType.X_FOLLOW
                ? "x_follow"
                : task.type === TaskType.X_POST
                ? "x_post"
                : "custom",
            title: task.customTitle || `${task.type} task`,
            instruction:
              task.customDescription || `Complete the ${task.type} task`,
            completionCriteria: `Successfully complete the ${task.type} task`,
            enabled: task.enabled,
            accountToFollow: task.accountToFollow,
            postLimit: task.postLimit,
            hashtags: task.hashtags || [],
            accountsToTag: task.accountsToTag || [],
            customTitle: task.customTitle,
            customDescription: task.customDescription,
            qpReward: 10, // Default QP reward
          })) || [],
      };

      // Create campaign in database
      const apiResponse = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      if (!apiResponse.ok) {
        throw new Error("Failed to create campaign in database");
      }

      const { campaign } = await apiResponse.json();

      // Step 2: Create campaign on blockchain
      await createCampaign({
        rewardTokenType: data.rewardConfig.type as "USDC" | "SEI",
        distributionMethod:
          data.rewardConfig.distributionMethod === DistributionMethod.LUCKY_DRAW
            ? 0
            : 1,
        startTime: data.startDate.getTime(),
        endTime: data.endDate.getTime(),
        maxParticipants: data.maxParticipants,
        totalRewardAmount: data.rewardConfig.amount.toString(),
        numberOfWinners:
          data.rewardConfig.numberOfWinners || data.maxParticipants,
      });

      // Step 3: Update campaign with blockchain data (this would be done via event listener in a real implementation)
      console.log("Campaign created successfully:", {
        api: campaign,
        blockchain: "pending",
      });

      // Redirect to campaign page
      router.push(`/campaigns/${campaign.id}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
      alert("Failed to create campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>
                Please connect your wallet to create campaigns
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Create Campaign</h1>
              <p className="text-muted-foreground mt-2">
                Set up your quest campaign with rewards and tasks
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              AI Assistant
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                      isActive
                        ? "border-primary bg-primary/10"
                        : isCompleted
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                  <CardContent className="p-6">
                    {currentStep === 0 && <BasicInfoStep />}
                    {currentStep === 1 && <QuestConfigStep />}
                    {currentStep === 2 && <RewardsStep />}
                    {currentStep === 3 && <ReviewStep data={watchedValues} />}
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  {currentStep === steps.length - 1 ? (
                    <Button
                      type="submit"
                      disabled={!isValid || isPending}
                      className="gap-2"
                    >
                      {isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Deploy Campaign
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button type="button" onClick={nextStep} className="gap-2">
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            </FormProvider>
          </div>

          {/* Sidebar - Campaign Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Campaign Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Title
                  </div>
                  <div className="font-medium truncate">
                    {watchedValues.title || "Untitled Campaign"}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Start Date & Time (UTC)
                  </div>
                  <div className="font-medium">
                    {watchedValues.startDate ? (
                      <>{format(watchedValues.startDate, "PPP p")}</>
                    ) : (
                      "Not set"
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    End Date & Time (UTC)
                  </div>
                  <div className="font-medium">
                    {watchedValues.endDate ? (
                      <>{format(watchedValues.endDate, "PPP p")}</>
                    ) : (
                      "Not set"
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Reward Pool
                  </div>
                  <div className="font-medium">
                    ${watchedValues.rewardConfig?.amount || 0}{" "}
                    {watchedValues.rewardConfig?.type || "USDC"}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Distribution
                  </div>
                  <Badge variant="secondary">
                    {watchedValues.rewardConfig?.distributionMethod ===
                    DistributionMethod.LUCKY_DRAW
                      ? "Lucky Draw"
                      : "Equal Split"}
                  </Badge>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Max Participants
                  </div>
                  <div className="font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {watchedValues.maxParticipants || 0}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Deposit Required
                  </div>
                  <div className="font-bold text-lg">
                    $
                    {calculateTotalDeposit(
                      watchedValues.rewardConfig?.amount || 0
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Includes ${watchedValues.rewardConfig?.amount || 0} rewards
                    + $5 platform fee
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Assistant Panel */}
        {showAIPanel && (
          <AIAssistantPanel
            onClose={() => setShowAIPanel(false)}
            currentData={watchedValues}
            onApplySuggestion={(suggestions) => {
              // Apply AI suggestions to form
              console.log("Applying AI suggestions:", suggestions);
            }}
          />
        )}
      </div>
    </div>
  );
}
