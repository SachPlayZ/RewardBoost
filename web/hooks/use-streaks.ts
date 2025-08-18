'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { 
  DailyStreak, 
  MonthlyCampaignTracker, 
  RaffleTicket,
  calculateStreakReward,
  isEligibleForStreakReward,
  isEligibleForMonthlyReward,
  getCurrentMonth,
  STREAK_MILESTONES,
  MONTHLY_PARTICIPATION_REWARDS
} from '@/lib/types/streaks';

// Mock data - in a real app, this would come from your backend
const mockStreakData: DailyStreak = {
  id: '1',
  userId: '0x742d35Cc6635C0532925a3b8D7Fb8d22567b9E52',
  currentStreak: 7,
  longestStreak: 15,
  lastActiveDate: new Date(),
  streakStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  totalActiveDays: 42,
  monthlyRaffleTickets: 1,
  isEligibleForMonthlyRaffle: true,
};

const mockMonthlyData: MonthlyCampaignTracker = {
  id: '1',
  userId: '0x742d35Cc6635C0532925a3b8D7Fb8d22567b9E52',
  month: getCurrentMonth(),
  campaignsParticipated: 8,
  campaignsCompleted: 6,
  monthlyRaffleTicketEarned: false,
  isEligibleForMonthlyRaffle: false,
};

const mockRaffleTickets: RaffleTicket[] = [
  {
    id: '1',
    userId: '0x742d35Cc6635C0532925a3b8D7Fb8d22567b9E52',
    ticketType: 'daily_streak',
    earnedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    month: getCurrentMonth(),
    isUsed: false,
  },
];

export function useStreaks() {
  const { address } = useAccount();
  const [streakData, setStreakData] = useState<DailyStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setStreakData(null);
      setLoading(false);
      return;
    }

    // Simulate API call
    const fetchStreakData = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStreakData(mockStreakData);
        setError(null);
      } catch (err) {
        setError('Failed to load streak data');
        console.error('Error fetching streak data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreakData();
  }, [address]);

  const updateStreak = async () => {
    if (!address || !streakData) return false;

    try {
      // Check if user already has activity today
      const today = new Date().toDateString();
      const lastActiveDay = streakData.lastActiveDate.toDateString();
      
      if (today === lastActiveDay) {
        return false; // Already active today
      }

      // Calculate new streak
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      const isConsecutive = lastActiveDay === yesterday;
      
      const newStreak = isConsecutive ? streakData.currentStreak + 1 : 1;
      const newTotalDays = streakData.totalActiveDays + 1;
      
      // Check if eligible for raffle ticket
      const earnedRaffleTicket = isEligibleForStreakReward(newStreak);
      const newRaffleTickets = streakData.monthlyRaffleTickets + (earnedRaffleTicket ? 1 : 0);

      const updatedStreak: DailyStreak = {
        ...streakData,
        currentStreak: newStreak,
        longestStreak: Math.max(streakData.longestStreak, newStreak),
        lastActiveDate: new Date(),
        totalActiveDays: newTotalDays,
        monthlyRaffleTickets: newRaffleTickets,
        isEligibleForMonthlyRaffle: newRaffleTickets > 0,
      };

      setStreakData(updatedStreak);
      
      // In a real app, this would be an API call
      console.log('Streak updated:', updatedStreak);
      
      return earnedRaffleTicket;
    } catch (err) {
      console.error('Error updating streak:', err);
      return false;
    }
  };

  const getStreakRewards = () => {
    if (!streakData) return [];
    
    return Object.entries(STREAK_MILESTONES)
      .filter(([days]) => streakData.currentStreak >= parseInt(days))
      .map(([days, reward]) => ({
        milestone: parseInt(days),
        ...reward,
        achieved: true,
      }));
  };

  const getNextMilestone = () => {
    if (!streakData) return null;
    
    const nextMilestone = Object.keys(STREAK_MILESTONES)
      .map(Number)
      .find(milestone => milestone > streakData.currentStreak);
    
    if (!nextMilestone) return null;
    
    return {
      milestone: nextMilestone,
      daysRemaining: nextMilestone - streakData.currentStreak,
      ...STREAK_MILESTONES[nextMilestone as keyof typeof STREAK_MILESTONES],
    };
  };

  return {
    streakData,
    loading,
    error,
    updateStreak,
    getStreakRewards,
    getNextMilestone,
    isEligibleForReward: streakData ? isEligibleForStreakReward(streakData.currentStreak) : false,
  };
}

export function useMonthlyTracking() {
  const { address } = useAccount();
  const [monthlyData, setMonthlyData] = useState<MonthlyCampaignTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setMonthlyData(null);
      setLoading(false);
      return;
    }

    // Simulate API call
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setMonthlyData(mockMonthlyData);
        setError(null);
      } catch (err) {
        setError('Failed to load monthly data');
        console.error('Error fetching monthly data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [address]);

  const updateCampaignParticipation = async () => {
    if (!address || !monthlyData) return false;

    try {
      const updatedData: MonthlyCampaignTracker = {
        ...monthlyData,
        campaignsParticipated: monthlyData.campaignsParticipated + 1,
      };

      // Check if eligible for monthly raffle ticket
      if (isEligibleForMonthlyReward(updatedData.campaignsParticipated) && !monthlyData.monthlyRaffleTicketEarned) {
        updatedData.monthlyRaffleTicketEarned = true;
        updatedData.isEligibleForMonthlyRaffle = true;
      }

      setMonthlyData(updatedData);
      
      // In a real app, this would be an API call
      console.log('Monthly participation updated:', updatedData);
      
      return updatedData.monthlyRaffleTicketEarned && !monthlyData.monthlyRaffleTicketEarned;
    } catch (err) {
      console.error('Error updating monthly participation:', err);
      return false;
    }
  };

  const getMonthlyProgress = () => {
    if (!monthlyData) return { progress: 0, remaining: 10 };
    
    return {
      progress: monthlyData.campaignsParticipated,
      remaining: Math.max(0, 10 - monthlyData.campaignsParticipated),
      isEligible: isEligibleForMonthlyReward(monthlyData.campaignsParticipated),
    };
  };

  return {
    monthlyData,
    loading,
    error,
    updateCampaignParticipation,
    getMonthlyProgress,
  };
}

export function useRaffleTickets() {
  const { address } = useAccount();
  const [tickets, setTickets] = useState<RaffleTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setTickets([]);
      setLoading(false);
      return;
    }

    // Simulate API call
    const fetchTickets = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 600));
        setTickets(mockRaffleTickets);
        setError(null);
      } catch (err) {
        setError('Failed to load raffle tickets');
        console.error('Error fetching raffle tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [address]);

  const getActiveTickets = () => {
    return tickets.filter(ticket => !ticket.isUsed && ticket.month === getCurrentMonth());
  };

  const getTotalTicketsThisMonth = () => {
    return getActiveTickets().length;
  };

  return {
    tickets,
    loading,
    error,
    getActiveTickets,
    getTotalTicketsThisMonth,
  };
}
