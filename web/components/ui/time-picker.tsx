"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface TimePickerProps {
  value: string; // HH:MM format in local time
  onChange: (time: string) => void;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  disabled,
  className,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Basic validation: HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(val)) {
      const [hours, minutes] = val.split(":").map(Number);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        onChange(val);
      }
    }
  };

  const handleInputBlur = () => {
    // Format time on blur (add leading zeros) but only if input changed
    if (inputValue && /^\d{1,2}:\d{2}$/.test(inputValue)) {
      const [hours, minutes] = inputValue.split(":").map(Number);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        const formattedTime = `${String(hours).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}`;

        // Only update if the formatted time is different from current value
        if (formattedTime !== value) {
          setInputValue(formattedTime);
          onChange(formattedTime);
        } else {
          setInputValue(formattedTime);
        }
      } else {
        setInputValue(value || ""); // Reset to original value if invalid
      }
    } else {
      setInputValue(value || ""); // Reset to original value if invalid
    }
  };

  const formatDisplayTime = () => {
    if (!value) return "Select time";
    const [hours, minutes] = value.split(":").map(Number);
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${ampm}`;
  };

  // Helper function to convert local time to UTC timestamp
  const getUTCTimestamp = (localTime: string, date: Date = new Date()) => {
    if (!localTime) return null;

    const [hours, minutes] = localTime.split(":").map(Number);
    const localDate = new Date(date);
    localDate.setHours(hours, minutes, 0, 0);

    // Convert to UTC timestamp (milliseconds)
    return localDate.getTime();
  };

  // Get current local timezone offset for display
  const getTimezoneOffset = () => {
    const offset = new Date().getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const minutes = Math.abs(offset % 60);
    // getTimezoneOffset returns negative for timezones ahead of UTC
    const sign = offset < 0 ? "+" : "-";
    return `${sign}${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {formatDisplayTime()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="mb-4">
            <h4 className="font-medium mb-2">Enter Time</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Time (HH:MM) - Your Local Time
                </label>
                <Input
                  type="text"
                  placeholder="09:30"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className="text-center text-lg font-mono"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  Your timezone: {getTimezoneOffset()}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold">{formatDisplayTime()}</div>
            <div className="text-sm text-muted-foreground">
              {value &&
                `Local: ${value} | UTC: ${
                  getUTCTimestamp(value)
                    ? new Date(getUTCTimestamp(value)!)
                        .toISOString()
                        .slice(11, 16)
                    : "N/A"
                }`}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Export helper function for external use
export function convertLocalTimeToUTC(
  localTime: string,
  date: Date = new Date()
): number | null {
  if (!localTime) return null;

  const [hours, minutes] = localTime.split(":").map(Number);
  const localDate = new Date(date);
  localDate.setHours(hours, minutes, 0, 0);

  // Return UTC timestamp in milliseconds
  return localDate.getTime();
}

// Export helper function to get UTC timestamp for a specific date and time
export function getUTCTimestampForDate(
  localTime: string,
  date: Date
): number | null {
  if (!localTime) return null;

  const [hours, minutes] = localTime.split(":").map(Number);
  const localDate = new Date(date);
  localDate.setHours(hours, minutes, 0, 0);

  // Return UTC timestamp in milliseconds
  return localDate.getTime();
}
