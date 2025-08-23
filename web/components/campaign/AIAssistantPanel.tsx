"use client";

import React, { useState } from "react";
import { CampaignFormData, ContentTone } from "@/lib/types/campaign";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sparkles,
  X,
  Wand2,
  Lightbulb,
  Check,
  RefreshCw,
  Target,
  Gift,
  Calendar,
  Zap,
  Brain,
  TrendingUp,
  Users,
  Clock,
  Star,
} from "lucide-react";
import { useForm } from "react-hook-form";

interface AIAssistantPanelProps {
  onClose: () => void;
  currentData: CampaignFormData;
  onApplySuggestion: (suggestions: Partial<CampaignFormData>) => void;
}

interface GenerationFormData {
  prompt: string;
  category: string;
  tone: ContentTone;
  language: string;
}

export function AIAssistantPanel({
  onClose,
  currentData,
  onApplySuggestion,
}: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<"generate" | "tips">("generate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GenerationFormData>({
    defaultValues: {
      prompt: "",
      category: "",
      tone: ContentTone.CASUAL,
      language: "English",
    },
  });

  const watchedValues = watch();

  const generateCampaignContent = async (data: GenerationFormData) => {
    if (!data.prompt.trim()) {
      setError("Please enter a prompt for campaign generation");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: data.prompt,
          category: data.category || "General",
          tone: data.tone,
          language: data.language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to generate campaign content"
        );
      }

      const result = await response.json();

      // Directly apply the generated content without displaying it
      onApplySuggestion({
        title: result.title,
        description: result.description,
      });

      // Show success state and close
      setIsSuccess(true);

      // Close the panel after a brief success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const categories = [
    "DeFi & Finance",
    "NFTs & Digital Art",
    "Gaming & Metaverse",
    "Community Building",
    "Education & Learning",
    "Social Impact",
    "Innovation & Tech",
    "Trading & Investment",
    "Governance & DAOs",
    "Infrastructure",
    "General",
  ];

  const tipsForSuccess = [
    {
      icon: Target,
      title: "Clear Objectives",
      description: "Define specific, measurable goals for your campaign",
      color: "text-blue-600",
    },
    {
      icon: Users,
      title: "Target Audience",
      description: "Understand who you're trying to reach and engage",
      color: "text-green-600",
    },
    {
      icon: Gift,
      title: "Appropriate Rewards",
      description: "Set realistic reward amounts that motivate participation",
      color: "text-purple-600",
    },
    {
      icon: Clock,
      title: "Timing Matters",
      description: "Choose optimal start/end dates for maximum engagement",
      color: "text-orange-600",
    },
    {
      icon: Zap,
      title: "Simple Tasks",
      description: "Break complex requirements into easy-to-complete steps",
      color: "text-red-600",
    },
    {
      icon: Star,
      title: "Quality Content",
      description: "Use high-quality images and compelling descriptions",
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden backdrop-blur-md border-0 shadow-2xl">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>AI Campaign Assistant</CardTitle>
                <CardDescription>
                  Let AI help you create engaging campaign titles and
                  descriptions
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r bg-muted/30">
            <div className="p-4">
              <div className="space-y-2">
                <Button
                  variant={activeTab === "generate" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab("generate")}
                >
                  <Brain className="h-4 w-4" />
                  AI Generator
                </Button>
                <Button
                  variant={activeTab === "tips" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab("tips")}
                >
                  <Lightbulb className="h-4 w-4" />
                  Tips for Success
                </Button>
              </div>
            </div>

            <Separator />

            <div className="p-4">
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-medium mb-2">Tips for Success:</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Make titles clear and action-oriented</li>
                    <li>• Break complex tasks into simple steps</li>
                    <li>• Set realistic time estimates</li>
                    <li>• Choose appropriate reward amounts</li>
                    <li>• Use high-quality images</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "generate" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Generate Campaign Content
                  </h3>
                  <p className="text-muted-foreground">
                    Describe your campaign idea and let AI generate a compelling
                    title and description.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit(generateCampaignContent)}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium">
                      Campaign Prompt
                    </label>
                    <Textarea
                      {...register("prompt", {
                        required: "Prompt is required",
                      })}
                      placeholder="Describe your campaign idea, goals, target audience, or any specific requirements..."
                      className="mt-1 min-h-[100px]"
                    />
                    {errors.prompt && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.prompt.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={watchedValues.category}
                        onValueChange={(value) => setValue("category", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Tone</label>
                      <Select
                        value={watchedValues.tone}
                        onValueChange={(value) =>
                          setValue("tone", value as ContentTone)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ContentTone.CASUAL}>
                            Casual
                          </SelectItem>
                          <SelectItem value={ContentTone.FORMAL}>
                            Formal
                          </SelectItem>
                          <SelectItem value={ContentTone.FRIENDLY}>
                            Friendly
                          </SelectItem>
                          <SelectItem value={ContentTone.PROFESSIONAL}>
                            Professional
                          </SelectItem>
                          <SelectItem value={ContentTone.ENGAGING}>
                            Engaging
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Language</label>
                      <Select
                        value={watchedValues.language}
                        onValueChange={(value) => setValue("language", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                          <SelectItem value="Japanese">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className="gap-2 w-full"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating Campaign Content...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </form>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isSuccess && (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      <strong>Success!</strong> AI-generated content has been
                      automatically applied to your campaign. The panel will
                      close shortly.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {activeTab === "tips" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Tips for Campaign Success
                  </h3>
                  <p className="text-muted-foreground">
                    Follow these proven strategies to create engaging and
                    successful campaigns.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tipsForSuccess.map((tip, index) => {
                    const Icon = tip.icon;
                    return (
                      <Card
                        key={index}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg bg-muted ${tip.color.replace(
                                "text-",
                                "bg-"
                              )} bg-opacity-20`}
                            >
                              <Icon className={`h-5 w-5 ${tip.color}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{tip.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {tip.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Pro Tip:</strong> Use the AI generator above to
                    create compelling content that follows these best practices.
                    The AI is trained to generate titles and descriptions that
                    align with successful campaign strategies.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
