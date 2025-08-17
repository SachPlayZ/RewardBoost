"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { CampaignFormData } from "@/lib/types/campaign";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageIcon, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BasicInfoStep() {
  const { control } = useFormContext<CampaignFormData>();

  const suggestedTitles = [
    "Community Builder Challenge",
    "Web3 Engagement Quest",
    "Social Impact Mission",
    "Creator Spotlight Campaign",
    "Innovation Showcase",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">
          Basic Campaign Information
        </h2>
        <p className="text-muted-foreground">
          Provide the essential details for your quest campaign
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Title *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter a short, action-oriented title"
                    maxLength={100}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Keep it clear and engaging. This will be the first thing users
                  see.
                </FormDescription>
                <FormMessage />
                <div className="text-xs text-muted-foreground text-right">
                  {field.value?.length || 0}/100 characters
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Description *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what users will achieve and why it matters..."
                    className="min-h-[120px]"
                    maxLength={500}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Explain the purpose, benefits, and what participants will gain
                  from completing this quest.
                </FormDescription>
                <FormMessage />
                <div className="text-xs text-muted-foreground text-right">
                  {field.value?.length || 0}/500 characters
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="questImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quest Image (Optional)</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                    />
                    <Button type="button" variant="outline" size="icon">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Upload or provide a URL for the quest banner image.
                  Recommended size: 1200x600px
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tips Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Tips for Success
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">
                  Title Best Practices:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Make titles clear and action-oriented</li>
                  <li>• Include the main benefit or goal</li>
                  <li>• Keep it under 50 characters if possible</li>
                  <li>• Use power words like "Build", "Create", "Discover"</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">
                  Description Guidelines:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Explain the "why" behind your quest</li>
                  <li>• Highlight what participants will learn</li>
                  <li>• Mention any exclusive benefits</li>
                  <li>• Keep it scannable with bullet points</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Suggested Titles:</h4>
                <div className="space-y-2">
                  {suggestedTitles.map((title, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => {
                        // You could set the title here if needed
                        console.log("Suggested title:", title);
                      }}
                    >
                      <div className="text-xs">{title}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
