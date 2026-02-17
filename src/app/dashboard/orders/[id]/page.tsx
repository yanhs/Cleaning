import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  User,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { orderStore } from "@/lib/services/db-service";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  SPECIALIZATION_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import { cn, formatDate, formatTime } from "@/lib/utils";
import type { Order } from "@/types/order";

export const dynamic = "force-dynamic";

const RECURRENCE_LABELS: Record<string, string> = {
  one_time: "One Time",
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  unpaid: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  partial: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  refunded: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order: Order | undefined = await orderStore.getById(id);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Package className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-2xl font-bold tracking-tight">Order Not Found</h2>
        <p className="text-muted-foreground text-sm">
          The order you are looking for does not exist or has been removed.
        </p>
        <Link href="/dashboard/orders">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <Button variant="outline" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {order.orderNumber}
              </h1>
              <Badge
                className={cn(
                  ORDER_STATUS_COLORS[order.status],
                  "border-0"
                )}
              >
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <Badge
                className={cn(
                  PRIORITY_COLORS[order.priority],
                  "border-0"
                )}
              >
                {PRIORITY_LABELS[order.priority]}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Created {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <DollarSign className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-xl font-bold">{formatCurrency(order.total)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <DollarSign className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <Badge
                className={cn(
                  PAYMENT_STATUS_COLORS[order.paymentStatus] ?? "",
                  "border-0 mt-0.5"
                )}
              >
                {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <Clock className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. Duration</p>
              <p className="text-xl font-bold">
                {order.estimatedDuration} min
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 pt-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scheduled Date</p>
              <p className="text-xl font-bold">
                {formatDate(order.scheduledDate)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-teal-600" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{order.clientName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.clientPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{order.address.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.address.city}, {order.address.state}{" "}
                    {order.address.zipCode}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-teal-600" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Service Type</p>
              <Badge variant="secondary" className="border-0">
                {SPECIALIZATION_LABELS[order.type] ?? order.type}
              </Badge>
            </div>
            {order.squareFootage && (
              <div>
                <p className="text-sm text-muted-foreground">Square Footage</p>
                <p className="font-medium">
                  {order.squareFootage.toLocaleString()} sq ft
                </p>
              </div>
            )}
            {order.specialInstructions && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Special Instructions
                </p>
                <p className="text-sm bg-muted/50 rounded-lg p-3">
                  {order.specialInstructions}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-teal-600" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(order.scheduledDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">
                  {formatTime(order.scheduledStartTime)} -{" "}
                  {formatTime(order.scheduledEndTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recurrence</p>
                <p className="font-medium">
                  {RECURRENCE_LABELS[order.recurrence] ?? order.recurrence}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{order.estimatedDuration} min</p>
              </div>
            </div>
            {(order.actualStartTime || order.actualEndTime) && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  {order.actualStartTime && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Actual Start
                      </p>
                      <p className="font-medium">
                        {formatTime(order.actualStartTime)}
                      </p>
                    </div>
                  )}
                  {order.actualEndTime && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Actual End
                      </p>
                      <p className="font-medium">
                        {formatTime(order.actualEndTime)}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-teal-600" />
              Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Assigned Cleaner</p>
              <p className="font-medium">
                {order.assignedCleanerName ?? (
                  <span className="text-muted-foreground italic">
                    Unassigned
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assignment Method</p>
              <Badge
                variant="outline"
                className={cn(
                  order.autoAssigned
                    ? "border-teal-200 text-teal-700 dark:border-teal-800 dark:text-teal-400"
                    : ""
                )}
              >
                {order.autoAssigned ? "Auto-Assigned" : "Manual"}
              </Badge>
            </div>
            {order.cleanerNotes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Cleaner Notes
                </p>
                <p className="text-sm bg-muted/50 rounded-lg p-3">
                  {order.cleanerNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financials */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-teal-600" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tax</span>
              <span className="font-medium">{formatCurrency(order.tax)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Discount</span>
                <span className="font-medium text-green-600">
                  -{formatCurrency(order.discount)}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold text-teal-600">
                {formatCurrency(order.total)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-muted-foreground">
                Payment Status
              </span>
              <Badge
                className={cn(
                  PAYMENT_STATUS_COLORS[order.paymentStatus] ?? "",
                  "border-0"
                )}
              >
                {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline / Status Info */}
      {(order.cancellationReason ||
        order.clientRating !== undefined ||
        order.clientFeedback) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-teal-600" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.cancellationReason && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Cancellation Reason
                </p>
                <p className="text-sm bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 rounded-lg p-3">
                  {order.cancellationReason}
                </p>
              </div>
            )}
            {order.clientRating !== undefined && (
              <div>
                <p className="text-sm text-muted-foreground">Client Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "text-lg",
                        i < (order.clientRating ?? 0)
                          ? "text-amber-400"
                          : "text-gray-300 dark:text-gray-600"
                      )}
                    >
                      *
                    </span>
                  ))}
                  <span className="ml-2 text-sm font-medium">
                    {order.clientRating}/5
                  </span>
                </div>
              </div>
            )}
            {order.clientFeedback && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Client Feedback
                </p>
                <p className="text-sm bg-muted/50 rounded-lg p-3">
                  {order.clientFeedback}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
