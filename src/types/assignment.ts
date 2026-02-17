import { ID } from "./common";

export interface AssignmentRule {
  id: ID;
  name: string;
  enabled: boolean;
  priority: number;
  weight: number;
  type:
    | "proximity"
    | "availability"
    | "specialization"
    | "rating"
    | "overtime_prevention"
    | "client_preference"
    | "workload_balance"
    | "cost_optimization";
}

export interface AssignmentCandidate {
  cleanerId: ID;
  cleanerName: string;
  score: number;
  distance: number;
  currentHoursThisWeek: number;
  hourlyRate: number;
  rating: number;
  specializationMatch: boolean;
  isPreferred: boolean;
  reasons: string[];
}

export interface AssignmentResult {
  orderId: ID;
  selectedCleanerId: ID;
  candidates: AssignmentCandidate[];
  assignmentMethod: "auto" | "manual";
  timestamp: Date;
  notificationsSent: {
    channel: string;
    cleanerId: ID;
    status: "sent" | "delivered" | "responded" | "failed";
    response?: "accepted" | "declined" | "no_response";
  }[];
}

export interface AssignmentEngineConfig {
  enabled: boolean;
  maxCandidates: number;
  responseTimeoutMinutes: number;
  autoConfirm: boolean;
  notifyOnFailure: boolean;
  rules: AssignmentRule[];
}

export interface AssignmentLog {
  id: ID;
  orderId: ID;
  orderNumber: string;
  triggerReason: string;
  candidatesContacted: number;
  candidatesResponded: number;
  selectedCleanerName?: string;
  success: boolean;
  timestamp: Date;
  durationSeconds: number;
}
