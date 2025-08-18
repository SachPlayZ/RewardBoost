"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  useStreaks,
  useMonthlyTracking,
  useRaffleTickets,
} from "@/hooks/use-streaks";
import {
  Flame,
  Calendar,
  Trophy,
  Ticket,
  Zap,
  Target,
  Gift,
  Clock,
  Star,
} from "lucide-react";

export function StreakCard() {
  const { streakData, loading, updateStreak, getNextMilestone } = useStreaks();
  const { monthlyData, getMonthlyProgress } = useMonthlyTracking();
  const { getTotalTicketsThisMonth } = useRaffleTickets();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!streakData) return null;

  const nextMilestone = getNextMilestone();
  const monthlyProgress = getMonthlyProgress();
  const totalTickets = getTotalTicketsThisMonth();

  const handleUpdateStreak = async () => {
    const earnedTicket = await updateStreak();
    if (earnedTicket) {
      // Show notification or celebration
      console.log("🎉 Earned a raffle ticket!");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Daily Streaks & Rewards
        </CardTitle>
        <CardDescription>
          Maintain daily activity to earn monthly raffle tickets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Streak */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
            {streakData.currentStreak}
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
          <div className="text-sm text-muted-foreground">
            Current Streak (days)
          </div>

          {/* Streak Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-semibold">
                {streakData.longestStreak}
              </div>
              <div className="text-xs text-muted-foreground">
                Longest Streak
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {streakData.totalActiveDays}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Active Days
              </div>
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Next Milestone</span>
              <Badge variant="outline">
                {nextMilestone.daysRemaining} days to go
              </Badge>
            </div>
            <Progress
              value={(streakData.currentStreak / nextMilestone.milestone) * 100}
              className="h-3"
            />
            <div className="text-center">
              <div className="font-medium text-sm">{nextMilestone.name}</div>
              <div className="text-xs text-muted-foreground">
                {nextMilestone.reward}
              </div>
            </div>
          </div>
        )}

        {/* Monthly Campaign Progress */}
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Monthly Campaigns</span>
            </div>
            <Badge
              variant={monthlyProgress.isEligible ? "default" : "secondary"}
            >
              {monthlyProgress.progress}/10
            </Badge>
          </div>
          <Progress
            value={(monthlyProgress.progress / 10) * 100}
            className="h-2"
          />
          <div className="text-xs text-muted-foreground text-center">
            {monthlyProgress.isEligible
              ? "🎉 Eligible for monthly raffle ticket!"
              : `${monthlyProgress.remaining} more campaigns for raffle ticket`}
          </div>
        </div>

        {/* Raffle Tickets */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Ticket className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <div className="font-medium">Monthly Raffle Tickets</div>
              <div className="text-sm text-muted-foreground">
                Earned from streaks & campaigns
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-600">
              {totalTickets}
            </div>
            <div className="text-xs text-muted-foreground">This Month</div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleUpdateStreak}
          className="w-full gap-2"
          disabled={
            new Date().toDateString() ===
            streakData.lastActiveDate.toDateString()
          }
        >
          {new Date().toDateString() ===
          streakData.lastActiveDate.toDateString() ? (
            <>
              <Clock className="h-4 w-4" />
              Already Active Today
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Mark Daily Activity
            </>
          )}
        </Button>

        {/* Tips */}
        <Alert>
          <Star className="h-4 w-4" />
          <AlertDescription>
            <div className="text-sm space-y-1">
              <div className="font-medium">💡 Pro Tips:</div>
              <ul className="text-xs space-y-0.5">
                <li>• Complete daily quests to maintain your streak</li>
                <li>• Every 5-day streak earns a monthly raffle ticket</li>
                <li>
                  • Participate in 10+ campaigns per month for bonus ticket
                </li>
                <li>• Monthly raffles feature exclusive token prizes</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

export function MonthlyRaffleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Monthly Raffle
        </CardTitle>
        <CardDescription>
          Exclusive monthly draws for active community members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-yellow-600">$500</div>
          <div className="text-sm text-muted-foreground">
            This Month's Prize Pool
          </div>
          <Badge variant="outline">USDC + SEI Tokens</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-semibold">1,247</div>
            <div className="text-xs text-muted-foreground">Total Tickets</div>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="text-lg font-semibold">623</div>
            <div className="text-xs text-muted-foreground">Participants</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Draw Date</span>
            <span className="font-medium">Dec 31, 2024</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Winners Selected</span>
            <span className="font-medium">10 Winners</span>
          </div>
        </div>

        <Alert>
          <Gift className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Winners are selected randomly using verifiable on-chain randomness.
            Prizes are automatically distributed to winners' wallets.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
