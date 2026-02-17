import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, ClipboardList, UserX, CheckCircle, AlertTriangle, Clock, Star, Info } from "lucide-react";
import { cn, getRelativeTime } from "@/lib/utils";
import { notificationStore } from "@/lib/services/db-service";
import type { NotificationType } from "@/types/notification";

export const dynamic = "force-dynamic";

const typeIcons: Record<NotificationType, React.ElementType> = {
  order_assigned: ClipboardList,
  order_cancelled: AlertTriangle,
  order_completed: CheckCircle,
  cleaner_cancelled: UserX,
  replacement_found: CheckCircle,
  replacement_failed: AlertTriangle,
  shift_reminder: Clock,
  rating_received: Star,
  system_alert: Info,
};

const typeColors: Record<NotificationType, string> = {
  order_assigned: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  order_cancelled: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
  order_completed: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
  cleaner_cancelled: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30",
  replacement_found: "text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30",
  replacement_failed: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
  shift_reminder: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
  rating_received: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
  system_alert: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30",
};

export default async function NotificationsPage() {
  const { data: notifications } = await notificationStore.getAll(1, 50);
  const unreadCount = await notificationStore.getUnreadCount();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
      />

      <div className="space-y-2">
        {notifications.map((notification) => {
          const Icon = typeIcons[notification.type] || Bell;
          const colorClass = typeColors[notification.type] || "";

          return (
            <Card
              key={notification.id}
              className={cn(
                "transition-colors",
                !notification.read && "border-teal-200 dark:border-teal-800 bg-teal-50/30 dark:bg-teal-900/10"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shrink-0", colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="flex h-2 w-2 rounded-full bg-teal-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
