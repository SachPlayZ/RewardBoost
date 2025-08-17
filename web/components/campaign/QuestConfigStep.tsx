"use client";

import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { CampaignFormData, TaskType } from "@/lib/types/campaign";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Plus,
  X,
  Calendar as CalendarIcon,
  Users,
  Twitter,
  Hash,
  AtSign,
  MessageSquare,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function QuestConfigStep() {
  const { control, watch, setValue } = useFormContext<CampaignFormData>();

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: "questSteps",
  });

  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");

  const addStep = () => {
    appendStep({
      id: Date.now().toString(),
      title: "",
      instruction: "",
      completionCriteria: "",
      xpReward: 10,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Quest Configuration</h2>
        <p className="text-muted-foreground">
          Set up the quest steps, timeline, and participation requirements
        </p>
      </div>

      {/* Timeline Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Timeline & Participation
          </CardTitle>
          <CardDescription>
            Configure when your quest runs and who can participate
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date (UTC) *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date (UTC) *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < watchedStartDate ||
                        date >
                          new Date(
                            watchedStartDate.getTime() + 7 * 24 * 60 * 60 * 1000
                          )
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Maximum duration: 7 days from start date
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Max Participants *
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="500"
                    min={1}
                    max={10000}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                </FormControl>
                <FormDescription>
                  Choose 500 or 1000 for optimal engagement
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Quest Steps */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quest Steps
              </CardTitle>
              <CardDescription>
                Define the actions participants need to complete
              </CardDescription>
            </div>
            <Button type="button" onClick={addStep} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {stepFields.map((field, index) => (
            <Card key={field.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Step {index + 1}</CardTitle>
                  {stepFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={control}
                  name={`questSteps.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Follow our X account"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name={`questSteps.${index}.instruction`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instruction *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed instructions for participants..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`questSteps.${index}.completionCriteria`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completion Criteria *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="How to verify completion..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name={`questSteps.${index}.xpReward`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>XP Reward</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={1000}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Experience points awarded for completing this step
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Compulsory Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5" />
            Compulsory Social Tasks
          </CardTitle>
          <CardDescription>
            Configure required social media actions (optional but recommended)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* X Follow Task */}
          <div className="space-y-4">
            <FormField
              control={control}
              name="compulsoryTasks.0.enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      <FormLabel className="text-base">
                        X/Twitter Follow
                      </FormLabel>
                      <Badge variant="secondary">10 XP</Badge>
                    </div>
                    <FormDescription>
                      Require participants to follow an X account
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {watch("compulsoryTasks.0.enabled") && (
              <FormField
                control={control}
                name="compulsoryTasks.0.accountToFollow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <AtSign className="h-4 w-4" />
                      Account to Follow
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the X username (with or without @)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <Separator />

          {/* X Post Task */}
          <div className="space-y-4">
            <FormField
              control={control}
              name="compulsoryTasks.1.enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <FormLabel className="text-base">
                        X/Twitter Post
                      </FormLabel>
                      <Badge variant="secondary">50 XP</Badge>
                      <Badge variant="outline">2x for verified</Badge>
                    </div>
                    <FormDescription>
                      Require participants to create a post with specific
                      requirements
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {watch("compulsoryTasks.1.enabled") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                <FormField
                  control={control}
                  name="compulsoryTasks.1.minCharacters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Characters</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={280}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 150)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum post length (default: 150)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="compulsoryTasks.1.postLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum posts per participant
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="compulsoryTasks.1.hashtags"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Required Hashtags
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="#web3 #quest #campaign (comma separated)"
                          value={field.value?.join(", ") || ""}
                          onChange={(e) => {
                            const tags = e.target.value
                              .split(",")
                              .map((tag) => tag.trim())
                              .filter((tag) => tag.length > 0);
                            field.onChange(tags);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Hashtags that must be included in posts (comma
                        separated)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="compulsoryTasks.1.accountsToTag"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel className="flex items-center gap-2">
                        <AtSign className="h-4 w-4" />
                        Accounts to Tag
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="@account1, @account2 (comma separated)"
                          value={field.value?.join(", ") || ""}
                          onChange={(e) => {
                            const accounts = e.target.value
                              .split(",")
                              .map((account) => account.trim())
                              .filter((account) => account.length > 0);
                            field.onChange(accounts);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        X accounts that must be tagged in posts (comma
                        separated)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
