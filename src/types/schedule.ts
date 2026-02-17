import { ID } from "./common";
import { OrderStatus } from "./order";
import { CleaningSpecialization } from "./cleaner";

export interface CalendarEvent {
  id: ID;
  title: string;
  start: Date;
  end: Date;
  orderId: ID;
  cleanerId: ID;
  cleanerName: string;
  clientName: string;
  address: string;
  type: CleaningSpecialization;
  status: OrderStatus;
  color: string;
}

export type CalendarViewMode = "day" | "week" | "month";
