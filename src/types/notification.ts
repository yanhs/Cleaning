import { ID, Timestamps } from "./common";

export type NotificationType =
  | "order_assigned"
  | "order_cancelled"
  | "order_completed"
  | "cleaner_cancelled"
  | "replacement_found"
  | "replacement_failed"
  | "shift_reminder"
  | "rating_received"
  | "system_alert";

export type NotificationChannel = "in_app" | "sms" | "email" | "push";

export interface Notification extends Timestamps {
  id: ID;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  channels: NotificationChannel[];
  relatedOrderId?: ID;
  relatedCleanerId?: ID;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}
