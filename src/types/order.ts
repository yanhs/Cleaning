import { ID, Timestamps, GeoLocation } from "./common";
import { CleaningSpecialization } from "./cleaner";

export type OrderStatus =
  | "pending"
  | "assigned"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"
  | "reassigning";

export type OrderPriority = "low" | "normal" | "high" | "urgent";

export type RecurrencePattern = "one_time" | "weekly" | "biweekly" | "monthly";

export interface OrderItem {
  service: CleaningSpecialization;
  quantity: number;
  unitPrice: number;
}

export interface Order extends Timestamps {
  id: ID;
  orderNumber: string;
  clientId: ID;
  clientName: string;
  clientPhone: string;
  address: GeoLocation;
  type: CleaningSpecialization;
  items: OrderItem[];
  specialInstructions?: string;
  estimatedDuration: number;
  squareFootage?: number;
  scheduledDate: Date;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  recurrence: RecurrencePattern;
  assignedCleanerId?: ID;
  assignedCleanerName?: string;
  previousCleanerIds: ID[];
  autoAssigned: boolean;
  status: OrderStatus;
  priority: OrderPriority;
  cancellationReason?: string;
  cancellationTime?: Date;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: "unpaid" | "partial" | "paid" | "refunded";
  clientRating?: number;
  clientFeedback?: string;
  cleanerNotes?: string;
  beforePhotos: string[];
  afterPhotos: string[];
}

export interface OrderFormData {
  clientId: ID;
  type: CleaningSpecialization;
  items: OrderItem[];
  address: Partial<GeoLocation>;
  scheduledDate: Date;
  scheduledStartTime: string;
  scheduledEndTime: string;
  estimatedDuration: number;
  squareFootage?: number;
  specialInstructions?: string;
  priority: OrderPriority;
  recurrence: RecurrencePattern;
  assignedCleanerId?: ID;
}
