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
  value: string; // HH:MM format
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
  const [inputValue, setInputValue] = useState("");
  const [isAM, setIsAM] = useState(true);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(":").map(Number);
      setInputValue(value);
      setIsAM(hours < 12);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Parse time input (HH:MM format)
    if (/^\d{1,2}:\d{2}$/.test(val)) {
      const [hours, minutes] = val.split(":").map(Number);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        onChange(val);
      }
    }
  };

  const handleInputBlur = () => {
    // Validate and format input on blur
    if (inputValue && /^\d{1,2}:\d{2}$/.test(inputValue)) {
      const [hours, minutes] = inputValue.split(":").map(Number);
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        const formattedTime = `${String(hours).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}`;
        setInputValue(formattedTime);
        onChange(formattedTime);
      } else {
        setInputValue(value); // Reset to original value if invalid
      }
    } else {
      setInputValue(value); // Reset to original value if invalid
    }
  };

  const toggleAMPM = () => {
    setIsAM(!isAM);
    if (inputValue && /^\d{1,2}:\d{2}$/.test(inputValue)) {
      const [hours, minutes] = inputValue.split(":").map(Number);
      let newHours = hours;

      if (isAM && hours < 12) {
        // Currently AM, switching to PM
        newHours = hours === 0 ? 12 : hours + 12;
      } else if (!isAM && hours >= 12) {
        // Currently PM, switching to AM
        newHours = hours === 12 ? 0 : hours - 12;
      }

      const newTime = `${String(newHours).padStart(2, "0")}:${String(
        minutes
      ).padStart(2, "0")}`;
      setInputValue(newTime);
      onChange(newTime);
    }
  };

  const formatDisplayTime = () => {
    if (!value) return "Select time";
    const [hours, minutes] = value.split(":").map(Number);
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${displayHour}:${String(minutes).padStart(2, "0")} ${ampm}`;
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
                  Time (HH:MM)
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
              </div>

              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAMPM}
                  className={cn(
                    "px-3 py-1 text-xs",
                    isAM
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-accent"
                  )}
                >
                  AM
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAMPM}
                  className={cn(
                    "px-3 py-1 text-xs",
                    !isAM
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-accent"
                  )}
                >
                  PM
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold">{formatDisplayTime()}</div>
            <div className="text-sm text-muted-foreground">
              {value && `${value} UTC`}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
