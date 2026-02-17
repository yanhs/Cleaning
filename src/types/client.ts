import { ID, Timestamps, GeoLocation } from "./common";

export type ClientType = "residential" | "commercial";

export interface Client extends Timestamps {
  id: ID;
  name: string;
  type: ClientType;
  contactPerson: string;
  email: string;
  phone: string;
  address: GeoLocation;
  preferredCleanerId?: ID;
  notes: string;
  totalOrders: number;
  averageOrderValue: number;
  lastServiceDate?: Date;
}
