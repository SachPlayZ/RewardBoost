"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Twitter,
  User,
  Wallet,
  Calendar,
  Link as LinkIcon,
  Unlink,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/hooks/use-profile";

export default function ProfilePage() {
  const { profile, loading, error, delinkTwitter, isConnected, address } =
    useProfile();
  const [delinking, setDelinking] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDelinkTwitter = async () => {
    if (!profile?.twitterLinked) return;

    try {
      setDelinking(true);
      setSuccess(null);

      const success = await delinkTwitter();
      if (success) {
        setSuccess("Twitter account delinked successfully");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Delink error:", err);
    } finally {
      setDelinking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700 text-white">
          <CardContent className="p-6 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-4">
              Please connect your wallet to view your profile
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">
            Manage your account settings and Twitter integration
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-700 text-red-100">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-100">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-900/20 border-green-700 text-green-100">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-100">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={profile?.avatarUrl || profile?.twitterProfileImage}
                      alt="Profile"
                    />
                    <AvatarFallback className="bg-gray-700 text-2xl">
                      {profile?.displayName?.[0] ||
                        profile?.twitterName?.[0] ||
                        address?.[2]?.toUpperCase() ||
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {profile?.displayName ||
                    profile?.twitterName ||
                    "Anonymous User"}
                </CardTitle>
                {profile?.bio && (
                  <p className="text-gray-400 text-sm mt-2">{profile.bio}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Wallet Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Wallet className="w-4 h-4" />
                    <span>Wallet Address</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 flex-1">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(address || "")}
                      className="h-8 w-8 p-0 hover:bg-gray-700"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Account Created */}
                {profile?.createdAt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Account Created</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      {formatDate(profile.createdAt)}
                    </p>
                  </div>
                )}

                {/* XP Stats */}
                {profile?.totalXP !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>Total XP</span>
                    </div>
                    <p className="text-lg font-semibold text-purple-400">
                      {profile.totalXP.toLocaleString()} XP
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Twitter Integration Card */}
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  Twitter Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.twitterLinked ? (
                  /* Linked Twitter Account */
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={profile.twitterProfileImage}
                          alt="Twitter Profile"
                        />
                        <AvatarFallback className="bg-blue-700">
                          {profile.twitterName?.[0] || "T"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">
                            {profile.twitterName}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="bg-blue-600 text-white"
                          >
                            <LinkIcon className="w-3 h-3 mr-1" />
                            Linked
                          </Badge>
                        </div>
                        <p className="text-blue-300 text-sm">
                          @{profile.twitterUsername}
                        </p>
                        {profile.linkedAt && (
                          <p className="text-gray-400 text-xs mt-1">
                            Linked on {formatDate(profile.linkedAt)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelinkTwitter}
                        disabled={delinking}
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        {delinking ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Delinking...
                          </>
                        ) : (
                          <>
                            <Unlink className="w-4 h-4 mr-2" />
                            Delink Account
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Benefits of Linked Account
                      </h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>
                          • Automatic verification for Twitter-based quests
                        </li>
                        <li>• Seamless quest participation</li>
                        <li>• Enhanced profile visibility</li>
                        <li>• Quick task completion</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  /* Not Linked - Show Link Options */
                  <div className="space-y-4">
                    <div className="p-6 bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg text-center">
                      <Twitter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-300 mb-2">
                        Twitter Account Not Linked
                      </h3>
                      <p className="text-gray-400 mb-4 max-w-md mx-auto">
                        Link your Twitter account to participate in
                        Twitter-based quests and get automatic verification.
                      </p>
                      <div className="flex justify-center">
                        <Button
                          asChild
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Link
                            href={`/twitter/link?walletAddress=${address}&callbackUrl=/profile`}
                          >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Link Twitter Account
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Why Link Your Twitter?
                      </h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Participate in Twitter-based quests</li>
                        <li>• Automatic verification for social tasks</li>
                        <li>• Build your social reputation</li>
                        <li>• Earn rewards for social engagement</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Settings Card */}
            <Card className="bg-gray-800 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter display name"
                      defaultValue={profile?.displayName || ""}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      defaultValue={profile?.email || ""}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Bio
                  </label>
                  <textarea
                    placeholder="Tell us about yourself..."
                    defaultValue={profile?.bio || ""}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
