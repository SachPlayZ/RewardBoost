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
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  Target,
  Gift,
  Calendar,
} from "lucide-react";

interface AIAssistantPanelProps {
  onClose: () => void;
  currentData: CampaignFormData;
  onApplySuggestion: (suggestions: Partial<CampaignFormData>) => void;
}

export function AIAssistantPanel({
  onClose,
  currentData,
  onApplySuggestion,
}: AIAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "generate" | "improve" | "content"
  >("generate");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tone, setTone] = useState<ContentTone>(ContentTone.CASUAL);
  const [language, setLanguage] = useState("English");

  // Sample AI-generated suggestions (in a real app, this would call an AI API)
  const generateCampaignIdeas = async () => {
    setIsGenerating(true);

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const suggestions = [
      {
        title: "Web3 Community Builder Challenge",
        description:
          "Engage with the decentralized future by participating in meaningful discussions, connecting with fellow builders, and sharing your vision for Web3. Complete social tasks to earn rewards while growing the community.",
        category: "Community Building",
        estimatedParticipants: 750,
      },
      {
        title: "DeFi Explorer Quest",
        description:
          "Discover the world of decentralized finance through educational content sharing and community engagement. Learn about yield farming, liquidity provision, and governance while earning rewards.",
        category: "Education",
        estimatedParticipants: 500,
      },
      {
        title: "NFT Creator Spotlight",
        description:
          "Showcase your creativity and artistic vision by sharing your NFT journey. Connect with other creators, share techniques, and inspire the next generation of digital artists.",
        category: "Creative",
        estimatedParticipants: 1000,
      },
    ];

    setIsGenerating(false);
    return suggestions;
  };

  const generateContent = async (prompt: string) => {
    setIsGenerating(true);

    // Simulate AI content generation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const contents = {
      casual: `🚀 Just dove into the future of Web3 and I'm blown away! The possibilities for decentralized innovation are endless. From DeFi protocols revolutionizing finance to NFTs empowering creators - we're building something incredible together. What's your favorite Web3 project right now? Let's discuss! #Web3 #DeFi #Innovation #Community`,

      formal: `The Web3 ecosystem represents a paradigm shift towards decentralized technologies that prioritize user ownership and community governance. Through blockchain innovation, we are witnessing the emergence of new financial instruments, digital ownership models, and collaborative frameworks that challenge traditional centralized systems. The implications for future technological development are profound. #Web3 #Blockchain #Decentralization #Technology`,

      engaging: `🔥 Web3 is not just technology - it's a movement! Every day, brilliant minds are pushing boundaries, creating solutions that put power back into the hands of users. Whether you're building, investing, or just learning - you're part of this revolution. The future is decentralized, and it's being written right now. What role will you play? #Web3Revolution #BuildTheFuture #Decentralized #Community`,
    };

    setGeneratedContent(
      contents[tone as keyof typeof contents] || contents.casual
    );
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        style={{
          background:
            "rgba(30, 27, 75, 0.55)", // fallback for dark glass
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
        }}
      >
        <CardHeader className="border-b bg-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>AI Campaign Assistant</CardTitle>
                <CardDescription>
                  Let AI help you create engaging quest ideas and content
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
          <div
            className="w-64 border-r bg-muted/30"
            style={{
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderRight: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="p-4">
              <div className="space-y-2">
                <Button
                  variant={activeTab === "generate" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab("generate")}
                >
                  <Lightbulb className="h-4 w-4" />
                  Generate Ideas
                </Button>
                <Button
                  variant={activeTab === "improve" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab("improve")}
                >
                  <Wand2 className="h-4 w-4" />
                  Improve Current
                </Button>
                <Button
                  variant={activeTab === "content" ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveTab("content")}
                >
                  <MessageSquare className="h-4 w-4" />
                  Generate Content
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
                    Generate Campaign Ideas
                  </h3>
                  <p className="text-muted-foreground">
                    Let AI help you create engaging quest ideas based on your
                    preferences.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      placeholder="e.g., DeFi, NFTs, Gaming"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={generateCampaignIdeas}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating Ideas...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Ideas
                    </>
                  )}
                </Button>

                {/* Sample generated ideas */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">
                          Web3 Community Builder Challenge
                        </h4>
                        <Badge variant="secondary">Community</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Engage with the decentralized future by participating in
                        meaningful discussions, connecting with fellow builders,
                        and sharing your vision for Web3.
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          Est. 750 participants
                        </div>
                        <Button size="sm" variant="outline">
                          Use This Idea
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "improve" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Improve Current Campaign
                  </h3>
                  <p className="text-muted-foreground">
                    Get AI suggestions to enhance your campaign based on current
                    configuration.
                  </p>
                </div>

                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">
                      AI Suggestions for "{currentData.title || "Your Campaign"}
                      ":
                    </div>
                    <ul className="text-sm space-y-1">
                      <li>
                        • Consider adding more specific completion criteria to
                        quest steps
                      </li>
                      <li>
                        • Include hashtag requirements for better social media
                        reach
                      </li>
                      <li>
                        • Increase XP rewards for verified users to encourage
                        quality participation
                      </li>
                      <li>• Add time-based bonuses for early participants</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4" />
                        <h4 className="font-medium">Quest Steps</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Add verification methods and clear success metrics
                      </p>
                      <Button size="sm" variant="outline">
                        Apply
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="h-4 w-4" />
                        <h4 className="font-medium">Rewards</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Optimize distribution method for better engagement
                      </p>
                      <Button size="sm" variant="outline">
                        Apply
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "content" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Generate Social Content
                  </h3>
                  <p className="text-muted-foreground">
                    Create engaging social media content for your campaign
                    participants.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tone</label>
                    <Select
                      value={tone}
                      onValueChange={(value) => setTone(value as ContentTone)}
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
                    <Select value={language} onValueChange={setLanguage}>
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
                  onClick={() => generateContent("Web3 discussion post")}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Generating Content...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Content
                    </>
                  )}
                </Button>

                {generatedContent && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Generated Content</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(generatedContent)}
                          className="gap-2"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </Button>
                      </div>
                      <Textarea
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        className="min-h-[150px]"
                        placeholder="Generated content will appear here..."
                      />
                      <div className="flex justify-between items-center mt-3">
                        <div className="text-xs text-muted-foreground">
                          {generatedContent.length}/280 characters
                        </div>
                        <Button size="sm" className="gap-2">
                          <Check className="h-3 w-3" />
                          Use This Content
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
