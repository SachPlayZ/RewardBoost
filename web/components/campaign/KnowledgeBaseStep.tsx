"use client";

import React, { useState, useRef } from "react";
import { useFormContext } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Brain,
  Sparkles,
  X,
  Type,
  Zap,
} from "lucide-react";
import type { CampaignFormData } from "@/lib/types/campaign";

export function KnowledgeBaseStep() {
  const { setValue, watch } = useFormContext<CampaignFormData>();
  const { toast } = useToast();

  const knowledgeBase = watch("knowledgeBase");
  const campaignTitle = watch("title");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusChecking, setStatusChecking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize knowledge base with default values if enabled but not properly initialized
  React.useEffect(() => {
    if (knowledgeBase?.enabled && !knowledgeBase.inputMethod) {
      setValue("knowledgeBase", {
        ...knowledgeBase,
        inputMethod: "text", // Default to text since it's more reliable
        provider: "groq", // Default to groq since rivalz is down
        manualText: knowledgeBase.manualText || "",
      });
    }
  }, [knowledgeBase?.enabled, knowledgeBase?.inputMethod, setValue]);

  const handleToggleKnowledgeBase = (enabled: boolean) => {
    setValue("knowledgeBase", {
      enabled,
      pdfFileName: enabled ? knowledgeBase?.pdfFileName : undefined,
      pdfUrl: enabled ? knowledgeBase?.pdfUrl : undefined,
      knowledgeBaseId: enabled ? knowledgeBase?.knowledgeBaseId : undefined,
      status: enabled ? knowledgeBase?.status : undefined,
      errorMessage: enabled ? knowledgeBase?.errorMessage : undefined,
      manualText: enabled ? knowledgeBase?.manualText : undefined,
      inputMethod: enabled ? knowledgeBase?.inputMethod || "pdf" : "pdf",
      provider: enabled ? knowledgeBase?.provider || "groq" : "groq", // Default to groq since rivalz is down
    });
  };

  const handleInputMethodChange = (method: "pdf" | "text") => {
    setValue("knowledgeBase", {
      ...knowledgeBase,
      inputMethod: method,
      provider: method === "text" ? "groq" : "rivalz", // Use groq for text, rivalz for pdf
    });
  };

  const handleManualTextChange = (text: string) => {
    setValue("knowledgeBase", {
      ...knowledgeBase,
      manualText: text,
      status: text.length > 0 ? "ready" : undefined,
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      toast({
        title: "File Too Large",
        description: "Please upload a PDF file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      // Set initial uploading state
      setValue("knowledgeBase", {
        enabled: true,
        pdfFileName: file.name,
        status: "uploading",
      });

      // Create form data
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("campaignId", `temp-${Date.now()}`); // Temporary ID for file organization

      setUploadProgress(30);

      // Upload file and create knowledge base
      const response = await fetch("/api/knowledge-base/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(60);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();

      setUploadProgress(80);

      if (result.success) {
        // Update knowledge base with successful upload
        setValue("knowledgeBase", {
          enabled: true,
          pdfFileName: result.fileName,
          pdfUrl: result.fileUrl,
          knowledgeBaseId: result.knowledgeBaseId,
          status: result.status,
        });

        toast({
          title: "Upload Successful",
          description: "Your PDF has been uploaded and is being processed.",
        });

        // Start checking status if processing
        if (result.status !== "ready") {
          checkKnowledgeBaseStatus(result.knowledgeBaseId);
        }
      } else {
        throw new Error(result.error || "Upload failed");
      }

      setUploadProgress(100);
    } catch (error) {
      console.error("Upload error:", error);

      setValue("knowledgeBase", {
        enabled: true,
        pdfFileName: file.name,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Upload failed",
      });

      toast({
        title: "Upload Failed",
        description:
          error instanceof Error ? error.message : "Failed to upload PDF",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const checkKnowledgeBaseStatus = async (knowledgeBaseId: string) => {
    setStatusChecking(true);

    try {
      const response = await fetch(
        `/api/knowledge-base/status?id=${knowledgeBaseId}`
      );

      if (!response.ok) {
        throw new Error("Status check failed");
      }

      const result = await response.json();

      if (result.success) {
        // Update status
        setValue("knowledgeBase", {
          ...knowledgeBase,
          status: result.status,
        });

        if (result.ready) {
          toast({
            title: "Knowledge Base Ready",
            description:
              "Your PDF has been processed and is ready for tweet generation.",
          });
        } else if (result.status === "error") {
          setValue("knowledgeBase", {
            ...knowledgeBase,
            status: "error",
            errorMessage: "Processing failed",
          });
        } else {
          // Still processing, check again in 5 seconds
          setTimeout(() => checkKnowledgeBaseStatus(knowledgeBaseId), 5000);
        }
      }
    } catch (error) {
      console.error("Status check error:", error);
      setValue("knowledgeBase", {
        ...knowledgeBase,
        status: "error",
        errorMessage: "Failed to check processing status",
      });
    } finally {
      setStatusChecking(false);
    }
  };

  const handleRemoveFile = () => {
    setValue("knowledgeBase", {
      enabled: true,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatusBadge = () => {
    if (!knowledgeBase?.status) return null;

    switch (knowledgeBase.status) {
      case "uploading":
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Uploading...
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary" className="gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing...
          </Badge>
        );
      case "ready":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="w-3 h-3" />
            Ready
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <CardTitle>AI Knowledge Base</CardTitle>
          </div>
          <CardDescription>
            Upload your organization's knowledge base (PDF) to enable AI-powered
            tweet generation for participants. This allows users to create
            authentic, informed tweets about your campaign.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enable-kb" className="text-base font-medium">
                Enable AI Tweet Generation
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow participants to generate tweets using your knowledge base
              </p>
            </div>
            <Switch
              id="enable-kb"
              checked={knowledgeBase?.enabled || false}
              onCheckedChange={handleToggleKnowledgeBase}
            />
          </div>

          {knowledgeBase?.enabled && (
            <>
              {/* Input Method Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Knowledge Base Input Method
                </Label>

                <Tabs
                  value={knowledgeBase?.inputMethod || "pdf"}
                  onValueChange={handleInputMethodChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="pdf"
                      className="flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      PDF Upload
                    </TabsTrigger>
                    <TabsTrigger
                      value="text"
                      className="flex items-center gap-2"
                    >
                      <Type className="w-4 h-4" />
                      Manual Text
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pdf" className="space-y-4 mt-4">
                    {/* PDF Upload Section */}
                    {!knowledgeBase?.pdfFileName ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor="pdf-upload"
                            className="text-base font-medium"
                          >
                            Upload Knowledge Base PDF
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            Uses Rivalz SDK
                          </Badge>
                        </div>

                        <Alert className="bg-orange-50 border-orange-200">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-800">
                            <strong>Note:</strong> Rivalz service is currently
                            experiencing issues. Consider using "Manual Text"
                            option as an alternative.
                          </AlertDescription>
                        </Alert>

                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                          <p className="text-lg font-medium mb-2">
                            Drop your PDF here or click to browse
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Maximum file size: 10MB • Supports: PDF only
                          </p>
                        </div>

                        <Input
                          ref={fileInputRef}
                          id="pdf-upload"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Label className="text-base font-medium">
                          Uploaded Knowledge Base
                        </Label>

                        <Card className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-100 rounded-lg">
                                <FileText className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {knowledgeBase.pdfFileName}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {getStatusBadge()}
                                  {statusChecking && (
                                    <span className="text-xs text-muted-foreground">
                                      Checking status...
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRemoveFile}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {isUploading && uploadProgress > 0 && (
                            <div className="mt-3">
                              <Progress
                                value={uploadProgress}
                                className="h-2"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Uploading and processing... {uploadProgress}%
                              </p>
                            </div>
                          )}

                          {knowledgeBase.errorMessage && (
                            <Alert variant="destructive" className="mt-3">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {knowledgeBase.errorMessage}
                              </AlertDescription>
                            </Alert>
                          )}
                        </Card>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="text" className="space-y-4 mt-4">
                    {/* Manual Text Input Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="manual-text"
                          className="text-base font-medium"
                        >
                          Knowledge Base Content
                        </Label>
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 text-green-700 border-green-200"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Uses Groq AI
                        </Badge>
                      </div>

                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <strong>Recommended:</strong> This method is currently
                          more reliable and uses Groq's fast AI for tweet
                          generation. Perfect for when you want full control
                          over your knowledge base.
                        </AlertDescription>
                      </Alert>

                      <Textarea
                        id="manual-text"
                        placeholder="Enter your organization's knowledge base content here...

For example:
• Company mission and values
• Product features and benefits  
• Key achievements and milestones
• Technical specifications
• Team expertise and background
• Industry insights and thought leadership

This content will be used by AI to generate authentic, informed tweets about your campaign."
                        value={knowledgeBase?.manualText || ""}
                        onChange={(e) => handleManualTextChange(e.target.value)}
                        className="min-h-[300px] resize-none"
                      />

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {knowledgeBase?.manualText?.length || 0} characters
                        </span>
                        <span>
                          {knowledgeBase?.manualText &&
                          knowledgeBase.manualText.length > 100 ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ready for AI generation
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Need at least 100 characters
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Information Section */}
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  <strong>How it works:</strong> Your{" "}
                  {knowledgeBase?.inputMethod === "text"
                    ? "text content"
                    : "PDF"}{" "}
                  will be used as context for AI tweet generation. During the
                  campaign, participants can generate authentic tweets about{" "}
                  {campaignTitle || "your campaign"} using{" "}
                  {knowledgeBase?.inputMethod === "text"
                    ? "Groq AI with your knowledge base text"
                    : "information from your uploaded document"}
                  . All generated tweets will follow your campaign guidelines
                  and include your specified hashtags.
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
