"use client";

import React, { useState } from "react";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TestTimePickerPage() {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">TimePicker Component Demo</h1>
        <p className="text-muted-foreground">
          A simple, clean time input interface for quick time selection
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Start Time</CardTitle>
            <CardDescription>Select when your campaign starts</CardDescription>
          </CardHeader>
          <CardContent>
            <TimePicker value={startTime} onChange={setStartTime} />
            <div className="mt-2 text-sm text-muted-foreground">
              Selected: {startTime} UTC
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>End Time</CardTitle>
            <CardDescription>Select when your campaign ends</CardDescription>
          </CardHeader>
          <CardContent>
            <TimePicker value={endTime} onChange={setEndTime} />
            <div className="mt-2 text-sm text-muted-foreground">
              Selected: {endTime} UTC
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            What makes this TimePicker simple and effective
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">✅ Simple Typing Interface</h4>
              <p className="text-sm text-muted-foreground">
                Clean text input for direct time entry in HH:MM format
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">✅ Smart Validation</h4>
              <p className="text-sm text-muted-foreground">
                Real-time validation and automatic formatting of time input
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">✅ AM/PM Toggle</h4>
              <p className="text-sm text-muted-foreground">
                Easy switching between AM and PM with proper styling
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">✅ Auto-focus Input</h4>
              <p className="text-sm text-muted-foreground">
                Input field automatically focuses when opened for quick typing
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">✅ Error Handling</h4>
              <p className="text-sm text-muted-foreground">
                Invalid times automatically reset to previous valid value
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">✅ UTC Display</h4>
              <p className="text-sm text-muted-foreground">
                Shows both 12-hour format and UTC time for clarity
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
          <CardDescription>
            Simple instructions for time selection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">⌨️ Quick Time Entry</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Click the time button to open the input</li>
                <li>• Type time in HH:MM format (e.g., "14:30" or "2:30")</li>
                <li>• Press Enter or click outside to save</li>
                <li>• Use AM/PM buttons to adjust the period</li>
                <li>• Invalid times automatically reset to previous value</li>
              </ul>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <h5 className="font-medium mb-2">💡 Tips</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• You can type "9:30" or "09:30" - both work</li>
                <li>• The input automatically formats to HH:MM on save</li>
                <li>• AM/PM buttons work with any valid time</li>
                <li>• The interface shows both 12-hour and UTC time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
