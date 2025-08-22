"use client";

import React from "react";
import { useFormContext } from "@/components/ui/form";
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Calendar as CalendarIcon,
  Users,
  Twitter,
  Hash,
  AtSign,
  MessageSquare,
} from "lucide-react";

export function QuestConfigStep() {
  const { control, watch } = useFormContext<CampaignFormData>();

  const watchedStartDate = watch("startDate");

  // Set default values for compulsory tasks when component mounts
  React.useEffect(() => {
    // Note: Default values are now set in the form initialization
  }, []);

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
            render={({
              field,
            }: {
              field: { value?: Date; onChange: (v?: Date) => void };
            }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date (UTC) *</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
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
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(d) => {
                            if (!d) {
                              field.onChange(undefined);
                              return;
                            }
                            const hours = field.value?.getUTCHours() ?? 0;
                            const minutes = field.value?.getUTCMinutes() ?? 0;
                            const combined = new Date(
                              Date.UTC(
                                d.getFullYear(),
                                d.getMonth(),
                                d.getDate(),
                                hours,
                                minutes
                              )
                            );
                            field.onChange(combined);
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            const todayUtc = new Date(
                              Date.UTC(
                                today.getUTCFullYear(),
                                today.getUTCMonth(),
                                today.getUTCDate()
                              )
                            );
                            const dateUtc = new Date(
                              Date.UTC(
                                date.getFullYear(),
                                date.getMonth(),
                                date.getDate()
                              )
                            );
                            return dateUtc < todayUtc;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      step={60}
                      value={(() => {
                        const v = field.value;
                        const hh = String(v?.getUTCHours() ?? 0).padStart(
                          2,
                          "0"
                        );
                        const mm = String(v?.getUTCMinutes() ?? 0).padStart(
                          2,
                          "0"
                        );
                        return `${hh}:${mm}`;
                      })()}
                      onChange={(e) => {
                        const time = e.target.value; // HH:MM
                        const [hhStr, mmStr] = time.split(":");
                        const hh = Number(hhStr || 0);
                        const mm = Number(mmStr || 0);
                        const base = field.value ?? new Date();
                        const combined = new Date(
                          Date.UTC(
                            base.getUTCFullYear(),
                            base.getUTCMonth(),
                            base.getUTCDate(),
                            hh,
                            mm
                          )
                        );
                        field.onChange(combined);
                      }}
                    />
                    <FormDescription>Time in UTC</FormDescription>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="endDate"
            render={({
              field,
            }: {
              field: { value?: Date; onChange: (v?: Date) => void };
            }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date (UTC) *</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Popover>
                      <PopoverTrigger asChild>
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
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(d) => {
                            if (!d) {
                              field.onChange(undefined);
                              return;
                            }
                            const hours = field.value?.getUTCHours() ?? 0;
                            const minutes = field.value?.getUTCMinutes() ?? 0;
                            const combined = new Date(
                              Date.UTC(
                                d.getFullYear(),
                                d.getMonth(),
                                d.getDate(),
                                hours,
                                minutes
                              )
                            );
                            field.onChange(combined);
                          }}
                          disabled={(date) => {
                            if (!watchedStartDate) return true;
                            const startUtc = new Date(
                              Date.UTC(
                                watchedStartDate.getUTCFullYear(),
                                watchedStartDate.getUTCMonth(),
                                watchedStartDate.getUTCDate()
                              )
                            );
                            const maxUtc = new Date(
                              startUtc.getTime() + 7 * 24 * 60 * 60 * 1000
                            );
                            const dateUtc = new Date(
                              Date.UTC(
                                date.getFullYear(),
                                date.getMonth(),
                                date.getDate()
                              )
                            );
                            return dateUtc < startUtc || dateUtc > maxUtc;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="time"
                      step={60}
                      value={(() => {
                        const v = field.value;
                        const hh = String(v?.getUTCHours() ?? 0).padStart(
                          2,
                          "0"
                        );
                        const mm = String(v?.getUTCMinutes() ?? 0).padStart(
                          2,
                          "0"
                        );
                        return `${hh}:${mm}`;
                      })()}
                      onChange={(e) => {
                        const time = e.target.value; // HH:MM
                        const [hhStr, mmStr] = time.split(":");
                        const hh = Number(hhStr || 0);
                        const mm = Number(mmStr || 0);
                        const base =
                          field.value ?? watchedStartDate ?? new Date();
                        const combined = new Date(
                          Date.UTC(
                            base.getUTCFullYear(),
                            base.getUTCMonth(),
                            base.getUTCDate(),
                            hh,
                            mm
                          )
                        );
                        field.onChange(combined);
                      }}
                    />
                    <FormDescription>
                      Time in UTC (max 7 days from start)
                    </FormDescription>
                  </div>
                </FormControl>
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
            render={({
              field,
            }: {
              field: { value?: number; onChange: (v: number) => void };
            }) => (
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
              render={({
                field,
              }: {
                field: { value?: boolean; onChange: (v: boolean) => void };
              }) => (
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
                render={({
                  field,
                }: {
                  field: { value?: string; onChange: (v: string) => void };
                }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <AtSign className="h-4 w-4" />
                      Account to Follow
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@username"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
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
              render={({
                field,
              }: {
                field: { value?: boolean; onChange: (v: boolean) => void };
              }) => (
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
                  name="compulsoryTasks.1.postLimit"
                  render={({
                    field,
                  }: {
                    field: { value?: number; onChange: (v: number) => void };
                  }) => (
                    <FormItem>
                      <FormLabel>Post Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
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
                  render={({
                    field,
                  }: {
                    field: {
                      value?: string[];
                      onChange: (v: string[]) => void;
                    };
                  }) => (
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
                  render={({
                    field,
                  }: {
                    field: {
                      value?: string[];
                      onChange: (v: string[]) => void;
                    };
                  }) => (
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
