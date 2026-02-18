"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Zap,
  UserPlus,
  Loader2,
  MessageSquare,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Send,
  MapPin,
  Mail,
  Users,
  ArrowUpDown,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CleanerAvailability = "available" | "on_job" | "unavailable" | "day_off" | "sick_leave";

interface AssignmentCandidate {
  cleanerId: string;
  cleanerName: string;
  phone: string;
  email: string;
  homeAddress: string;
  availability: CleanerAvailability;
  score: number;
  distance: number;
  currentHoursThisWeek: number;
  hourlyRate: number;
  rating: number;
  specializationMatch: boolean;
  isPreferred: boolean;
  reasons: string[];
}

type OutreachStatus =
  | "queued"
  | "contacting"
  | "confirmed"
  | "unavailable"
  | "no_response"
  | "declined";

interface CleanerOutreach {
  candidate: AssignmentCandidate;
  status: OutreachStatus;
  channel: "sms" | "phone";
  message: string;
  result: string;
  elapsed: number;
}

type AssignmentPhase =
  | "candidates"
  | "outreach"
  | "filled";

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  channels: string[];
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface AssignmentPanelProps {
  orderId: string;
  orderNumber?: string;
  orderAddress?: string;
  orderDate?: Date;
  orderStartTime?: string;
  assignedCleanerId?: string;
  assignedCleanerName?: string;
  autoAssigned?: boolean;
  status: string;
  onAssigned?: () => void;
  notifications?: NotificationData[];
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  OutreachStatus,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  queued: {
    label: "Queued",
    color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    icon: Clock,
  },
  contacting: {
    label: "In Progress",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Loader2,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2,
  },
  unavailable: {
    label: "Unavailable",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
  no_response: {
    label: "No Response",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon: AlertTriangle,
  },
  declined: {
    label: "Declined",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
  },
};

// ---------------------------------------------------------------------------
// Availability config
// ---------------------------------------------------------------------------

const AVAILABILITY_CONFIG: Record<CleanerAvailability, { label: string; color: string }> = {
  available: { label: "Available", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  on_job: { label: "On Job", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  unavailable: { label: "Unavailable", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  day_off: { label: "Day Off", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  sick_leave: { label: "Sick Leave", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

const AVAILABILITY_ORDER: Record<CleanerAvailability, number> = {
  available: 0,
  on_job: 1,
  day_off: 2,
  sick_leave: 3,
  unavailable: 4,
};

// ---------------------------------------------------------------------------
// Mock data arrays
// ---------------------------------------------------------------------------

const UNAVAILABLE_REASONS = [
  "Already booked for another job at this time",
  "On personal leave today",
  "Vehicle in maintenance — can't travel",
  "Called in sick this morning",
  "Currently out of service area",
  "Vacation until next week",
  "Doctor's appointment conflicts",
];

const NO_RESPONSE_REASONS = [
  "SMS delivered, no reply after 60s",
  "Call went to voicemail",
  "SMS delivered, phone unreachable",
  "No answer after 2 attempts",
  "Call rang out, no voicemail",
  "Delivered but not read",
];

const DECLINED_REASONS = [
  "Too far from current location",
  "Prefers not to work in this area",
  "Does not do this type of cleaning",
  "Schedule conflict with personal plans",
];

const CONFIRMED_REASONS = [
  "Accepted via SMS — en route",
  "Confirmed by phone — available immediately",
  "Replied YES to SMS assignment",
  "Confirmed on call — will arrive on time",
  "Accepted assignment, already nearby",
];

// ---------------------------------------------------------------------------
// Message templates
// ---------------------------------------------------------------------------

function getPersonalizedSMS(
  name: string,
  orderNum: string,
  date: string,
  time: string,
  addr: string
): string {
  const templates = [
    `Hi ${name}! New cleaning job ${orderNum} on ${date} at ${time}. Location: ${addr}. Reply YES to accept or NO to decline.`,
    `CleanSlate Alert: ${name}, we have order ${orderNum} for ${date} ${time} at ${addr}. Can you take it? Reply YES/NO`,
    `Hey ${name}, urgent job available! Order ${orderNum}, ${date} at ${time}. Address: ${addr}. Interested? Reply YES`,
    `${name}, new assignment: ${orderNum}. ${date} ${time}, ${addr}. Please confirm availability. Reply YES to accept.`,
    `Good news ${name}! Job ${orderNum} is available on ${date} at ${time} near ${addr}. Reply YES to confirm or NO to pass.`,
    `CleanSlate: ${name}, you've been matched for order ${orderNum} on ${date} at ${time}. Location: ${addr}. Accept?`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function getPersonalizedCall(
  name: string,
  orderNum: string,
  date: string,
  time: string,
  addr: string
): string {
  const templates = [
    `Auto-dialer: "Hello ${name}, this is CleanSlate dispatch. We have a cleaning job ${orderNum} scheduled for ${date} at ${time}, located at ${addr}. Press 1 to accept or 2 to decline."`,
    `Auto-dialer: "Hi ${name}, CleanSlate here. Order ${orderNum} needs a cleaner on ${date} at ${time}. The address is ${addr}. Press 1 if you're available."`,
    `Auto-dialer: "Good day ${name}. A new assignment ${orderNum} is waiting for you on ${date}, ${time} at ${addr}. Press 1 to confirm."`,
    `Auto-dialer: "${name}, this is an automated message from CleanSlate. Job ${orderNum} on ${date} at ${time}, address: ${addr}. Press 1 to accept this job."`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function getClosingMessage(): string {
  return `Thanks for your consideration of picking up today, the shift has been filled. Let me know if you're open later this week, and I'll prioritize you for upcoming visits.`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtTime(time?: string): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function fmtDate(date?: Date): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Main Component — renders INLINE (no dialog)
// ---------------------------------------------------------------------------

export function AssignmentPanel({
  orderId,
  orderNumber,
  orderAddress,
  orderDate,
  orderStartTime,
  assignedCleanerId,
  assignedCleanerName,
  autoAssigned,
  status,
  onAssigned,
  notifications,
}: AssignmentPanelProps) {
  const [candidates, setCandidates] = useState<AssignmentCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Outreach state
  const [outreach, setOutreach] = useState<CleanerOutreach[]>([]);
  const [outreachRunning, setOutreachRunning] = useState(false);
  const [phase, setPhase] = useState<AssignmentPhase>("candidates");
  const [confirmedCleaner, setConfirmedCleaner] = useState<string | null>(null);
  const [closingCommsReady, setClosingCommsReady] = useState(false);
  const abortRef = useRef(false);

  const isAssigned = !!assignedCleanerId;
  const canAssign = !["completed", "cancelled"].includes(status);

  const dateStr = fmtDate(orderDate);
  const timeStr = fmtTime(orderStartTime);
  const addr = orderAddress || "the client address";
  const num = orderNumber || orderId.slice(0, 8);

  // Auto-load candidates on mount
  useEffect(() => {
    loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function loadSuggestions() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/suggest`);
      const data = await res.json();
      setCandidates(data.candidates || []);
    } catch {
      setError("Failed to load cleaner suggestions");
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Outreach simulation
  // ---------------------------------------------------------------------------

  const runOutreach = useCallback(async () => {
    if (candidates.length === 0) return;
    setOutreachRunning(true);
    setPhase("outreach");
    setConfirmedCleaner(null);
    setClosingCommsReady(false);
    setError("");
    abortRef.current = false;

    // Pick 1-3 cleaners that will confirm (first one = primary, rest = backups)
    const maxConfirm = Math.min(1 + Math.floor(Math.random() * 3), candidates.length);
    const allIndices = candidates.map((_, i) => i);
    // Shuffle to pick random confirm indices
    for (let i = allIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
    }
    const confirmIndices = new Set(allIndices.slice(0, maxConfirm));
    // The first confirmed index becomes the primary (best score among confirmed)
    const primaryConfirmIdx = [...confirmIndices].sort(
      (a, b) => candidates[b].score - candidates[a].score
    )[0];

    const initial: CleanerOutreach[] = candidates.map((c) => ({
      candidate: c,
      status: "queued" as OutreachStatus,
      channel: Math.random() > 0.5 ? "sms" : "phone",
      message: "",
      result: "",
      elapsed: 0,
    }));
    setOutreach(initial);

    await sleep(400);

    for (let i = 0; i < candidates.length; i++) {
      if (abortRef.current) return;
      const c = candidates[i];
      const channel: "sms" | "phone" = Math.random() > 0.4 ? "sms" : "phone";
      const msg =
        channel === "sms"
          ? getPersonalizedSMS(c.cleanerName.split(" ")[0], num, dateStr, timeStr, addr)
          : getPersonalizedCall(c.cleanerName.split(" ")[0], num, dateStr, timeStr, addr);

      setOutreach((prev) =>
        prev.map((o, idx) =>
          idx === i ? { ...o, status: "contacting", channel, message: msg } : o
        )
      );
      await sleep(200 + Math.random() * 300);
    }

    // Shuffle resolution order: non-confirmed first, then confirmed
    const resolveOrder = candidates.map((_, i) => i).filter((i) => !confirmIndices.has(i));
    for (let i = resolveOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [resolveOrder[i], resolveOrder[j]] = [resolveOrder[j], resolveOrder[i]];
    }
    // Add confirmed indices at end (primary last)
    const confirmArr = [...confirmIndices].filter((i) => i !== primaryConfirmIdx);
    resolveOrder.push(...confirmArr, primaryConfirmIdx);

    for (const idx of resolveOrder) {
      if (abortRef.current) return;
      const wait = 600 + Math.random() * 1400;
      await sleep(wait);

      if (confirmIndices.has(idx)) {
        setOutreach((prev) =>
          prev.map((o, i) =>
            i === idx
              ? { ...o, status: "confirmed", result: pickRandom(CONFIRMED_REASONS), elapsed: Math.round(2 + Math.random() * 8) }
              : o
          )
        );
        // Set primary confirmed cleaner
        if (idx === primaryConfirmIdx) {
          setConfirmedCleaner(candidates[idx].cleanerId);
        }
      } else {
        const roll = Math.random();
        let failStatus: OutreachStatus;
        let failResult: string;
        if (roll < 0.45) { failStatus = "unavailable"; failResult = pickRandom(UNAVAILABLE_REASONS); }
        else if (roll < 0.8) { failStatus = "no_response"; failResult = pickRandom(NO_RESPONSE_REASONS); }
        else { failStatus = "declined"; failResult = pickRandom(DECLINED_REASONS); }

        setOutreach((prev) =>
          prev.map((o, i) =>
            i === idx
              ? { ...o, status: failStatus, result: failResult, elapsed: Math.round(2 + Math.random() * 15) }
              : o
          )
        );
      }
    }

    setOutreachRunning(false);
  }, [candidates, num, dateStr, timeStr, addr]);

  // ---------------------------------------------------------------------------
  // Assign handler
  // ---------------------------------------------------------------------------

  async function handleAssign(cleanerId: string) {
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "manual", cleanerId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Assignment failed");
        return;
      }
      setConfirmedCleaner(cleanerId);
      setPhase("filled");
      await sleep(1500);
      setClosingCommsReady(true);
    } catch {
      setError("Assignment failed");
    }
  }

  async function handleAutoAssign() {
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "auto" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Assignment failed");
        return;
      }
      const result = await res.json();
      const assignedId = result.order?.assignedCleanerId;
      if (assignedId) setConfirmedCleaner(assignedId);
      setPhase("filled");
      await sleep(1500);
      setClosingCommsReady(true);
    } catch {
      setError("Assignment failed");
    }
  }

  function handleDone() {
    onAssigned?.();
  }

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const outreachDone = !outreachRunning && outreach.length > 0 && outreach.every(
    (o) => !["queued", "contacting"].includes(o.status)
  );
  const contactingCount = outreach.filter((o) => o.status === "contacting").length;
  const doneCount = outreach.filter(
    (o) => !["queued", "contacting"].includes(o.status)
  ).length;
  const confirmedEntries = outreach.filter((o) => o.status === "confirmed");
  const confirmedEntry = confirmedCleaner
    ? outreach.find((o) => o.candidate.cleanerId === confirmedCleaner && o.status === "confirmed")
    : confirmedEntries[0];
  const backupConfirmed = confirmedEntries.filter(
    (o) => o.candidate.cleanerId !== confirmedCleaner
  );
  const confirmedCandidate = confirmedCleaner
    ? candidates.find((c) => c.cleanerId === confirmedCleaner)
    : undefined;
  const nonConfirmedOutreach = outreach.filter(
    (o) => o.candidate.cleanerId !== confirmedCleaner
  );

  // ---------------------------------------------------------------------------
  // Render — full-width inline section, table always visible
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-teal-600" />
          <h2 className="text-lg font-semibold">Cleaner Selection</h2>
          {(isAssigned || phase === "filled") && (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs ml-2">
              Assigned: {confirmedCandidate?.cleanerName || assignedCleanerName}
              {autoAssigned && phase !== "filled" && " (Auto)"}
            </Badge>
          )}
        </div>
        {candidates.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {candidates.length} candidates found
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Action buttons — only before outreach starts */}
      {phase === "candidates" && canAssign && !loading && candidates.length > 0 && (
        <div className="flex gap-2">
          <Button
            onClick={runOutreach}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Zap className="h-4 w-4 mr-2" />
            Contact All Cleaners
          </Button>
          <Button onClick={handleAutoAssign} variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Auto-Assign Best
          </Button>
        </div>
      )}

      {/* Progress indicator — during outreach */}
      {(phase === "outreach" || phase === "filled") && outreach.length > 0 && (
        <div className="flex items-center gap-3 text-sm">
          {outreachRunning ? (
            <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
          ) : phase === "filled" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : confirmedEntry ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">
            {phase === "filled"
              ? `${confirmedCandidate?.cleanerName || "Cleaner"} assigned — ${doneCount}/${outreach.length} contacted${backupConfirmed.length > 0 ? `, ${backupConfirmed.length} backup` : ""}`
              : outreachRunning
                ? `Contacting cleaners... ${doneCount}/${outreach.length} responded`
                : confirmedEntries.length > 0
                  ? `${confirmedEntries.length} cleaner${confirmedEntries.length > 1 ? "s" : ""} confirmed`
                  : `Outreach complete — ${doneCount}/${outreach.length} responded`}
          </span>
          {contactingCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {contactingCount} in progress
            </Badge>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span className="text-sm">Loading available cleaners...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && candidates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <User className="h-10 w-10 mx-auto mb-3 opacity-40" />
          No suitable cleaners found for this order
        </div>
      )}

      {/* ====== TABLE — ALWAYS VISIBLE when candidates loaded ====== */}
      {!loading && candidates.length > 0 && (
        <CandidateTable
          candidates={candidates}
          outreach={outreach}
          outreachDone={outreachDone}
          canAssign={canAssign}
          onAssign={handleAssign}
          assignedCleanerId={phase === "filled" ? confirmedCleaner : null}
        />
      )}

      {/* ====== HISTORICAL NOTIFICATIONS (when order already assigned, no active outreach) ====== */}
      {isAssigned && outreach.length === 0 && notifications && notifications.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <h4 className="text-sm font-semibold">
                Assignment Communications
              </h4>
              <Badge variant="outline" className="text-[10px]">
                {notifications.length}
              </Badge>
            </div>
            <Link
              href={`/dashboard/orders/${orderId}/communications`}
              className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              View all
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Messages sent during cleaner assignment
          </p>

          {/* Message cards — show up to 6, each card is a conversation with a different cleaner */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {notifications.slice(0, 6).map((notif) => {
              const channel = (notif.metadata?.channel as string) || "sms";
              const cleanerName = (notif.metadata?.cleanerName as string) || "Cleaner";
              const outreachStatus = (notif.metadata?.outreachStatus as string) || "confirmed";
              const isConfirmed = outreachStatus === "confirmed";
              const isDeclined = outreachStatus === "declined";
              const isNoResponse = outreachStatus === "no_response";
              const isUnavailable = outreachStatus === "unavailable";

              const statusBadgeColor = isConfirmed
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : isDeclined
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : isNoResponse
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    : isUnavailable
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";

              const statusLabel = isConfirmed ? "Confirmed" : isDeclined ? "Declined" : isNoResponse ? "No Response" : isUnavailable ? "Unavailable" : notif.title;

              const borderColor = isConfirmed
                ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/10"
                : isDeclined
                  ? "border-red-200 dark:border-red-800"
                  : isNoResponse
                    ? "border-amber-200 dark:border-amber-800"
                    : isUnavailable
                      ? "border-red-200 dark:border-red-800"
                      : "border-border";

              return (
                <div
                  key={notif.id}
                  className={cn(
                    "rounded-lg border p-4 space-y-3",
                    borderColor
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                        {channel === "phone" ? "CALL" : "SMS"}
                      </span>
                      <div>
                        <span className="text-sm font-semibold">{cleanerName}</span>
                        <div className="text-[11px] text-muted-foreground">
                          {channel === "phone" ? "Phone Call" : channel === "in_app" ? "In-App" : "Text Message"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge className={cn("text-[10px] border-0 font-semibold", statusBadgeColor)}>
                        {statusLabel}
                      </Badge>
                      <Send className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="text-xs leading-relaxed text-foreground/80">
                    {notif.message}
                  </div>
                  <div className="text-[10px] text-muted-foreground italic border-t pt-2">
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(notif.createdAt))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* View all link when there are more than 6 */}
          {notifications.length > 6 && (
            <div className="text-center pt-1">
              <Link
                href={`/dashboard/orders/${orderId}/communications`}
                className="inline-flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                View all {notifications.length} communications
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ====== OUTREACH MESSAGES (during outreach + filled) ====== */}
      {outreach.some((o) => o.message) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b pb-2">
            <Mail className="h-4 w-4" />
            <h4 className="text-sm font-semibold">
              {phase === "filled"
                ? "CleanSlate contacted available cleaners"
                : "CleanSlate is contacting available cleaners"}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Sending personalized messages and maintaining relationships
          </p>

          {/* Compact element row */}
          <div className="flex flex-wrap gap-2">
            {outreach
              .filter((o) => o.message)
              .map((o) => {
                const st = STATUS_CONFIG[o.status];
                const StIcon = st?.icon || Clock;
                const isAssignedChip = o.status === "confirmed" && confirmedCleaner === o.candidate.cleanerId;
                const isBackupChip = o.status === "confirmed" && confirmedCleaner !== o.candidate.cleanerId;
                return (
                  <div
                    key={`chip-${o.candidate.cleanerId}`}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all",
                      isAssignedChip
                        ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/10"
                        : isBackupChip
                          ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/10"
                          : o.status === "contacting"
                            ? "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10"
                            : "border-border bg-card"
                    )}
                  >
                    {o.channel === "sms" ? (
                      <MessageSquare className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                    ) : (
                      <Phone className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                    )}
                    <span className={cn(
                      "font-medium",
                      isAssignedChip ? "text-green-700 dark:text-green-400" : isBackupChip ? "text-blue-700 dark:text-blue-400" : ""
                    )}>
                      {o.candidate.cleanerName}
                    </span>
                    <Badge className={cn("text-[9px] border-0 gap-0.5", st.color)}>
                      {o.status === "contacting" ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <StIcon className="h-2.5 w-2.5" />}
                      {st.label}
                    </Badge>
                    {isAssignedChip && (
                      <Badge className="text-[9px] border-0 bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                        Assigned
                      </Badge>
                    )}
                    {isBackupChip && (
                      <Badge className="text-[9px] border-0 bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                        Backup
                      </Badge>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Message cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {outreach
              .filter((o) => o.message)
              .map((o) => {
                const st = STATUS_CONFIG[o.status];
                const isAssignedCard = o.status === "confirmed" && confirmedCleaner === o.candidate.cleanerId;
                const isBackupCard = o.status === "confirmed" && confirmedCleaner !== o.candidate.cleanerId;
                return (
                  <div
                    key={o.candidate.cleanerId}
                    className={cn(
                      "rounded-lg border p-4 space-y-3 transition-all",
                      isAssignedCard
                        ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/10"
                        : isBackupCard
                          ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/10"
                          : o.status === "contacting"
                            ? "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10"
                            : "border-border"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                          {o.channel === "sms" ? "SMS" : "CALL"}
                        </span>
                        <div>
                          <span className="text-sm font-semibold">{o.candidate.cleanerName}</span>
                          <div className="text-[11px] text-muted-foreground">
                            {o.channel === "sms" ? "Text Message" : "Phone Call"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className={cn("text-[10px] border-0 font-semibold", st.color)}>
                          {st.label}
                        </Badge>
                        <Send className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="text-xs leading-relaxed text-foreground/80">
                      {o.message}
                    </div>
                    {o.result && (
                      <div className="text-[10px] text-muted-foreground italic border-t pt-2">
                        {o.result}
                        {o.elapsed > 0 && (
                          <span className="ml-2 text-muted-foreground/60">({o.elapsed}s)</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Confirmed bar — outreach done but not yet assigned */}
      {phase === "outreach" && outreachDone && confirmedEntry && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                {confirmedEntry.candidate.cleanerName} is available
                {backupConfirmed.length > 0 && (
                  <span className="font-normal text-green-600/80">
                    {" "}(+{backupConfirmed.length} backup{backupConfirmed.length > 1 ? "s" : ""}: {backupConfirmed.map((b) => b.candidate.cleanerName.split(" ")[0]).join(", ")})
                  </span>
                )}
              </p>
              <p className="text-xs text-green-600/80">{confirmedEntry.result}</p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleAssign(confirmedEntry.candidate.cleanerId)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Confirm Assignment
          </Button>
        </div>
      )}

      {phase === "outreach" && outreachDone && !confirmedEntry && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              No cleaner confirmed
            </p>
            <p className="text-xs text-amber-600/80">
              You can manually assign from the table above or retry.
            </p>
          </div>
        </div>
      )}

      {/* ====== FILLED — summary + closing comms (below table) ====== */}
      {phase === "filled" && (
        <>
          {/* Successfully filled block */}
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Order Successfully Filled</h3>
                <p className="text-sm font-medium text-muted-foreground">
                  CleanSlate, Staffing Coordinator:
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {confirmedCandidate?.cleanerName || "Selected cleaner"} confirmed
                  and will be there by {timeStr}.{" "}
                  {addr !== "the client address" ? `Location: ${addr}.` : ""}{" "}
                  The cleaner has been added to today&apos;s schedule.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 space-y-2.5">
                <h4 className="font-semibold text-sm">Original Order</h4>
                <div className="space-y-1.5 text-sm">
                  <div><span className="font-medium">Order: </span><span className="text-muted-foreground">{num}</span></div>
                  <div><span className="font-medium">Date: </span><span className="text-muted-foreground">{dateStr}, {timeStr}</span></div>
                  <div><span className="font-medium">Location: </span><span className="text-muted-foreground">{addr}</span></div>
                </div>
              </div>
              <div className="rounded-lg border p-4 space-y-2.5">
                <h4 className="font-semibold text-sm">Assigned Cleaner</h4>
                <div className="space-y-1.5 text-sm">
                  <div><span className="font-medium">Cleaner: </span><span className="text-muted-foreground">{confirmedCandidate?.cleanerName || "—"}</span></div>
                  <div><span className="font-medium">Arrival: </span><span className="text-muted-foreground">{timeStr}</span></div>
                  <div><span className="font-medium">Pay Rate: </span><span className="text-muted-foreground">${confirmedCandidate?.hourlyRate || 0}/hr</span></div>
                  <div><span className="font-medium">Status: </span><span className="text-green-600 font-medium">Confirmed</span></div>
                  {confirmedCandidate?.homeAddress && (
                    <div><span className="font-medium">Address: </span><span className="text-muted-foreground">{confirmedCandidate.homeAddress}</span></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Closing communications */}
          {closingCommsReady && nonConfirmedOutreach.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <Mail className="h-4 w-4" />
                <h4 className="text-sm font-semibold">
                  CleanSlate is sending closing communications
                </h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Thanking cleaners and maintaining relationships for future availability
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {nonConfirmedOutreach.map((o) => (
                  <div key={`closing-${o.candidate.cleanerId}`} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-0.5">SMS</span>
                        <div>
                          <span className="text-sm font-semibold">{o.candidate.cleanerName}</span>
                          <div className="text-[11px] text-muted-foreground">Text Message</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge className="text-[10px] border-0 font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Delivered
                        </Badge>
                        <Send className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="text-xs leading-relaxed text-foreground/80">
                      {getClosingMessage()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!closingCommsReady && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending closing communications to other cleaners...
            </div>
          )}

          {/* System notifications */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <h4 className="font-semibold text-sm">System Notifications</h4>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>{confirmedCandidate?.cleanerName || "Cleaner"} added to schedule</span>
              </div>
              <div className="ml-6 text-xs">{dateStr}, {timeStr} shift</div>
              <div className="ml-6 text-xs">Schedule updated for {addr}</div>
            </div>
          </div>

          <Button onClick={handleDone} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
            Done
          </Button>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Candidate Table sub-component
// ---------------------------------------------------------------------------

type CandidateSortKey = "name" | "score" | "distance" | "phone" | "address" | "hours" | "rate" | "rating" | "availability" | "status";

const OUTREACH_STATUS_ORDER: Record<string, number> = {
  confirmed: 0,
  contacting: 1,
  queued: 2,
  no_response: 3,
  declined: 4,
  unavailable: 5,
};

function CandidateTable({
  candidates,
  outreach,
  outreachDone,
  canAssign,
  onAssign,
  assignedCleanerId,
}: {
  candidates: AssignmentCandidate[];
  outreach: CleanerOutreach[];
  outreachDone: boolean;
  canAssign: boolean;
  onAssign: (cleanerId: string) => void;
  assignedCleanerId: string | null;
}) {
  const hasOutreach = outreach.length > 0;
  const [sortKey, setSortKey] = useState<CandidateSortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [scrollActive, setScrollActive] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Deactivate scroll when clicking outside the table
  useEffect(() => {
    if (!scrollActive) return;
    function handleClickOutside(e: MouseEvent) {
      if (tableContainerRef.current && !tableContainerRef.current.contains(e.target as Node)) {
        setScrollActive(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [scrollActive]);

  function handleSort(key: CandidateSortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "phone" || key === "address" ? "asc" : "desc");
    }
  }

  // Build outreach map for quick lookup
  const outreachMap = useMemo(() => {
    const map = new Map<string, CleanerOutreach>();
    outreach.forEach((o, idx) => {
      if (candidates[idx]) map.set(candidates[idx].cleanerId, o);
    });
    return map;
  }, [outreach, candidates]);

  const sorted = useMemo(() => {
    const items = [...candidates];
    const dir = sortDir === "asc" ? 1 : -1;
    items.sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.cleanerName.localeCompare(b.cleanerName) * dir;
        case "score":
          return (a.score - b.score) * dir;
        case "distance":
          return (a.distance - b.distance) * dir;
        case "phone":
          return a.phone.localeCompare(b.phone) * dir;
        case "address":
          return (a.homeAddress || "").localeCompare(b.homeAddress || "") * dir;
        case "hours":
          return (a.currentHoursThisWeek - b.currentHoursThisWeek) * dir;
        case "rate":
          return (a.hourlyRate - b.hourlyRate) * dir;
        case "rating":
          return (a.rating - b.rating) * dir;
        case "availability": {
          const avA = AVAILABILITY_ORDER[a.availability] ?? 99;
          const avB = AVAILABILITY_ORDER[b.availability] ?? 99;
          return (avA - avB) * dir;
        }
        case "status": {
          const oA = outreachMap.get(a.cleanerId);
          const oB = outreachMap.get(b.cleanerId);
          const sA = OUTREACH_STATUS_ORDER[oA?.status || "queued"] ?? 99;
          const sB = OUTREACH_STATUS_ORDER[oB?.status || "queued"] ?? 99;
          return (sA - sB) * dir;
        }
        default:
          return 0;
      }
    });
    return items;
  }, [candidates, sortKey, sortDir, outreachMap]);

  function SortHeader({ label, sortId, align }: { label: string; sortId: CandidateSortKey; align?: string }) {
    return (
      <th className={cn("px-2 py-2 font-medium", align === "center" ? "text-center" : "text-left", sortId === "name" && "px-3")}>
        <button
          onClick={() => handleSort(sortId)}
          className="inline-flex items-center gap-0.5 hover:text-foreground transition-colors"
        >
          {label}
          <ArrowUpDown className="h-3 w-3 ml-0.5 opacity-50" />
        </button>
      </th>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      className="rounded-lg border overflow-hidden"
      onClick={() => !scrollActive && setScrollActive(true)}
    >
      {/* Legend for colors */}
      {(assignedCleanerId || (hasOutreach && outreach.some((o) => o.status === "confirmed"))) && (
        <div className="flex items-center gap-4 px-3 py-2 bg-muted/30 border-b text-[11px]">
          {assignedCleanerId && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/40 border border-green-300 dark:border-green-700" />
              <span className="text-muted-foreground">Assigned</span>
            </div>
          )}
          {outreach.some(
            (o) => o.status === "confirmed" && o.candidate.cleanerId !== assignedCleanerId
          ) && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700" />
              <span className="text-muted-foreground">Backup (confirmed)</span>
            </div>
          )}
        </div>
      )}
      {/* Hint when scroll is not active */}
      {!scrollActive && candidates.length > 10 && (
        <div className="text-center py-1.5 bg-muted/20 border-b text-[11px] text-muted-foreground cursor-pointer hover:bg-muted/40 transition-colors">
          Click table to scroll · {candidates.length} cleaners total
        </div>
      )}
      <div className={cn(
        "overflow-x-auto",
        scrollActive && "max-h-[600px] overflow-y-auto"
      )}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-xs sticky top-0 z-10">
            <SortHeader label="Cleaner" sortId="name" />
            <SortHeader label="Score" sortId="score" align="center" />
            <SortHeader label="Distance" sortId="distance" align="center" />
            <th className="text-left px-2 py-2 font-medium">Contact</th>
            <SortHeader label="Address" sortId="address" />
            <SortHeader label="Hours" sortId="hours" align="center" />
            <SortHeader label="Rate" sortId="rate" align="center" />
            <SortHeader label="Availability" sortId="availability" align="center" />
            {hasOutreach && (
              <>
                <SortHeader label="Status" sortId="status" align="center" />
                <th className="text-left px-2 py-2 font-medium">Result</th>
              </>
            )}
            {canAssign && (outreachDone || !hasOutreach) && (
              <th className="text-center px-2 py-2 font-medium w-[80px]">Action</th>
            )}
          </tr>
        </thead>
        <tbody>
          {(scrollActive ? sorted : sorted.slice(0, 10)).map((c) => {
            const o = outreachMap.get(c.cleanerId);
            const st = o ? STATUS_CONFIG[o.status] : null;
            const StIcon = st?.icon || Clock;
            const isConfirmed = o?.status === "confirmed";
            const isAssigned = assignedCleanerId === c.cleanerId;
            const isBackup = isConfirmed && !isAssigned && assignedCleanerId !== null;

            return (
              <tr
                key={c.cleanerId}
                className={cn(
                  "border-t transition-colors",
                  isAssigned
                    ? "bg-green-100/70 dark:bg-green-950/20 border-l-[3px] border-l-green-500"
                    : isBackup
                      ? "bg-blue-50/70 dark:bg-blue-950/15 border-l-[3px] border-l-blue-400"
                      : isConfirmed
                        ? "bg-green-50/50 dark:bg-green-950/10"
                        : ""
                )}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium shrink-0",
                      isAssigned
                        ? "bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                        : isBackup
                          ? "bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                          : "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                    )}>
                      {c.cleanerName.split(" ").map((w) => w[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={cn(
                          "font-medium truncate text-sm",
                          isAssigned
                            ? "text-green-700 dark:text-green-400"
                            : isBackup
                              ? "text-blue-700 dark:text-blue-400"
                              : ""
                        )}>
                          {c.cleanerName}
                        </span>
                        {isAssigned && (
                          <Badge className="text-[9px] px-1.5 py-0 border-0 bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                            Assigned
                          </Badge>
                        )}
                        {isBackup && (
                          <Badge className="text-[9px] px-1.5 py-0 border-0 bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            Backup
                          </Badge>
                        )}
                        {isConfirmed && !isAssigned && !isBackup && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {c.rating.toFixed(1)}★{c.specializationMatch && " · Specialist"}{c.isPreferred && " · Preferred"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center">
                  <span className={cn("font-semibold", c.score >= 70 ? "text-teal-600" : c.score >= 40 ? "text-amber-600" : "text-red-500")}>
                    {c.score}%
                  </span>
                </td>
                <td className="px-2 py-2.5 text-center text-xs text-muted-foreground">
                  {c.distance > 0 ? `${c.distance} mi` : "—"}
                </td>
                <td className="px-2 py-2.5">
                  <div className="text-xs space-y-0.5">
                    {c.phone && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" /><span className="truncate">{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageSquare className="h-3 w-3 shrink-0" /><span className="truncate max-w-[130px]">{c.email}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex items-start gap-1 text-xs text-muted-foreground max-w-[160px]">
                    {c.homeAddress ? (
                      <>
                        <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{c.homeAddress}</span>
                      </>
                    ) : <span>—</span>}
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center text-xs text-muted-foreground">{c.currentHoursThisWeek}h</td>
                <td className="px-2 py-2.5 text-center text-xs text-muted-foreground">${c.hourlyRate}/hr</td>
                <td className="px-2 py-2.5 text-center">
                  {(() => {
                    const av = AVAILABILITY_CONFIG[c.availability] || AVAILABILITY_CONFIG.available;
                    return (
                      <Badge className={cn("text-[10px] border-0", av.color)}>
                        {av.label}
                      </Badge>
                    );
                  })()}
                </td>
                {hasOutreach && (
                  <>
                    <td className="px-2 py-2.5 text-center">
                      {st && (
                        <Badge className={cn("text-[10px] border-0 gap-1", st.color)}>
                          {o?.status === "contacting" ? <Loader2 className="h-3 w-3 animate-spin" /> : <StIcon className="h-3 w-3" />}
                          {st.label}
                        </Badge>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-xs text-muted-foreground max-w-[180px]">
                      <span className="line-clamp-2">{o?.result || "—"}</span>
                    </td>
                  </>
                )}
                {canAssign && (outreachDone || !hasOutreach) && (
                  <td className="px-2 py-2.5 text-center">
                    {isAssigned ? (
                      <Badge className="text-[10px] border-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant={isConfirmed || isBackup ? "default" : "ghost"}
                        className={cn(
                          "h-7 text-xs px-2",
                          isConfirmed && "bg-green-600 hover:bg-green-700 text-white",
                          isBackup && "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                        onClick={() => onAssign(c.cleanerId)}
                      >
                        {assignedCleanerId
                          ? <><UserPlus className="h-3 w-3 mr-1" />Reassign</>
                          : isConfirmed
                            ? <><CheckCircle2 className="h-3 w-3 mr-1" />Assign</>
                            : <><UserPlus className="h-3 w-3 mr-1" />Assign</>
                        }
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
          {!scrollActive && candidates.length > 10 && (
            <tr className="border-t">
              <td
                colSpan={99}
                className="text-center py-3 text-xs text-teal-600 font-medium cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={(e) => { e.stopPropagation(); setScrollActive(true); }}
              >
                Show all {candidates.length} cleaners ↓
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
