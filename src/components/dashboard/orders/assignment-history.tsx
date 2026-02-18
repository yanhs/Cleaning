"use client";

import {
  MessageSquare,
  Phone,
  CheckCircle2,
  XCircle,
  User,
  Zap,
  Clock,
  Bell,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CandidateScore {
  cleanerId: string;
  cleanerName: string;
  score: number;
  distance: number;
  rating: number;
  hourlyRate: number;
  reasons: string[];
  specializationMatch: boolean;
  isPreferred: boolean;
}

interface AssignmentLogEntry {
  id: string;
  triggerReason: string;
  candidatesContacted: number;
  candidatesResponded: number;
  selectedCleanerName: string | null;
  success: boolean;
  durationSeconds: number;
  candidateScores: CandidateScore[] | null;
  createdAt: string;
}

interface NotificationEntry {
  id: string;
  type: string;
  title: string;
  message: string;
  channels: string[];
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface AssignmentHistoryProps {
  logs: AssignmentLogEntry[];
  notifications: NotificationEntry[];
}

function formatTime(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

const TRIGGER_LABELS: Record<string, string> = {
  auto_assignment: "Auto-assignment",
  manual_assignment: "Manual assignment",
};

export function AssignmentHistory({
  logs,
  notifications,
}: AssignmentHistoryProps) {
  if (logs.length === 0 && notifications.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-teal-600" />
          Assignment History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {logs.map((log) => (
          <div key={log.id} className="space-y-3">
            {/* Log header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {log.triggerReason === "auto_assignment" ? (
                  <Zap className="h-4 w-4 text-teal-600" />
                ) : (
                  <User className="h-4 w-4 text-blue-600" />
                )}
                <span className="text-sm font-medium">
                  {TRIGGER_LABELS[log.triggerReason] || log.triggerReason}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    log.success
                      ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                  )}
                >
                  {log.success ? "Success" : "Failed"}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatTime(log.createdAt)}
              </span>
            </div>

            {/* Selected cleaner */}
            {log.selectedCleanerName && (
              <div className="flex items-center gap-2 text-sm ml-6">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span>
                  Assigned to{" "}
                  <span className="font-medium">{log.selectedCleanerName}</span>
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground ml-6">
              <span>{log.candidatesContacted} candidates evaluated</span>
              {log.durationSeconds > 0 && (
                <span>{log.durationSeconds}s</span>
              )}
            </div>

            {/* Candidate scores table */}
            {log.candidateScores &&
              Array.isArray(log.candidateScores) &&
              log.candidateScores.length > 0 && (
                <div className="ml-6 rounded-lg border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left px-3 py-1.5 font-medium">#</th>
                        <th className="text-left px-3 py-1.5 font-medium">Cleaner</th>
                        <th className="text-center px-3 py-1.5 font-medium">Score</th>
                        <th className="text-center px-3 py-1.5 font-medium">Rating</th>
                        <th className="text-center px-3 py-1.5 font-medium">Distance</th>
                        <th className="text-left px-3 py-1.5 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(log.candidateScores as CandidateScore[]).map(
                        (candidate, idx) => {
                          const isSelected =
                            candidate.cleanerName === log.selectedCleanerName;
                          // Simulate notification actions per candidate
                          const notifs = notifications.filter(
                            (n) =>
                              n.metadata?.cleanerName === candidate.cleanerName
                          );
                          const hasSms = notifs.some(
                            (n) => n.metadata?.channel === "sms"
                          );
                          const hasCall = notifs.some(
                            (n) => n.metadata?.channel === "phone"
                          );
                          const hasInApp = notifs.some(
                            (n) => n.metadata?.channel === "in_app"
                          );

                          return (
                            <tr
                              key={candidate.cleanerId}
                              className={cn(
                                "border-t",
                                isSelected && "bg-teal-50/50 dark:bg-teal-950/10"
                              )}
                            >
                              <td className="px-3 py-2 text-muted-foreground">
                                {idx + 1}
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={cn("font-medium", isSelected && "text-teal-700 dark:text-teal-400")}>
                                    {candidate.cleanerName}
                                  </span>
                                  {isSelected && (
                                    <CheckCircle2 className="h-3 w-3 text-teal-600" />
                                  )}
                                </div>
                                {candidate.reasons.length > 0 && (
                                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                                    {candidate.reasons.slice(0, 3).map((r, i) => (
                                      <Badge
                                        key={i}
                                        variant="secondary"
                                        className="text-[9px] px-1 py-0"
                                      >
                                        {r}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={cn(
                                    "font-semibold",
                                    candidate.score >= 70
                                      ? "text-teal-600"
                                      : candidate.score >= 40
                                        ? "text-amber-600"
                                        : "text-red-500"
                                  )}
                                >
                                  {candidate.score}%
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                {candidate.rating.toFixed(1)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {candidate.distance > 0
                                  ? `${candidate.distance} mi`
                                  : "—"}
                              </td>
                              <td className="px-3 py-2">
                                {isSelected ? (
                                  <div className="flex items-center gap-1.5">
                                    {hasSms && (
                                      <span className="flex items-center gap-0.5 text-green-600" title="SMS sent">
                                        <MessageSquare className="h-3 w-3" />
                                      </span>
                                    )}
                                    {hasCall && (
                                      <span className="flex items-center gap-0.5 text-green-600" title="Call placed">
                                        <Phone className="h-3 w-3" />
                                      </span>
                                    )}
                                    {hasInApp && (
                                      <span className="flex items-center gap-0.5 text-green-600" title="In-app notification">
                                        <Bell className="h-3 w-3" />
                                      </span>
                                    )}
                                    {!hasSms && !hasCall && !hasInApp && (
                                      <span className="text-green-600 flex items-center gap-0.5">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Assigned
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground flex items-center gap-0.5">
                                    <XCircle className="h-3 w-3" />
                                    Not selected
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            {/* Notification messages for this log */}
            {notifications.length > 0 && (
              <div className="ml-6 space-y-1.5">
                {notifications
                  .filter((n) => {
                    const logTime = new Date(log.createdAt).getTime();
                    const notifTime = new Date(n.createdAt).getTime();
                    // Notifications within 30 seconds of the log
                    return Math.abs(notifTime - logTime) < 30000;
                  })
                  .map((notif) => {
                    const channel = (notif.metadata?.channel as string) || "in_app";
                    const Icon =
                      channel === "sms"
                        ? MessageSquare
                        : channel === "phone"
                          ? Phone
                          : Bell;
                    return (
                      <div
                        key={notif.id}
                        className="flex items-start gap-2 text-xs bg-muted/30 rounded-md px-2.5 py-2"
                      >
                        <Icon className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{notif.title}</span>
                          <p className="text-muted-foreground mt-0.5 whitespace-pre-wrap">
                            {notif.message}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
