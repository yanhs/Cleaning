import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Phone,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Bell,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";
import { orderStore } from "@/lib/services/db-service";
import type { Order } from "@/types/order";

export const dynamic = "force-dynamic";

const OUTREACH_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; borderColor: string; icon: typeof CheckCircle2 }
> = {
  confirmed: {
    label: "Confirmed",
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    borderColor: "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/10",
    icon: CheckCircle2,
  },
  unavailable: {
    label: "Unavailable",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    icon: XCircle,
  },
  no_response: {
    label: "No Response",
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    icon: AlertTriangle,
  },
  declined: {
    label: "Declined",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    icon: XCircle,
  },
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function CommunicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order, notifications] = await Promise.all([
    orderStore.getById(id) as Promise<Order | undefined>,
    prisma.notification.findMany({
      where: { relatedOrderId: id, type: "order_assigned" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Mail className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-2xl font-bold tracking-tight">Order Not Found</h2>
        <Link href="/dashboard/orders">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  // Group by status
  const confirmed = notifications.filter(
    (n) => (n.metadata as Record<string, unknown>)?.outreachStatus === "confirmed"
  );
  const declined = notifications.filter(
    (n) => (n.metadata as Record<string, unknown>)?.outreachStatus === "declined"
  );
  const unavailable = notifications.filter(
    (n) => (n.metadata as Record<string, unknown>)?.outreachStatus === "unavailable"
  );
  const noResponse = notifications.filter(
    (n) => (n.metadata as Record<string, unknown>)?.outreachStatus === "no_response"
  );

  const stats = [
    { label: "Total Contacted", value: notifications.length, color: "text-foreground" },
    { label: "Confirmed", value: confirmed.length, color: "text-green-600" },
    { label: "Unavailable", value: unavailable.length, color: "text-red-600" },
    { label: "No Response", value: noResponse.length, color: "text-amber-600" },
    { label: "Declined", value: declined.length, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/orders/${id}`}>
            <Button variant="outline" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Assignment Communications
            </h1>
            <p className="text-sm text-muted-foreground">
              Order {order.orderNumber} &middot; All outreach messages sent during cleaner assignment
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className={cn("text-2xl font-bold", stat.color)}>
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Summary bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-teal-600" />
            Communication Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>{confirmed.length} confirmed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>{unavailable.length} unavailable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span>{noResponse.length} no response</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <span>{declined.length} declined</span>
            </div>
          </div>
          {/* Progress bar */}
          {notifications.length > 0 && (
            <div className="flex h-2 rounded-full overflow-hidden mt-3 bg-muted">
              {confirmed.length > 0 && (
                <div
                  className="bg-green-500"
                  style={{ width: `${(confirmed.length / notifications.length) * 100}%` }}
                />
              )}
              {unavailable.length > 0 && (
                <div
                  className="bg-red-500"
                  style={{ width: `${(unavailable.length / notifications.length) * 100}%` }}
                />
              )}
              {noResponse.length > 0 && (
                <div
                  className="bg-amber-500"
                  style={{ width: `${(noResponse.length / notifications.length) * 100}%` }}
                />
              )}
              {declined.length > 0 && (
                <div
                  className="bg-red-400"
                  style={{ width: `${(declined.length / notifications.length) * 100}%` }}
                />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All communications — card grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-teal-600" />
          <h3 className="text-sm font-semibold">
            All Messages ({notifications.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {notifications.map((notif) => {
            const meta = notif.metadata as Record<string, unknown> | null;
            const channel = (meta?.channel as string) || "sms";
            const cleanerName = (meta?.cleanerName as string) || "Cleaner";
            const outreachStatus = (meta?.outreachStatus as string) || "confirmed";
            const cfg = OUTREACH_STATUS_CONFIG[outreachStatus] || OUTREACH_STATUS_CONFIG.confirmed;
            const StatusIcon = cfg.icon;
            const ChannelIcon = channel === "phone" ? Phone : channel === "in_app" ? Bell : MessageSquare;

            return (
              <div
                key={notif.id}
                className={cn(
                  "rounded-lg border p-4 space-y-3",
                  cfg.borderColor
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                      {channel === "phone" ? "CALL" : channel === "in_app" ? "APP" : "SMS"}
                    </span>
                    <div>
                      <span className="text-sm font-semibold">{cleanerName}</span>
                      <div className="text-[11px] text-muted-foreground">
                        {channel === "phone" ? "Phone Call" : channel === "in_app" ? "In-App" : "Text Message"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className={cn("text-[10px] border-0 font-semibold gap-1", cfg.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </Badge>
                  </div>
                </div>

                {/* Message */}
                <div className="text-xs leading-relaxed text-foreground/80">
                  {notif.message}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t pt-2">
                  <div className="flex items-center gap-1.5">
                    <ChannelIcon className="h-3 w-3 text-muted-foreground" />
                    <Send className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className="text-[10px] text-muted-foreground italic">
                    {formatDateTime(notif.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No assignment communications for this order yet.</p>
          </div>
        )}
      </div>

      {/* Table view */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-teal-600" />
            Communication Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-xs border-b">
                  <th className="text-left px-4 py-2.5 font-medium">Cleaner</th>
                  <th className="text-center px-3 py-2.5 font-medium">Channel</th>
                  <th className="text-center px-3 py-2.5 font-medium">Status</th>
                  <th className="text-left px-3 py-2.5 font-medium">Message</th>
                  <th className="text-right px-4 py-2.5 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif) => {
                  const meta = notif.metadata as Record<string, unknown> | null;
                  const channel = (meta?.channel as string) || "sms";
                  const cleanerName = (meta?.cleanerName as string) || "Cleaner";
                  const outreachStatus = (meta?.outreachStatus as string) || "confirmed";
                  const cfg = OUTREACH_STATUS_CONFIG[outreachStatus] || OUTREACH_STATUS_CONFIG.confirmed;

                  return (
                    <tr key={notif.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30 text-xs font-medium text-teal-700 dark:text-teal-300 shrink-0">
                            {cleanerName.split(" ").map((w: string) => w[0]).join("")}
                          </div>
                          <span className="font-medium">{cleanerName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Badge variant="outline" className="text-[10px]">
                          {channel === "phone" ? "Phone" : channel === "in_app" ? "In-App" : "SMS"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Badge className={cn("text-[10px] border-0", cfg.color)}>
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground max-w-[300px]">
                        <span className="line-clamp-2">{notif.message}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(notif.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
