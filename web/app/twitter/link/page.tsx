"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Twitter, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";

function TwitterLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState("");

  const walletAddress = address || searchParams.get("walletAddress") || "";
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    // Check if already linked
    if (walletAddress) {
      checkExistingLink();
    }
  }, [walletAddress]);

  const checkExistingLink = async () => {
    try {
      const response = await fetch(
        `/api/twitter/link?walletAddress=${walletAddress}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.linked) {
          setSuccess(true);
          setTwitterUsername(data.twitterUsername);
        }
      }
    } catch (err) {
      console.error("Error checking existing link:", err);
    }
  };

  const handleLinkAccount = async () => {
    if (!walletAddress || !twitterUsername.trim()) {
      setError("Wallet address and Twitter username are required");
      return;
    }

    // Basic Twitter username validation
    const usernameRegex = /^[a-zA-Z0-9_]{1,15}$/;
    if (!usernameRegex.test(twitterUsername.trim())) {
      setError(
        "Invalid Twitter username. Use only letters, numbers, and underscores (max 15 characters)"
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/twitter/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          twitterUsername: twitterUsername.trim(),
        }),
      });

      if (response.ok) {
        setSuccess(true);
        // Redirect after a short delay
        setTimeout(() => {
          router.push(callbackUrl);
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to link Twitter account");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Twitter link error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <CardTitle className="text-green-400">
              Twitter Account Linked!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="text-left">
                <p className="text-lg font-medium text-white">
                  {twitterUsername.startsWith("@")
                    ? twitterUsername
                    : `@${twitterUsername}`}
                </p>
              </div>
            </div>
            <p className="text-gray-300">
              Successfully linked to wallet: {walletAddress.slice(0, 6)}...
              {walletAddress.slice(-4)}
            </p>
            <p className="text-sm text-gray-400">Redirecting...</p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
        <CardHeader className="text-center">
          <Twitter className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <CardTitle className="text-blue-400">Link Twitter Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="bg-red-900 border-red-700 text-red-100">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-100">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
            <p className="text-sm text-blue-300 mb-2">Linking to wallet:</p>
            <p className="text-xs font-mono text-blue-200">{walletAddress}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitterUsername" className="text-gray-300">
              Twitter Username *
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-400 bg-gray-700 border border-r-0 border-gray-600 rounded-l-md">
                @
              </span>
              <Input
                id="twitterUsername"
                type="text"
                placeholder="username"
                value={twitterUsername}
                onChange={(e) => setTwitterUsername(e.target.value)}
                className="flex-1 rounded-l-none bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                disabled={loading}
                maxLength={15}
              />
            </div>
            <p className="text-xs text-gray-400">
              Enter your Twitter username (without @ symbol)
            </p>
          </div>

          <Button
            onClick={handleLinkAccount}
            disabled={loading || !walletAddress || !twitterUsername.trim()}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Linking Account...
              </>
            ) : (
              <>
                <Twitter className="w-4 h-4 mr-2" />
                Link Twitter Account
              </>
            )}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            By linking your Twitter account, you agree to use it for quest
            verification purposes only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TwitterLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <TwitterLinkContent />
    </Suspense>
  );
}
