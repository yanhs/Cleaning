import { DateRange } from "./common";

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  completedOrders: number;
  completedOrdersChange: number;
  cancellationRate: number;
  cancellationRateChange: number;
  averageRating: number;
  averageRatingChange: number;
  activeCleaners: number;
  activeCleanersChange: number;
  pendingOrders: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrdersByTypeData {
  type: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface TopCleanerData {
  cleanerId: string;
  cleanerName: string;
  completedOrders: number;
  revenue: number;
  rating: number;
  avatar?: string;
}

export interface AnalyticsDashboard {
  stats: DashboardStats;
  revenueOverTime: RevenueDataPoint[];
  ordersByType: OrdersByTypeData[];
  topCleaners: TopCleanerData[];
  dateRange: DateRange;
}
