"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  User,
  Twitter,
  Award,
  AlertCircle,
  Eye,
} from "lucide-react";

interface Submission {
  id: string;
  taskId: string;
  taskType: string;
  taskTitle: string;
  userWallet: string;
  submissionData: any;
  taskData?: any;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  verifiedAt?: string;
  verifierNotes?: string;
  twitterId?: string | null;
  twitterUsername?: string | null;
  twitterName?: string | null;
}

// Helper functions
const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Auto-Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      );
  }
};

const getTaskTypeIcon = (taskType: string) => {
  switch (taskType) {
    case "x_follow":
      return <User className="w-4 h-4" />;
    case "x_post":
      return <Twitter className="w-4 h-4" />;
    default:
      return <Award className="w-4 h-4" />;
  }
};

interface SubmissionReviewTabProps {
  campaignId: string;
  campaignTitle: string;
}

export function SubmissionReviewTab({
  campaignId,
  campaignTitle,
}: SubmissionReviewTabProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load submissions
  useEffect(() => {
    if (campaignId) {
      loadSubmissions();
    }
  }, [campaignId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}/submissions`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
      } else {
        throw new Error("Failed to load submissions");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load submissions"
      );
    } finally {
      setLoading(false);
    }
  };

  const approvedSubmissions = submissions.filter(
    (sub) => sub.status === "approved"
  );
  const pendingSubmissions = submissions.filter(
    (sub) => sub.status === "pending"
  );
  const rejectedSubmissions = submissions.filter(
    (sub) => sub.status === "rejected"
  );

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {approvedSubmissions.length}
                </p>
                <p className="text-sm text-muted-foreground">Auto-Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingSubmissions.length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {rejectedSubmissions.length}
                </p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="approved" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Auto-Approved ({approvedSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Rejected ({rejectedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {approvedSubmissions.length > 0 ? (
            approvedSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No auto-approved submissions
              </h3>
              <p className="text-muted-foreground">
                Valid submissions will be auto-approved and appear here.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingSubmissions.length > 0 ? (
            pendingSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No pending submissions
              </h3>
              <p className="text-muted-foreground">
                All submissions have been processed automatically.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {rejectedSubmissions.length > 0 ? (
            rejectedSubmissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))
          ) : (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No rejected submissions
              </h3>
              <p className="text-muted-foreground">
                Invalid submissions would appear here, but all have been
                processed successfully.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {submissions.length === 0 && !loading && (
        <div className="text-center py-8">
          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
          <p className="text-muted-foreground">
            Participants haven't submitted any tasks for this campaign yet.
          </p>
        </div>
      )}
    </div>
  );
}

interface SubmissionCardProps {
  submission: Submission;
}

function SubmissionCard({ submission }: SubmissionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {submission.userWallet.slice(2, 4).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {submission.taskTitle}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {submission.twitterUsername ? (
                  <span className="flex items-center gap-1">
                    <Twitter className="h-3 w-3" />@{submission.twitterUsername}
                  </span>
                ) : (
                  <>
                    {submission.userWallet.slice(0, 6)}...
                    {submission.userWallet.slice(-4)}
                  </>
                )}
              </p>
            </div>
          </div>
          {getStatusBadge(submission.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {getTaskTypeIcon(submission.taskType)}
          <span>{submission.taskType.replace("_", " ").toUpperCase()}</span>
        </div>

        {submission.submissionData?.twitterPostUrl && (
          <div>
            <Label className="text-sm font-medium">Submission:</Label>
            <a
              href={submission.submissionData.twitterPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1 mt-1"
            >
              {submission.submissionData.twitterPostUrl}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {submission.taskData?.autoApproved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Auto-Approved
              </span>
            </div>
            {submission.taskData.approvalReason && (
              <p className="text-sm text-green-700 mt-1">
                {submission.taskData.approvalReason}
              </p>
            )}
          </div>
        )}

        {submission.verifierNotes && (
          <div>
            <Label className="text-sm font-medium">Notes:</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {submission.verifierNotes}
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            Submitted: {new Date(submission.createdAt).toLocaleString()}
          </span>
          {submission.verifiedAt && (
            <span>
              Processed: {new Date(submission.verifiedAt).toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
