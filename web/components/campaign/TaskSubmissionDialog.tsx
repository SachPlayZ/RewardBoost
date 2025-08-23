"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "wagmi";
import { APICampaign } from "@/hooks/use-unified-data";
import { useToast } from "@/hooks/use-toast";
import {
  Twitter,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCheck,
  Send,
  ArrowRight,
  Shield,
  Sparkles,
  Brain,
  Loader2,
  RefreshCw,
  Copy,
  Pencil,
} from "lucide-react";

interface Task {
  id: string;
  type: string;
  title?: string;
  instruction?: string;
  completionCriteria?: string;
  enabled: boolean;
  accountToFollow?: string;
  postLimit?: number;
  hashtags?: string[];
  accountsToTag?: string[];
  customTitle?: string;
  customDescription?: string;
  qpReward: number;
}

interface Submission {
  id?: string;
  taskId: string;
  taskType: string;
  submissionData: any;
  status: "pending" | "approved" | "rejected";
}

interface TwitterAuthState {
  isAuthenticated: boolean;
  username?: string;
  name?: string;
  profileImage?: string;
  id?: string;
  isVerifying: boolean;
}

interface TaskSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  apiCampaign: APICampaign;
  onSubmissionSuccess?: () => void; // Callback to refresh parent component
}

export function TaskSubmissionDialog({
  open,
  onOpenChange,
  campaignId,
  apiCampaign,
  onSubmissionSuccess,
}: TaskSubmissionDialogProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Record<string, Submission>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [twitterAuth, setTwitterAuth] = useState<TwitterAuthState>({
    isAuthenticated: false,
    isVerifying: false,
  });
  const [currentStep, setCurrentStep] = useState<"auth" | "tasks" | "submit">(
    "auth"
  );
  const [postLink, setPostLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTweetGenerator, setShowTweetGenerator] = useState(true);
  const [tweetContent, setTweetContent] = useState("");
  const [tweetLanguage, setTweetLanguage] = useState("English");
  const [savedTweetPreview, setSavedTweetPreview] = useState<string>("");
  const [showSavedTweet, setShowSavedTweet] = useState(false);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);

  // Load existing submissions and check Twitter auth
  useEffect(() => {
    if (open && address && campaignId) {
      loadExistingSubmissions();
      checkTwitterAuth();
    }
  }, [open, address, campaignId]);

  // Reset saved tweet preview when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setShowSavedTweet(false);
      setSavedTweetPreview("");
    }
  }, [open]);

  // Re-check Twitter auth when dialog becomes visible (in case user just completed auth)
  useEffect(() => {
    if (open && address) {
      // Small delay to ensure any recent auth changes are processed
      const timer = setTimeout(() => {
        checkTwitterAuth();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [open, address]);

  // Global loading overlay that covers entire screen
  if (open && (isSubmittingAll || loading)) {
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-[9999] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-20 h-20 animate-spin text-orange-500 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-white mb-3">
            {isSubmittingAll
              ? "Submitting All Tasks"
              : currentStep === "auth"
              ? "Redirecting to Twitter..."
              : "Processing..."}
          </h3>
          <p className="text-gray-300 text-lg">
            {isSubmittingAll
              ? "Please wait while we process your submissions..."
              : currentStep === "auth"
              ? "Please wait while we redirect you to Twitter..."
              : "Please wait while we process your request..."}
          </p>
        </div>
      </div>
    );
  }

  const checkTwitterAuth = async () => {
    if (!address) return;

    try {
      setTwitterAuth((prev) => ({ ...prev, isVerifying: true }));
      const response = await fetch(
        `/api/twitter/link?walletAddress=${address}`
      );

      if (response.ok) {
        const data = await response.json();
        setTwitterAuth({
          isAuthenticated: data.linked,
          username: data.twitterUsername,
          name: data.twitterName,
          profileImage: data.twitterProfileImage,
          isVerifying: false,
        });

        if (data.linked) {
          setCurrentStep("tasks");
          toast({
            title: "Twitter Connected!",
            description: `Successfully linked as @${data.twitterUsername}`,
            variant: "default",
          });
        }
      }
    } catch (err) {
      console.error("Error checking Twitter link:", err);
      setTwitterAuth((prev) => ({ ...prev, isVerifying: false }));
    }
  };

  const loadExistingSubmissions = async () => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/submissions?userWallet=${address}`
      );
      if (response.ok) {
        const data = await response.json();
        const submissionMap: Record<string, Submission> = {};
        data.submissions.forEach((sub: any) => {
          submissionMap[sub.taskId] = {
            id: sub.id,
            taskId: sub.taskId,
            taskType: sub.taskType,
            submissionData: sub.taskData,
            status: sub.status,
          };
        });
        setSubmissions(submissionMap);
      }
    } catch (err) {
      console.error("Error loading submissions:", err);
    }
  };

  const handleTwitterAuth = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      // Redirect to simple Twitter linking page
      const twitterLinkUrl = `/twitter/link?walletAddress=${address}&callbackUrl=${encodeURIComponent(
        window.location.href
      )}`;
      window.location.href = twitterLinkUrl;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to link Twitter account"
      );
      setLoading(false);
    }
  };

  const validatePostTask = (task: Task) => {
    if (!postLink) {
      return false;
    }

    // Basic URL validation for Twitter posts
    if (!postLink.includes("twitter.com") && !postLink.includes("x.com")) {
      return false;
    }

    return true;
  };

  const validateTwitterConnection = async (): Promise<boolean> => {
    if (!address) return false;

    try {
      const response = await fetch(
        `/api/twitter/link?walletAddress=${address}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.linked;
      }
      return false;
    } catch (error) {
      console.error("Error validating Twitter authentication:", error);
      return false;
    }
  };

  const submitTask = async (task: Task) => {
    if (!address) {
      console.error(
        "❌ No wallet address found for individual task submission"
      );
      return;
    }

    // Validate Twitter connection before submission
    if (!twitterAuth.isAuthenticated) {
      setError(
        "Twitter connection required. Please connect your Twitter account."
      );
      setCurrentStep("auth");
      return;
    }

    const isConnected = await validateTwitterConnection();
    if (!isConnected) {
      setError(
        "Twitter connection lost. Please reconnect your Twitter account."
      );
      setTwitterAuth({ isAuthenticated: false, isVerifying: false });
      setCurrentStep("auth");
      return;
    }

    console.log(`📤 Individual task submission: ${task.id} (${task.type})`);

    // Validate post URL if it's a post task
    if (task.type === "x_post") {
      if (!postLink) {
        const errorMessage = "Please enter a post URL";
        setError(errorMessage);
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (!postLink.includes("twitter.com") && !postLink.includes("x.com")) {
        const errorMessage = "Please provide a valid Twitter/X post link";
        setError(errorMessage);
        toast({
          title: "Invalid URL",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const submissionData = {
        twitterUsername: twitterAuth.username,
        ...(task.type === "x_follow" && task.accountToFollow
          ? {
              followedAccount: task.accountToFollow,
              verificationMethod: "auto", // Auto-approval system
            }
          : {}),
        ...(task.type === "x_post"
          ? {
              twitterPostUrl: postLink,
              verificationMethod: "auto", // Auto-approval system
            }
          : {}),
        submissionTimestamp: new Date().toISOString(),
      };

      const response = await fetch(
        `/api/campaigns/${campaignId}/tasks/${task.id}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userWallet: address,
            taskType: task.type,
            submissionData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit task");
      }

      const result = await response.json();
      setSubmissions((prev) => ({
        ...prev,
        [task.id]: {
          id: result.submission.id,
          taskId: task.id,
          taskType: task.type,
          submissionData,
          status: "pending",
        },
      }));

      // Show success toast
      toast({
        title: "Task Submitted Successfully!",
        description:
          "Your submission has been auto-approved! Valid posts are automatically verified.",
        variant: "default",
      });

      setSuccess("Task submitted successfully!");

      // Call the success callback to refresh parent component
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }

      // Close modal after a short delay to show success message
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit task";
      setError(errorMessage);

      // Show error toast
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitAllTasks = async () => {
    if (!address) {
      console.error("❌ No wallet address found");
      return;
    }

    // Validate Twitter connection before submission
    if (!twitterAuth.isAuthenticated) {
      setError(
        "Twitter connection required. Please connect your Twitter account."
      );
      setCurrentStep("auth");
      return;
    }

    const isConnected = await validateTwitterConnection();
    if (!isConnected) {
      setError(
        "Twitter connection lost. Please reconnect your Twitter account."
      );
      setTwitterAuth({ isAuthenticated: false, isVerifying: false });
      setCurrentStep("auth");
      return;
    }

    console.log(`🚀 Starting submit all tasks for campaign: ${campaignId}`);
    console.log(`👤 User wallet: ${address}`);

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setIsSubmittingAll(true); // Set submitting state

      // Validate post URL if we have any post tasks
      const hasPostTasks = enabledTasks.some((task) => task.type === "x_post");
      console.log(`📋 Campaign has ${enabledTasks.length} total tasks`);
      console.log(`🐦 Has post tasks: ${hasPostTasks}`);
      console.log(`🔗 Post link: ${postLink}`);

      if (hasPostTasks) {
        if (!postLink) {
          console.error("❌ Missing post URL");
          throw new Error("Please enter a post URL for Twitter post tasks");
        }
        if (!postLink.includes("twitter.com") && !postLink.includes("x.com")) {
          console.error("❌ Invalid post URL format");
          throw new Error("Please provide a valid Twitter/X post link");
        }
      }

      // Submit all tasks that are ready
      const tasksToSubmit = enabledTasks.filter((task) => {
        const existingSubmission = submissions[task.id];
        console.log(`🔍 Checking task ${task.id} (${task.type}):`, {
          hasExistingSubmission: !!existingSubmission,
          existingStatus: existingSubmission?.status,
          taskType: task.type,
          postLink: postLink.trim(),
        });

        if (existingSubmission) {
          console.log(`⏭️  Skipping task ${task.id} - already submitted`);
          return false; // Already submitted
        }

        // Check if required fields are filled based on task type
        if (task.type === "x_post") {
          const isReady = postLink.trim() !== "";
          console.log(`🐦 Post task ${task.id} ready: ${isReady}`);
          return isReady;
        }

        console.log(`✅ Follow task ${task.id} ready to submit`);
        return true; // Follow tasks don't need additional input
      });

      console.log(
        `📊 Tasks to submit: ${tasksToSubmit.length} out of ${enabledTasks.length}`
      );
      tasksToSubmit.forEach((task) => {
        console.log(`  - ${task.type} task: ${task.id}`);
      });

      if (tasksToSubmit.length === 0) {
        console.error("❌ No tasks are ready to submit");
        throw new Error("No tasks are ready to submit");
      }

      // Submit each task
      console.log(`🚀 Starting to submit ${tasksToSubmit.length} tasks...`);

      for (const task of tasksToSubmit) {
        console.log(`📤 Submitting task ${task.id} (${task.type})`);

        const submissionData = {
          twitterUsername: twitterAuth.username,
          ...(task.type === "x_follow" && task.accountToFollow
            ? {
                followedAccount: task.accountToFollow,
                verificationMethod: "auto", // Auto-approval system
              }
            : {}),
          ...(task.type === "x_post"
            ? {
                twitterPostUrl: postLink,
                verificationMethod: "auto", // Auto-approval system
              }
            : {}),
          submissionTimestamp: new Date().toISOString(),
        };

        const apiUrl = `/api/campaigns/${campaignId}/tasks/${task.id}/submit`;
        console.log(`🔗 API URL: ${apiUrl}`);
        console.log(`📦 Request payload:`, {
          userWallet: address,
          taskType: task.type,
          submissionData,
        });

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userWallet: address,
            taskType: task.type,
            submissionData,
          }),
        });

        console.log(
          `📊 Response status: ${response.status} ${response.statusText}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ API error for task ${task.id}:`, errorText);
          throw new Error(`Failed to submit ${task.type} task: ${errorText}`);
        }

        const result = await response.json();
        console.log(`✅ Successfully submitted task ${task.id}:`, result);

        setSubmissions((prev) => ({
          ...prev,
          [task.id]: {
            id: result.submission.id,
            taskId: task.id,
            taskType: task.type,
            submissionData,
            status: "pending", // Will be updated by the API response
          },
        }));
      }

      // Show success toast
      toast({
        title: "All Tasks Submitted Successfully!",
        description: `Submitted ${tasksToSubmit.length} task(s). Valid posts are automatically approved and verified.`,
        variant: "default",
      });

      setSuccess("All tasks submitted successfully!");

      // Call the success callback to refresh parent component
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }

      // Close modal after a short delay to show success message
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit tasks";

      console.error("💥 SubmitAllTasks failed:", err);
      console.error("🔍 Error details:", {
        name: err instanceof Error ? err.name : "Unknown",
        message: errorMessage,
        stack: err instanceof Error ? err.stack : "No stack trace",
      });

      setError(errorMessage);

      // Show error toast
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsSubmittingAll(false); // Reset submitting state
    }
  };

  const handleFollowUser = (username: string) => {
    window.open(`https://twitter.com/${username}`, "_blank");
  };

  // Generate AI tweets using knowledge base
  const generateTweets = async () => {
    if (!apiCampaign?.knowledgeBase?.enabled) {
      toast({
        title: "Knowledge Base Not Available",
        description: "This campaign doesn't have AI tweet generation enabled.",
        variant: "destructive",
      });
      return;
    }

    // Check if we have either PDF (Rivalz) or text (Groq) knowledge base
    const hasRivalzKB =
      apiCampaign.knowledgeBase.knowledgeBaseId &&
      apiCampaign.knowledgeBase.status === "ready";
    const hasGroqKB =
      apiCampaign.knowledgeBase.manualText &&
      apiCampaign.knowledgeBase.manualText.length > 0;

    if (!hasRivalzKB && !hasGroqKB) {
      toast({
        title: "Knowledge Base Not Ready",
        description:
          "No knowledge base content is available for tweet generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Get hashtags and accounts to mention from post tasks
      const postTasks = enabledTasks.filter((task) => task.type === "x_post");
      const allHashtags = postTasks.flatMap((task) => task.hashtags || []);
      const accountsToMention = postTasks.flatMap(
        (task) => task.accountsToTag || []
      );

      // Determine which provider to use
      const provider = hasGroqKB ? "groq" : "rivalz";

      console.log("🤖 Generating tweet with:", {
        provider,
        hasRivalzKB,
        hasGroqKB,
        textLength: apiCampaign.knowledgeBase.manualText?.length || 0,
        language: tweetLanguage,
        existingContent: tweetContent,
        hashtags: allHashtags,
        accountsToMention: accountsToMention,
      });

      const requestBody: any = {
        campaignGoal: apiCampaign.title,
        campaignDetails: apiCampaign.description,
        hashtags: allHashtags,
        accountsToMention: accountsToMention,
        provider,
        language: tweetLanguage,
      };

      // If there's existing content, use it for beautification
      if (tweetContent.trim()) {
        requestBody.existingContent = tweetContent.trim();
      }

      // Add appropriate knowledge base data
      if (provider === "groq" && hasGroqKB) {
        requestBody.knowledgeBaseText = apiCampaign.knowledgeBase.manualText;
      } else if (provider === "rivalz" && hasRivalzKB) {
        requestBody.knowledgeBaseId = apiCampaign.knowledgeBase.knowledgeBaseId;
      }

      const response = await fetch("/api/knowledge-base/generate-tweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to generate tweet");
      }

      const result = await response.json();

      if (result.success) {
        console.log("🎯 API Response:", result);
        console.log("📝 Tweet:", result.tweet);

        if (result.tweet) {
          // Remove any surrounding quotes from the generated tweet
          const cleanTweet = result.tweet.replace(/^["']|["']$/g, "");
          console.log("✅ Setting tweet content:", cleanTweet);
          setTweetContent(cleanTweet);
          toast({
            title: tweetContent.trim()
              ? "Tweet Beautified!"
              : "Tweet Generated!",
            description: `Created a ${tweetLanguage} tweet using ${
              result.provider === "groq" ? "Groq AI" : "Rivalz SDK"
            }.`,
          });
        } else {
          console.error("❌ No tweet content found in response");
          throw new Error("Tweet content not found in API response");
        }
      } else {
        throw new Error(result.error || "Failed to generate tweet");
      }
    } catch (error) {
      console.error("Tweet generation error:", error);
      toast({
        title: "Generation Failed",
        description:
          error instanceof Error ? error.message : "Failed to generate tweet",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Tweet copied to clipboard",
      });
    } catch (error) {
      console.error("Copy failed:", error);
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const createTwitterIntent = () => {
    if (!tweetContent.trim()) {
      toast({
        title: "No Content",
        description: "Please enter some tweet content first",
        variant: "destructive",
      });
      return;
    }

    // Save the current tweet as a preview
    const savedTweet = tweetContent.trim();
    setSavedTweetPreview(savedTweet);
    setShowSavedTweet(true);

    // Hide the tweet generator and show the preview
    setShowTweetGenerator(false);

    // Create Twitter intent URL and open in new tab
    const encodedTweet = encodeURIComponent(savedTweet);
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}`;

    // Open Twitter in new tab
    window.open(intentUrl, "_blank", "width=600,height=700");

    // Show success toast
    toast({
      title: "Tweet Saved & Twitter Opened",
      description: "Your tweet has been saved and Twitter is ready for posting",
    });
  };

  const enabledTasks =
    (apiCampaign?.tasks || []).filter((task) => task.enabled) || [];
  const allTasksCompleted = enabledTasks.every(
    (task) => submissions[task.id]?.status === "approved"
  );

  // Check if all tasks are ready to be submitted
  const allTasksReadyToSubmit = enabledTasks.every((task) => {
    const existingSubmission = submissions[task.id];
    if (existingSubmission) return false; // Already submitted

    // Check if required fields are filled based on task type
    if (task.type === "x_post") {
      return (
        postLink.trim() !== "" &&
        (postLink.includes("twitter.com") || postLink.includes("x.com"))
      );
    }
    return true; // Follow tasks don't need additional input
  });

  // Authentication Step
  if (currentStep === "auth") {
    return (
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          // Prevent closing while loading
          if (loading) {
            return;
          }
          onOpenChange(newOpen);
        }}
      >
        <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-400">
              <Shield className="w-5 h-5 text-orange-400" />
              Twitter Account Required
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Enter your Twitter username to participate in this quest
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="bg-red-900 border-red-700 text-red-100"
              >
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-100">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {twitterAuth.isVerifying ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-4"></div>
                <p className="text-sm text-gray-300">
                  Checking Twitter connection...
                </p>
              </div>
            ) : twitterAuth.isAuthenticated ? (
              <div className="text-center py-6">
                <div className="flex flex-col items-center space-y-3 mb-4">
                  {twitterAuth.profileImage && (
                    <img
                      src={twitterAuth.profileImage}
                      alt="Profile"
                      className="w-16 h-16 rounded-full border-2 border-green-400"
                    />
                  )}
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-medium text-white">
                    {twitterAuth.name || twitterAuth.username}
                  </p>
                  {twitterAuth.name && twitterAuth.username && (
                    <p className="text-sm text-gray-300">
                      {twitterAuth.username.startsWith("@")
                        ? twitterAuth.username
                        : `@${twitterAuth.username}`}
                    </p>
                  )}
                  {twitterAuth.id && (
                    <p className="text-xs text-gray-400">
                      ID: {twitterAuth.id}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => setCurrentStep("tasks")}
                  className="mt-4 bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
                >
                  Continue to Tasks
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Twitter className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <p className="text-sm text-gray-300 mb-6">
                  Click the button below to enter your Twitter username and
                  start completing tasks
                </p>
                <Button
                  onClick={handleTwitterAuth}
                  disabled={loading}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <Twitter className="w-4 h-4 mr-2" />
                      Link Twitter Account
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Tasks Step
  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Prevent closing while submitting tasks
        if (isSubmittingAll || loading) {
          return;
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-400">
            <Send className="w-5 h-5 text-orange-400" />
            Complete Tasks - {apiCampaign?.title || campaignId}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Complete the tasks below to earn rewards. All tasks must be
            completed to submit.
          </DialogDescription>
        </DialogHeader>

        {/* Twitter User Info */}
        {twitterAuth.isAuthenticated && twitterAuth.username && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {twitterAuth.profileImage && (
                <img
                  src={twitterAuth.profileImage}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border border-gray-600"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {twitterAuth.name || twitterAuth.username}
                </p>
                <p className="text-xs text-gray-400">
                  {twitterAuth.username.startsWith("@")
                    ? twitterAuth.username
                    : `@${twitterAuth.username}`}
                </p>
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Connected</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {error && (
            <Alert
              variant="destructive"
              className="bg-red-900 border-red-700 text-red-100"
            >
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-100">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-900 border-green-700 text-green-100">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-100">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              <Twitter className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">
                {twitterAuth.username.startsWith("@")
                  ? twitterAuth.username
                  : `@${twitterAuth.username}`}
              </span>
            </div>
            <Badge className="bg-gray-700 text-gray-200 border-gray-600">
              {
                enabledTasks.filter(
                  (t) => submissions[t.id]?.status === "approved"
                ).length
              }{" "}
              / {enabledTasks.length} Completed
            </Badge>
          </div>

          <div className="space-y-4">
            {enabledTasks.map((task, index) => {
              const existingSubmission = submissions[task.id];
              const isCompleted = existingSubmission?.status === "approved";
              const isPending = existingSubmission?.status === "pending";
              const isReadyToSubmit =
                !existingSubmission &&
                (task.type !== "x_post" ||
                  (postLink.trim() !== "" && validatePostTask(task)));

              return (
                <Card
                  key={task.id}
                  className={`border-gray-700 bg-gray-800 ${
                    isCompleted
                      ? "border-green-600 bg-green-900/20"
                      : isPending
                      ? "border-yellow-600 bg-yellow-900/20"
                      : isReadyToSubmit
                      ? "border-orange-600 bg-orange-900/20"
                      : "bg-gray-800"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Badge className="bg-gray-700 text-gray-200 border-gray-600">
                          {index + 1}
                        </Badge>
                        {task.title ||
                          task.customTitle ||
                          `${task.type.replace("_", " ").toUpperCase()} Task`}
                        {isCompleted && (
                          <Badge className="bg-green-900 text-green-200 border-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                        {isPending && (
                          <Badge className="bg-yellow-900 text-yellow-200 border-yellow-700">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        {isReadyToSubmit && (
                          <Badge className="bg-orange-900 text-orange-200 border-orange-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Ready
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-900 text-orange-200 border-orange-700">
                          {task.qpReward} QP
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-orange-300">
                        Instructions:
                      </h4>
                      <p className="text-sm text-gray-300">
                        {task.instruction || task.customDescription}
                      </p>
                    </div>

                    {task.type === "x_follow" && task.accountToFollow && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <UserCheck className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="text-sm font-medium text-white">
                                Follow{" "}
                                {task.accountToFollow.startsWith("@")
                                  ? task.accountToFollow
                                  : `@${task.accountToFollow}`}
                              </p>
                              <p className="text-xs text-gray-400">
                                Required to complete this task
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-blue-900/20 border-blue-700 text-blue-300 hover:bg-blue-900/30"
                            onClick={() =>
                              handleFollowUser(task.accountToFollow!)
                            }
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Follow
                          </Button>
                        </div>

                        {!isCompleted && (
                          <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
                            <p className="text-sm text-blue-300 mb-2">
                              Make sure you follow{" "}
                              {task.accountToFollow!.startsWith("@")
                                ? task.accountToFollow!
                                : `@${task.accountToFollow!}`}{" "}
                              before submitting. Follow tasks are auto-approved
                              for easy participation.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {task.type === "x_post" && (
                      <div className="space-y-3">
                        {/* AI Tweet Generator Section */}
                        {apiCampaign?.knowledgeBase?.enabled && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium text-purple-300 flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                AI Tweet Generator
                              </Label>
                              <Button
                                onClick={() =>
                                  setShowTweetGenerator(!showTweetGenerator)
                                }
                                variant="outline"
                                size="sm"
                                className="bg-purple-900/20 border-purple-700 text-purple-300 hover:bg-purple-900/30"
                                disabled={isCompleted}
                              >
                                <Sparkles className="w-3 h-3 mr-1" />
                                {showTweetGenerator
                                  ? "Hide"
                                  : "Generate Tweets"}
                              </Button>
                            </div>

                            {showTweetGenerator && (
                              <Card className="bg-purple-900/20 border-purple-700">
                                <CardContent className="p-4 space-y-4">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm text-purple-200">
                                        Generate AI-powered tweets using your
                                        organization's knowledge base
                                      </p>
                                    </div>

                                    {/* Language Selection */}
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-purple-300">
                                        Tweet Language
                                      </Label>
                                      <select
                                        value={tweetLanguage}
                                        onChange={(e) =>
                                          setTweetLanguage(e.target.value)
                                        }
                                        className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
                                      >
                                        <option value="English">English</option>
                                        <option value="Spanish">Spanish</option>
                                        <option value="French">French</option>
                                        <option value="German">German</option>
                                        <option value="Italian">Italian</option>
                                        <option value="Portuguese">
                                          Portuguese
                                        </option>
                                        <option value="Japanese">
                                          Japanese
                                        </option>
                                        <option value="Korean">Korean</option>
                                        <option value="Chinese">Chinese</option>
                                        <option value="Arabic">Arabic</option>
                                        <option value="Hindi">Hindi</option>
                                      </select>
                                    </div>

                                    {/* Required Mentions Display */}
                                    {(() => {
                                      const postTasks = enabledTasks.filter(
                                        (task) => task.type === "x_post"
                                      );
                                      const accountsToMention =
                                        postTasks.flatMap(
                                          (task) => task.accountsToTag || []
                                        );
                                      if (accountsToMention.length > 0) {
                                        return (
                                          <div className="space-y-2">
                                            <Label className="text-sm font-medium text-blue-300">
                                              Required Mentions:
                                            </Label>
                                            <div className="flex flex-wrap gap-1">
                                              {accountsToMention.map(
                                                (account) => (
                                                  <Badge
                                                    key={account}
                                                    variant="outline"
                                                    className="text-xs bg-blue-900/20 border-blue-700 text-blue-200"
                                                  >
                                                    {account.startsWith("@")
                                                      ? account
                                                      : `@${account}`}
                                                  </Badge>
                                                )
                                              )}
                                            </div>
                                            <p className="text-xs text-blue-400">
                                              The generated tweet will include
                                              mentions for these accounts
                                            </p>
                                          </div>
                                        );
                                      }
                                      return null;
                                    })()}

                                    {/* Tweet Content Text Area */}
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-purple-300">
                                        Tweet Content
                                      </Label>
                                      <Textarea
                                        placeholder="Generate a Tweet or Beautify...."
                                        value={tweetContent}
                                        onChange={(e) =>
                                          setTweetContent(e.target.value)
                                        }
                                        className="min-h-[120px] bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 resize-none"
                                        disabled={isCompleted}
                                      />
                                      <div className="flex items-center justify-between text-xs">
                                        <span
                                          className={`${
                                            tweetContent.length < 230
                                              ? "text-yellow-400"
                                              : tweetContent.length <= 280
                                              ? "text-green-400"
                                              : "text-red-400"
                                          }`}
                                        >
                                          {tweetContent.length}/280 characters
                                          (min: 230)
                                        </span>
                                        <span className="text-gray-400">
                                          Language: {tweetLanguage}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Generate and Save Buttons */}
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={generateTweets}
                                        disabled={isGenerating || isCompleted}
                                        size="sm"
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                      >
                                        {isGenerating ? (
                                          <>
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            {tweetContent.trim()
                                              ? "Beautifying..."
                                              : "Generating..."}
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            {tweetContent.trim()
                                              ? "Beautify Tweet"
                                              : "Generate Tweet"}
                                          </>
                                        )}
                                      </Button>
                                      <Button
                                        onClick={createTwitterIntent}
                                        disabled={
                                          !tweetContent.trim() || isCompleted
                                        }
                                        size="sm"
                                        variant="outline"
                                        className="bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
                                      >
                                        <Twitter className="w-3 h-3 mr-1" />
                                        Post on Twitter
                                      </Button>
                                    </div>
                                  </div>

                                  {!apiCampaign.knowledgeBase?.manualText &&
                                    apiCampaign.knowledgeBase?.status !==
                                      "ready" && (
                                      <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                          Knowledge base is not ready. Please
                                          ensure either manual text is provided
                                          or PDF processing is complete.
                                        </AlertDescription>
                                      </Alert>
                                    )}
                                </CardContent>
                              </Card>
                            )}

                            {/* Saved Tweet Preview */}
                            {showSavedTweet && savedTweetPreview && (
                              <Card className="bg-green-900/20 border-green-700">
                                <CardContent className="p-4 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-400" />
                                      <Label className="text-sm font-medium text-green-300">
                                        Saved Tweet Preview
                                      </Label>
                                    </div>
                                    <Button
                                      onClick={() => {
                                        setTweetContent(savedTweetPreview);
                                        setShowSavedTweet(false);
                                        setShowTweetGenerator(true);
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="bg-green-900/20 border-green-700 text-green-300 hover:bg-green-900/30"
                                    >
                                      <Pencil className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                                  </div>

                                  <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                                    <p className="text-sm text-gray-300">
                                      {savedTweetPreview.length > 100
                                        ? `${savedTweetPreview.substring(
                                            0,
                                            100
                                          )}...`
                                        : savedTweetPreview}
                                    </p>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => {
                                        const encodedTweet =
                                          encodeURIComponent(savedTweetPreview);
                                        const intentUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}`;
                                        window.open(
                                          intentUrl,
                                          "_blank",
                                          "width=600,height=700"
                                        );
                                      }}
                                      size="sm"
                                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      Open Twitter Again
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        setShowSavedTweet(false);
                                        setSavedTweetPreview("");
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                                    >
                                      Dismiss
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-orange-300">
                            Your Post Link
                          </Label>
                          <Input
                            type="url"
                            placeholder="https://twitter.com/username/status/1234567890"
                            value={postLink}
                            onChange={(e) => setPostLink(e.target.value)}
                            disabled={isCompleted}
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500"
                          />
                        </div>

                        {task.hashtags && task.hashtags.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-2 text-orange-300">
                              Required Hashtags:
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {task.hashtags.map((hashtag) => (
                                <Badge
                                  key={hashtag}
                                  variant="outline"
                                  className="text-xs bg-gray-700 border-gray-600 text-gray-200"
                                >
                                  {hashtag.startsWith("#")
                                    ? hashtag
                                    : `#${hashtag}`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {task.accountsToTag &&
                          task.accountsToTag.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2 text-blue-300">
                                Required Mentions:
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {task.accountsToTag.map((account) => (
                                  <Badge
                                    key={account}
                                    variant="outline"
                                    className="text-xs bg-blue-900/20 border-blue-700 text-blue-200"
                                  >
                                    {account.startsWith("@")
                                      ? account
                                      : `@${account}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        {!isCompleted && (
                          <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                            <p className="text-sm text-green-300 mb-2">
                              Your post URL will be automatically validated and
                              approved if it meets the requirements.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Single Submit All Button */}
          {!allTasksCompleted && allTasksReadyToSubmit && (
            <div className="mt-6 p-4 bg-orange-900/20 border border-orange-700 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-orange-300 mb-3">
                  All tasks are ready to submit! Click below to submit all tasks
                  at once.
                </p>
                <Button
                  onClick={submitAllTasks}
                  disabled={loading || isSubmittingAll}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
                >
                  {loading || isSubmittingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit All Tasks
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {allTasksCompleted && (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">
                All Tasks Submitted!
              </h3>
              <p className="text-gray-300">
                Your submissions are automatically approved! Valid posts and
                follows are verified instantly.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
