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
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  TestTube,
  Zap,
  FileText,
} from "lucide-react";

interface TestResult {
  success: boolean;
  message?: string;
  results?: any;
  recommendations?: string[];
  error?: string;
  errorType?: string;
  troubleshooting?: string[];
  details?: any;
  testResult?: any;
}

export default function TestRivalzPage() {
  const [basicTestResult, setBasicTestResult] = useState<TestResult | null>(
    null
  );
  const [fileTestResult, setFileTestResult] = useState<TestResult | null>(null);
  const [basicTestLoading, setBasicTestLoading] = useState(false);
  const [fileTestLoading, setFileTestLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const runBasicTest = async () => {
    setBasicTestLoading(true);
    setBasicTestResult(null);

    try {
      const response = await fetch("/api/test-rivalz");
      const result = await response.json();
      setBasicTestResult(result);
    } catch (error) {
      setBasicTestResult({
        success: false,
        error: "Failed to run test",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setBasicTestLoading(false);
    }
  };

  const runFileTest = async () => {
    if (!selectedFile) {
      setFileTestResult({
        success: false,
        error: "Please select a PDF file first",
      });
      return;
    }

    setFileTestLoading(true);
    setFileTestResult(null);

    try {
      const formData = new FormData();
      formData.append("testFile", selectedFile);

      const response = await fetch("/api/test-rivalz", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setFileTestResult(result);
    } catch (error) {
      setFileTestResult({
        success: false,
        error: "Failed to run file test",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setFileTestLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileTestResult(null); // Clear previous results
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

          {result.results && (
            <div>
              <h4 className="font-medium mb-2">Test Results:</h4>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <pre>{JSON.stringify(result.results, null, 2)}</pre>
              </div>
            </div>
          )}

          {result.testResult && (
            <div>
              <h4 className="font-medium mb-2">API Response:</h4>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <pre>{JSON.stringify(result.testResult, null, 2)}</pre>
              </div>
            </div>
          )}

          {result.recommendations && (
            <div>
              <h4 className="font-medium mb-2">Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="text-green-700">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.troubleshooting && (
            <div>
              <h4 className="font-medium mb-2">Troubleshooting:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {result.troubleshooting.map((tip, index) => (
                  <li key={index} className="text-orange-700">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.details && (
            <details className="text-sm">
              <summary className="cursor-pointer font-medium">
                Technical Details
              </summary>
              <div className="mt-2 bg-gray-100 p-2 rounded">
                <pre>{JSON.stringify(result.details, null, 2)}</pre>
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rivalz SDK Test Suite</h1>
        <p className="text-muted-foreground">
          Test the Rivalz SDK integration to diagnose any connectivity or
          configuration issues.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Basic Connectivity Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-blue-600" />
              Basic Connectivity Test
            </CardTitle>
            <CardDescription>
              Tests SDK initialization, configuration, and basic connectivity
              without file uploads.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={runBasicTest}
              disabled={basicTestLoading}
              className="w-full"
            >
              {basicTestLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Basic Test...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Run Basic Test
                </>
              )}
            </Button>

            {renderTestResult(basicTestResult, "Basic Test")}
          </CardContent>
        </Card>

        <Separator />

        {/* File Upload Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              File Upload Test
            </CardTitle>
            <CardDescription>
              Tests the complete workflow including PDF upload and knowledge
              base creation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="test-file"
                className="block text-sm font-medium mb-2"
              >
                Select a PDF file to test (max 10MB):
              </label>
              <Input
                id="test-file"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              {selectedFile && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">
                    {selectedFile.name} (
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Badge>
                </div>
              )}
            </div>

            <Button
              onClick={runFileTest}
              disabled={fileTestLoading || !selectedFile}
              className="w-full"
            >
              {fileTestLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running File Test...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Run File Upload Test
                </>
              )}
            </Button>

            {renderTestResult(fileTestResult, "File Upload Test")}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>1. Basic Test:</strong> Checks if the SDK can initialize
              and if your API token is configured correctly.
            </p>
            <p>
              <strong>2. File Test:</strong> Tests the full workflow by actually
              uploading a PDF and creating a knowledge base.
            </p>
            <p>
              <strong>Environment:</strong> Make sure you have{" "}
              <code>RIVALZ_SECRET_TOKEN</code> set in your <code>.env</code>{" "}
              file.
            </p>
            <p>
              <strong>Debugging:</strong> Check the browser console and server
              logs for detailed error information.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
