import type { CleanerAvailability, CleaningSpecialization } from "@/types/cleaner";
import type { OrderStatus, OrderPriority } from "@/types/order";

export const SPECIALIZATION_LABELS: Record<CleaningSpecialization, string> = {
  residential: "Residential",
  commercial: "Commercial",
  deep_clean: "Deep Clean",
  move_in_out: "Move In/Out",
  post_construction: "Post Construction",
  carpet: "Carpet",
  window: "Window",
  sanitization: "Sanitization",
};

export const SPECIALIZATION_COLORS: Record<CleaningSpecialization, string> = {
  residential: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  commercial: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  deep_clean: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  move_in_out: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  post_construction: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  carpet: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  window: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  sanitization: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export const AVAILABILITY_LABELS: Record<CleanerAvailability, string> = {
  available: "Available",
  on_job: "On Job",
  unavailable: "Unavailable",
  day_off: "Day Off",
  sick_leave: "Sick Leave",
};

export const AVAILABILITY_COLORS: Record<CleanerAvailability, string> = {
  available: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  on_job: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  unavailable: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  day_off: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  sick_leave: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  assigned: "Assigned",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
  reassigning: "Reassigning",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  assigned: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  confirmed: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  in_progress: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  no_show: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  reassigning: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export const PRIORITY_LABELS: Record<OrderPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_COLORS: Record<OrderPriority, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
  normal: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export const ZONES = [
  "Downtown",
  "North Side",
  "South Side",
  "East End",
  "West End",
  "Suburbs North",
  "Suburbs South",
  "Midtown",
  "Uptown",
  "Waterfront",
];

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  partial: "Partial",
  paid: "Paid",
  refunded: "Refunded",
};
