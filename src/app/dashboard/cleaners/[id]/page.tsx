import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Shield,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { cleanerStore } from "@/lib/services/db-service";
import {
  SPECIALIZATION_LABELS,
  SPECIALIZATION_COLORS,
  AVAILABILITY_LABELS,
  AVAILABILITY_COLORS,
} from "@/lib/constants";
import { cn, getInitials, formatPhone, formatCurrency, formatTime, formatDate } from "@/lib/utils";
import type { Cleaner } from "@/types/cleaner";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

const BACKGROUND_CHECK_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  cleared: {
    label: "Cleared",
    color: "text-green-600 dark:text-green-400",
    icon: "bg-green-100 dark:bg-green-900/30",
  },
  pending: {
    label: "Pending",
    color: "text-amber-600 dark:text-amber-400",
    icon: "bg-amber-100 dark:bg-amber-900/30",
  },
  expired: {
    label: "Expired",
    color: "text-red-600 dark:text-red-400",
    icon: "bg-red-100 dark:bg-red-900/30",
  },
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

export default async function CleanerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cleaner = await cleanerStore.getById(id);

  if (!cleaner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cleaners">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Cleaners
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-muted-foreground text-center">
              <h2 className="text-xl font-semibold mb-2">Cleaner Not Found</h2>
              <p className="text-sm">
                The cleaner you are looking for does not exist or has been removed.
              </p>
              <Link href="/dashboard/cleaners" className="mt-4 inline-block">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white mt-4">
                  View All Cleaners
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = getInitials(cleaner.firstName, cleaner.lastName);
  const fullName = `${cleaner.firstName} ${cleaner.lastName}`;
  const bgCheck = BACKGROUND_CHECK_CONFIG[cleaner.backgroundCheckStatus];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cleaners">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cleaners
          </Button>
        </Link>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-16 w-16 text-lg">
            <AvatarFallback className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{fullName}</h1>
              <Badge className={cn(STATUS_COLORS[cleaner.status])}>
                {STATUS_LABELS[cleaner.status] ?? cleaner.status}
              </Badge>
              <Badge className={cn(AVAILABILITY_COLORS[cleaner.availability])}>
                {AVAILABILITY_LABELS[cleaner.availability]}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {cleaner.zone}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {cleaner.rating.toFixed(1)} ({cleaner.totalReviews} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {formatDate(cleaner.createdAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold">{cleaner.rating.toFixed(1)}</p>
                <StarRating rating={cleaner.rating} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
              <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Orders</p>
              <p className="text-xl font-bold">{cleaner.completedOrders}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hours This Week</p>
              <p className="text-xl font-bold">{cleaner.hoursWorkedThisWeek}h</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hourly Rate</p>
              <p className="text-xl font-bold">{formatCurrency(cleaner.hourlyRate)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact & Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{cleaner.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{formatPhone(cleaner.phone)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">
                  {cleaner.homeLocation.address}, {cleaner.homeLocation.city},{" "}
                  {cleaner.homeLocation.state} {cleaner.homeLocation.zipCode}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Zone</p>
                <p className="text-sm font-medium">{cleaner.zone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Service Radius</p>
                <p className="text-sm font-medium">{cleaner.serviceRadius} miles</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="text-sm font-medium">{cleaner.yearsExperience} years</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cancellation Rate</p>
                <p className="text-sm font-medium">{cleaner.cancellationRate}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Overtime Rate</p>
                <p className="text-sm font-medium">{formatCurrency(cleaner.overtimeRate)}/hr</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hours This Month</p>
                <p className="text-sm font-medium">{cleaner.hoursWorkedThisMonth}h</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", bgCheck.icon)}>
                <Shield className={cn("h-4 w-4", bgCheck.color)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Background Check</p>
                <p className={cn("text-sm font-medium", bgCheck.color)}>
                  {bgCheck.label}
                  {cleaner.backgroundCheckDate && (
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      -- {formatDate(cleaner.backgroundCheckDate)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specializations & Certifications */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Specializations</CardTitle>
            </CardHeader>
            <CardContent>
              {cleaner.specializations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {cleaner.specializations.map((spec) => (
                    <Badge
                      key={spec}
                      className={cn(SPECIALIZATION_COLORS[spec])}
                    >
                      {SPECIALIZATION_LABELS[spec]}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No specializations listed.</p>
              )}
            </CardContent>
          </Card>

          {cleaner.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {cleaner.certifications.map((cert) => (
                    <Badge key={cert} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schedule Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Preferred Start</p>
                  <p className="text-sm font-medium">
                    {formatTime(cleaner.schedulePreference.preferredStartTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Preferred End</p>
                  <p className="text-sm font-medium">
                    {formatTime(cleaner.schedulePreference.preferredEndTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Max Hours/Week</p>
                  <p className="text-sm font-medium">
                    {cleaner.schedulePreference.maxHoursPerWeek}h
                  </p>
                </div>
              </div>

              {cleaner.schedulePreference.preferredDays.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Preferred Days</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cleaner.schedulePreference.preferredDays.map((day) => (
                      <Badge key={day} variant="secondary" className="text-xs">
                        {DAY_NAMES[day]}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {cleaner.schedulePreference.noGoZones.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">No-Go Zones</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cleaner.schedulePreference.noGoZones.map((zone) => (
                      <Badge key={zone} variant="destructive" className="text-xs">
                        {zone}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notes */}
      {cleaner.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {cleaner.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
