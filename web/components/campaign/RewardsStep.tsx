"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import {
  CampaignFormData,
  RewardType,
  DistributionMethod,
  calculateTotalDeposit,
} from "@/lib/types/campaign";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Gift,
  DollarSign,
  Users,
  Trophy,
  Shuffle,
  Equal,
  AlertCircle,
  Calculator,
  Info,
} from "lucide-react";

export function RewardsStep() {
  const { control, watch } = useFormContext<CampaignFormData>();

  const watchedRewardConfig = watch("rewardConfig");
  const watchedMaxParticipants = watch("maxParticipants");

  const totalDeposit = calculateTotalDeposit(watchedRewardConfig?.amount || 0);

  // Calculate rewards per winner based on distribution method
  const calculateRewardPerWinner = () => {
    if (!watchedRewardConfig) return 0;

    if (
      watchedRewardConfig.distributionMethod === DistributionMethod.LUCKY_DRAW
    ) {
      return watchedRewardConfig.numberOfWinners
        ? (
            watchedRewardConfig.amount / watchedRewardConfig.numberOfWinners
          ).toFixed(2)
        : "0";
    } else {
      return watchedMaxParticipants
        ? (watchedRewardConfig.amount / watchedMaxParticipants).toFixed(2)
        : "0";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Reward Configuration</h2>
        <p className="text-muted-foreground">
          Set up how participants will be rewarded for completing your quest
        </p>
      </div>

      {/* Reward Amount and Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Reward Pool
          </CardTitle>
          <CardDescription>
            Configure the total reward amount and token type
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="rewardConfig.amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Reward Amount *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="100"
                      min={1}
                      step="0.01"
                      className="pl-10"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Total amount to be distributed among winners
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="rewardConfig.type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward Token *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={RewardType.USDC}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full" />
                        USDC
                      </div>
                    </SelectItem>
                    <SelectItem value={RewardType.SEI}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full" />
                        SEI
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the token for reward distribution
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Distribution Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Distribution Method
          </CardTitle>
          <CardDescription>
            Choose how rewards will be distributed to participants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="rewardConfig.distributionMethod"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {/* Lucky Draw Option */}
                    <div className="relative">
                      <RadioGroupItem
                        value={DistributionMethod.LUCKY_DRAW}
                        id="lucky-draw"
                        className="peer sr-only"
                      />
                      <label
                        htmlFor="lucky-draw"
                        className="flex flex-col rounded-lg border-2 border-muted p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                            <Shuffle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <div className="font-semibold">Lucky Draw</div>
                            <Badge variant="secondary" className="text-xs">
                              Random Selection
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Randomly select a limited number of winners from all
                          participants. Higher rewards per winner but not
                          everyone gets rewarded.
                        </p>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span>Limited winners with higher rewards</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Shuffle className="h-4 w-4 text-purple-500" />
                            <span>Fair random selection process</span>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Equal Distribution Option */}
                    <div className="relative">
                      <RadioGroupItem
                        value={DistributionMethod.EQUAL_DISTRIBUTION}
                        id="equal-distribution"
                        className="peer sr-only"
                      />
                      <label
                        htmlFor="equal-distribution"
                        className="flex flex-col rounded-lg border-2 border-muted p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                            <Equal className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <div className="font-semibold">
                              Equal Distribution
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Everyone Wins
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Distribute rewards equally among all participants who
                          complete the quest. Lower individual rewards but
                          everyone gets something.
                        </p>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-green-500" />
                            <span>All participants are rewarded</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Equal className="h-4 w-4 text-blue-500" />
                            <span>Fair and inclusive approach</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Lucky Draw Configuration */}
          {watchedRewardConfig?.distributionMethod ===
            DistributionMethod.LUCKY_DRAW && (
            <div className="mt-6 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-4">Lucky Draw Configuration</h4>
              <FormField
                control={control}
                name="rewardConfig.numberOfWinners"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Number of Winners *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        min={1}
                        max={watchedMaxParticipants || 1000}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      How many participants will receive rewards (max:{" "}
                      {watchedMaxParticipants || 1000})
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reward Calculation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Reward Summary
          </CardTitle>
          <CardDescription>
            Preview of how rewards will be distributed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                ${watchedRewardConfig?.amount || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Reward Pool
              </div>
              <Badge variant="outline" className="mt-2">
                {watchedRewardConfig?.type || "USDC"}
              </Badge>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {watchedRewardConfig?.distributionMethod ===
                DistributionMethod.LUCKY_DRAW
                  ? watchedRewardConfig.numberOfWinners || 0
                  : watchedMaxParticipants || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Number of Winners
              </div>
              <Badge variant="outline" className="mt-2">
                {watchedRewardConfig?.distributionMethod ===
                DistributionMethod.LUCKY_DRAW
                  ? "Lucky Draw"
                  : "All Participants"}
              </Badge>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${calculateRewardPerWinner()}
              </div>
              <div className="text-sm text-muted-foreground">
                Reward per Winner
              </div>
              <Badge variant="outline" className="mt-2">
                {watchedRewardConfig?.type || "USDC"}
              </Badge>
            </div>
          </div>

          {/* Total Deposit Required */}
          <Alert className="mt-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">
                Total Deposit Required: ${totalDeposit}
              </div>
              <div className="text-sm space-y-1">
                <div>• Reward Pool: ${watchedRewardConfig?.amount || 0}</div>
                <div>• Platform Fee: $5.00 (flat fee)</div>
                <div className="text-muted-foreground">
                  This amount will be deducted from your wallet when creating
                  the campaign.
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Warnings */}
          {watchedRewardConfig?.distributionMethod ===
            DistributionMethod.LUCKY_DRAW &&
            watchedRewardConfig.numberOfWinners &&
            watchedRewardConfig.numberOfWinners >
              (watchedMaxParticipants || 0) && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Number of winners cannot exceed maximum participants (
                  {watchedMaxParticipants}).
                </AlertDescription>
              </Alert>
            )}

          {parseFloat(calculateRewardPerWinner()) < 1 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Reward per winner is very low (${calculateRewardPerWinner()}).
                Consider reducing the number of winners or increasing the reward
                pool.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
