import { z } from 'zod';

// Daily Streaks System
export interface DailyStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  streakStartDate: Date;
  totalActiveDays: number;
  monthlyRaffleTickets: number;
  isEligibleForMonthlyRaffle: boolean;
}

// Monthly Campaign Participation
export interface MonthlyCampaignTracker {
  id: string;
  userId: string;
  month: string; // Format: YYYY-MM
  campaignsParticipated: number;
  campaignsCompleted: number;
  monthlyRaffleTicketEarned: boolean;
  isEligibleForMonthlyRaffle: boolean;
}

// Raffle Ticket System
export interface RaffleTicket {
  id: string;
  userId: string;
  ticketType: 'daily_streak' | 'monthly_participation';
  earnedDate: Date;
  month: string; // Format: YYYY-MM
  isUsed: boolean;
  raffleDrawId?: string;
}

// Monthly Raffle Draw
export interface MonthlyRaffleDraw {
  id: string;
  month: string; // Format: YYYY-MM
  totalTickets: number;
  totalParticipants: number;
  prizePool: {
    amount: number;
    token: 'USDC' | 'SEI';
  };
  winners: RaffleWinner[];
  drawDate: Date;
  status: 'pending' | 'active' | 'completed';
}

export interface RaffleWinner {
  userId: string;
  ticketId: string;
  prizeAmount: number;
  claimedAt?: Date;
}

// Streak Achievements
export const STREAK_MILESTONES = {
  5: { 
    name: "5-Day Warrior", 
    reward: "Monthly Raffle Ticket", 
    xp: 50,
    raffleTicket: true 
  },
  10: { 
    name: "Dedicated Explorer", 
    reward: "Monthly Raffle Ticket + 100 XP", 
    xp: 100,
    raffleTicket: true 
  },
  30: { 
    name: "Quest Master", 
    reward: "Monthly Raffle Ticket + 250 XP", 
    xp: 250,
    raffleTicket: true 
  },
  60: { 
    name: "Legendary Quester", 
    reward: "Monthly Raffle Ticket + 500 XP", 
    xp: 500,
    raffleTicket: true 
  },
} as const;

// Monthly Participation Thresholds
export const MONTHLY_PARTICIPATION_REWARDS = {
  10: {
    name: "Monthly Champion",
    reward: "Monthly Raffle Ticket",
    raffleTicket: true,
    xp: 200
  }
} as const;

// Utility functions
export function calculateStreakReward(streakDays: number): number {
  // Every 5 days of continuous streak gets a monthly raffle ticket
  return Math.floor(streakDays / 5);
}

export function isEligibleForStreakReward(streakDays: number): boolean {
  return streakDays > 0 && streakDays % 5 === 0;
}

export function isEligibleForMonthlyReward(campaignsInMonth: number): boolean {
  return campaignsInMonth >= 10;
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7); // YYYY-MM format
}
