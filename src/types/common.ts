export type ID = string;
export type Status = "active" | "inactive" | "suspended";

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SortConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface FilterConfig {
  field: string;
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains" | "in";
  value: string | number | string[];
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface DateRange {
  from: Date;
  to: Date;
}
