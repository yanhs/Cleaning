import { ID, Timestamps, GeoLocation, Status } from "./common";

export type CleanerAvailability =
  | "available"
  | "on_job"
  | "unavailable"
  | "day_off"
  | "sick_leave";

export type CleaningSpecialization =
  | "residential"
  | "commercial"
  | "deep_clean"
  | "move_in_out"
  | "post_construction"
  | "carpet"
  | "window"
  | "sanitization";

export interface CleanerSchedulePreference {
  preferredDays: number[];
  preferredStartTime: string;
  preferredEndTime: string;
  maxHoursPerWeek: number;
  noGoZones: string[];
}

export interface Cleaner extends Timestamps {
  id: ID;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  status: Status;
  availability: CleanerAvailability;
  specializations: CleaningSpecialization[];
  rating: number;
  totalReviews: number;
  yearsExperience: number;
  certifications: string[];
  backgroundCheckDate?: Date;
  backgroundCheckStatus: "cleared" | "pending" | "expired";
  homeLocation: GeoLocation;
  serviceRadius: number;
  currentLocation?: GeoLocation;
  zone: string;
  hoursWorkedThisWeek: number;
  hoursWorkedThisMonth: number;
  hourlyRate: number;
  overtimeRate: number;
  completedOrders: number;
  cancellationRate: number;
  schedulePreference: CleanerSchedulePreference;
  notes: string;
  currentOrderId?: ID;
  lastOrderDate?: Date;
}

export interface CleanerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specializations: CleaningSpecialization[];
  hourlyRate: number;
  zone: string;
  homeLocation: Partial<GeoLocation>;
  serviceRadius: number;
  schedulePreference: Partial<CleanerSchedulePreference>;
  notes?: string;
}
