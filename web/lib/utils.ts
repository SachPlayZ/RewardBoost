import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utility functions for consistent UTC handling
export function toUnixTimestamp(date: Date | string): number {
  const dateObj = typeof date === 'string' ? new Date(date + 'Z') : date;
  return Math.floor(dateObj.getTime() / 1000);
}

export function toUnixTimestampUTC(date: Date | string): number | null {
  if (!date) return null;

  let dateObj: Date;

  if (typeof date === 'string') {
    // If it's already an ISO string with 'Z', don't add another 'Z'
    const dateString = date.endsWith('Z') ? date : date + 'Z';
    dateObj = new Date(dateString);
  } else {
    dateObj = date;
  }

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to toUnixTimestampUTC:', date);
    return null;
  }

  return Math.floor(dateObj.getTime() / 1000);
}

// Time validation utilities are no longer needed since time validation was removed from the contract
// This function is kept for backward compatibility but no longer enforces future timestamps
export function ensureFutureTimestamp(timestamp: number | null, bufferMinutes: number = 5): number {
  if (timestamp === null) {
    const currentTime = Math.floor(Date.now() / 1000);
    const buffer = bufferMinutes * 60;
    return currentTime + buffer;
  }

  return timestamp; // Return as-is, no validation
}

// Task type conversion utilities
export function getTaskTypeDisplayName(taskType: string): string {
  switch (taskType) {
    case 'x_follow':
      return 'Follow Account on X';
    case 'x_post':
      return 'Post on Twitter';
    case 'custom':
      return 'Custom Task';
    default:
      return taskType;
  }
}

export function getTaskTypeDescription(taskType: string): string {
  switch (taskType) {
    case 'x_follow':
      return 'Follow the specified account on X/Twitter';
    case 'x_post':
      return 'Create and post content on X/Twitter';
    case 'custom':
      return 'Complete the custom task as specified';
    default:
      return `Complete the ${taskType} task`;
  }
}
