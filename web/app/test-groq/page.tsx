"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Twitter,
  Copy,
  RefreshCw,
} from "lucide-react";

interface TestResult {
  success: boolean;
  message?: string;
  tweet?: string;
  twitterLink?: string;
  tweets?: Array<{ tweet: string; twitterLink: string }>;
  provider?: string;
  error?: string;
}

export default function TestGroqPage() {
  const [connectionResult, setConnectionResult] = useState<TestResult | null>(
    null
  );
  const [tweetResult, setTweetResult] = useState<TestResult | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [tweetLoading, setTweetLoading] = useState(false);

  const [knowledgeBaseText, setKnowledgeBaseText] = useState(
    `
Our company, InnovateTech, is a leading blockchain development platform that empowers developers to build decentralized applications with ease.

Key Features:
• Drag-and-drop smart contract builder
• Real-time testing environment
• Multi-chain deployment support (Ethereum, Polygon, Arbitrum)
• Built-in security auditing tools
• Developer-friendly APIs

Mission: To democratize blockchain development and make Web3 accessible to developers worldwide.

Recent Achievements:
• 50,000+ developers using our platform
• $10M Series A funding completed
• Partnership with major crypto exchanges
• 99.9% uptime reliability

Team: Founded by ex-Google and ex-Ethereum Foundation engineers with 10+ years of blockchain experience.
  `.trim()
  );

  const [campaignGoal, setCampaignGoal] = useState(
    "Promote our new smart contract builder launch"
  );
  const [campaignDetails, setCampaignDetails] = useState(
    "We're launching a revolutionary no-code smart contract builder that makes blockchain development accessible to everyone"
  );
  const [hashtags, setHashtags] = useState(
    "InnovateTech,Blockchain,Web3,SmartContracts"
  );

  const testConnection = async () => {
    setConnectionLoading(true);
    setConnectionResult(null);

    try {
      const response = await fetch("/api/knowledge-base/generate-tweet");
      const result = await response.json();
      setConnectionResult(result);
    } catch (error) {
      setConnectionResult({
        success: false,
        error: "Failed to connect to API",
      });
    } finally {
      setConnectionLoading(false);
    }
  };

  const generateTestTweet = async () => {
    if (!knowledgeBaseText.trim()) {
      setTweetResult({
        success: false,
        error: "Please enter knowledge base text first",
      });
      return;
    }

    setTweetLoading(true);
    setTweetResult(null);

    try {
      const hashtagArray = hashtags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const response = await fetch("/api/knowledge-base/generate-tweet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          knowledgeBaseText,
          campaignGoal,
          campaignDetails,
          hashtags: hashtagArray,
          count: 3,
          provider: "groq",
        }),
      });

      const result = await response.json();
      setTweetResult(result);
    } catch (error) {
      setTweetResult({
        success: false,
        error: "Failed to generate tweet",
      });
    } finally {
      setTweetLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast here
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const renderTestResult = (result: TestResult, title: string) => {
    if (!result) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            {title} Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.success ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {result.message || "Test passed successfully!"}
                {result.provider && (
                  <Badge className="ml-2 bg-green-600">{result.provider}</Badge>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {result.error || "Test failed"}
              </AlertDescription>
            </Alert>
          )}

          {result.tweets && (
            <div className="space-y-3">
              <h4 className="font-medium">Generated Tweets:</h4>
              {result.tweets.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 border rounded-lg space-y-2"
                >
                  <p className="text-sm leading-relaxed">{item.tweet}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(item.tweet)}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => window.open(item.twitterLink, "_blank")}
                      size="sm"
                      variant="outline"
                      className="text-xs text-blue-600"
                    >
                      <Twitter className="w-3 h-3 mr-1" />
                      Post Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Groq AI Tweet Generator Test
        </h1>
        <p className="text-muted-foreground">
          Test the Groq AI integration for tweet generation using manual
          knowledge base text.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Groq Connection Test
            </CardTitle>
            <CardDescription>
              Test if the Groq API is properly configured and accessible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testConnection}
              disabled={connectionLoading}
              className="w-full"
            >
              {connectionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Test Groq Connection
                </>
              )}
            </Button>

            {renderTestResult(connectionResult, "Connection Test")}
          </CardContent>
        </Card>

        <Separator />

        {/* Tweet Generation Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Twitter className="w-5 h-5 text-blue-600" />
              Tweet Generation Test
            </CardTitle>
            <CardDescription>
              Test the complete tweet generation workflow using Groq AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Knowledge Base Text */}
            <div className="space-y-2">
              <Label htmlFor="knowledge-text">Knowledge Base Content</Label>
              <Textarea
                id="knowledge-text"
                placeholder="Enter your organization's knowledge base content..."
                value={knowledgeBaseText}
                onChange={(e) => setKnowledgeBaseText(e.target.value)}
                className="min-h-[200px]"
              />
              <div className="text-sm text-muted-foreground">
                {knowledgeBaseText.length} characters
              </div>
            </div>

            {/* Campaign Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-goal">Campaign Goal</Label>
                <Input
                  id="campaign-goal"
                  value={campaignGoal}
                  onChange={(e) => setCampaignGoal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hashtags">Hashtags (comma-separated)</Label>
                <Input
                  id="hashtags"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="Web3,AI,Innovation"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-details">Campaign Details</Label>
              <Textarea
                id="campaign-details"
                value={campaignDetails}
                onChange={(e) => setCampaignDetails(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button
              onClick={generateTestTweet}
              disabled={tweetLoading || !knowledgeBaseText.trim()}
              className="w-full"
            >
              {tweetLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Tweets...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Tweets with Groq
                </>
              )}
            </Button>

            {renderTestResult(tweetResult, "Tweet Generation")}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>1. Connection Test:</strong> Verifies that Groq API is
              accessible and configured correctly.
            </p>
            <p>
              <strong>2. Tweet Generation:</strong> Tests the full workflow by
              generating 3 tweet variations using your knowledge base.
            </p>
            <p>
              <strong>Environment:</strong> Make sure you have{" "}
              <code>GROQ_API_KEY</code> set in your <code>.env</code> file.
            </p>
            <p>
              <strong>Knowledge Base:</strong> Provide detailed information
              about your organization for better tweet generation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
