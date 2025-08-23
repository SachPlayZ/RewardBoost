"use client";

import React, { useState } from "react";
import { useFormContext } from "@/components/ui/form";
//
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
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

export function BasicInfoStep() {
  const { control, setValue } = useFormContext<CampaignFormData>();
  const [isBeautifying, setIsBeautifying] = useState(false);

  const uploadToS3 = async (file: File, folder: string) => {
    const body = new FormData();
    body.append("file", file);
    body.append("folder", folder);
    body.append("filename", file.name);
    const res = await fetch("/api/upload", { method: "POST", body });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    return json.url as string;
  };

  const handleImageUpload = (fieldName: "organizationLogo" | "questBanner") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const folder =
            fieldName === "organizationLogo" ? "org-logos" : "quest-banners";
          const url = await uploadToS3(file, folder);
          setValue(fieldName, url, { shouldDirty: true });
        } catch (err) {
          console.error("Upload failed", err);
          alert("Image upload failed. Please try again.");
        }
      }
    };
    input.click();
  };

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

      <div className="space-y-6">
        {/* Main Form */}
        <FormField<CampaignFormData, "title">
          control={control}
          name="title"
          render={({
            field,
          }: {
            field: {
              value: string;
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
            };
          }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Campaign Title *
                {field.value && field.value.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900/20 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    AI Generated
                  </span>
                )}
              </FormLabel>
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

        <FormField<CampaignFormData, "description">
          control={control}
          name="description"
          render={({
            field,
          }: {
            field: {
              value: string;
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
            };
          }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Campaign Description *
                {field.value && field.value.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900/20 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    AI Generated
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Describe what users will achieve and why it matters..."
                    className="min-h-[120px] pr-12"
                    maxLength={500}
                    {...field}
                  />
                  {field.value && field.value.length > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900/20"
                      disabled={isBeautifying}
                      onClick={async () => {
                        setIsBeautifying(true);
                        try {
                          const response = await fetch(
                            "/api/ai/beautify-description",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                description: field.value,
                              }),
                            }
                          );

                          if (response.ok) {
                            const result = await response.json();
                            field.onChange({
                              target: { value: result.beautifiedDescription },
                            } as React.ChangeEvent<HTMLTextAreaElement>);
                          }
                        } catch (error) {
                          console.error(
                            "Failed to beautify description:",
                            error
                          );
                        } finally {
                          setIsBeautifying(false);
                        }
                      }}
                      title="Beautify description with AI"
                    >
                      {isBeautifying ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent" />
                      ) : (
                        <Wand2 className="h-4 w-4 text-orange-600" />
                      )}
                    </Button>
                  )}
                </div>
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

        <FormField<CampaignFormData, "organizationName">
          control={control}
          name="organizationName"
          render={({
            field,
          }: {
            field: {
              value: string;
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
            };
          }) => (
            <FormItem>
              <FormLabel>Organization Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your organization or company name"
                  maxLength={100}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The name of your organization that will be displayed on the
                campaign.
              </FormDescription>
              <FormMessage />
              <div className="text-xs text-muted-foreground text-right">
                {field.value?.length || 0}/100 characters
              </div>
            </FormItem>
          )}
        />

        <FormField<CampaignFormData, "organizationLogo">
          control={control}
          name="organizationLogo"
          render={({
            field,
          }: {
            field: {
              value: string;
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
            };
          }) => {
            const isS3 =
              typeof field.value === "string" &&
              /https?:\/\/[^\s]+\.s3\.[^\s]+\.amazonaws\.com\//.test(
                field.value
              );
            return (
              <FormItem>
                <FormLabel>Organization Logo (Optional)</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Upload organization logo or paste a URL"
                      readOnly={isS3}
                      disabled={isS3}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleImageUpload("organizationLogo")}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>
                  Upload or provide a URL for your organization logo.
                  Recommended size: 200x200px
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField<CampaignFormData, "questBanner">
          control={control}
          name="questBanner"
          render={({
            field,
          }: {
            field: {
              value: string;
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
            };
          }) => {
            const isS3 =
              typeof field.value === "string" &&
              /https?:\/\/[^\s]+\.s3\.[^\s]+\.amazonaws\.com\//.test(
                field.value
              );
            return (
              <FormItem>
                <FormLabel>Quest Banner (Optional)</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Upload quest banner or paste a URL"
                      readOnly={isS3}
                      disabled={isS3}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleImageUpload("questBanner")}
                    >
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
            );
          }}
        />
      </div>
    </div>
  );
}
