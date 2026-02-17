"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/utils";
import { SPECIALIZATION_LABELS } from "@/lib/constants";
import type { CleaningSpecialization } from "@/types/cleaner";

const CHART_COLORS = [
  "#0d9488", "#f59e0b", "#6366f1", "#ec4899", "#22c55e",
  "#ef4444", "#8b5cf6", "#06b6d4",
];

interface AnalyticsDashboardProps {
  stats: {
    totalRevenue: number;
    completedOrders: number;
    cancellationRate: number;
    averageRating: number;
    activeCleaners: number;
  };
  revenueData: { date: string; revenue: number; orders: number }[];
  ordersByType: { type: string; count: number; revenue: number; percentage: number }[];
  topCleaners: {
    cleanerId: string;
    cleanerName: string;
    completedOrders: number;
    revenue: number;
    rating: number;
    avatar?: string;
  }[];
}

export function AnalyticsDashboard({
  revenueData,
  ordersByType,
  topCleaners,
}: AnalyticsDashboardProps) {
  const formattedRevenue = revenueData.map((d) => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const formattedTypes = ordersByType.map((d) => ({
    ...d,
    name: SPECIALIZATION_LABELS[d.type as CleaningSpecialization] || d.type,
  }));

  return (
    <div className="space-y-6">
      {/* Revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue Over Time (30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedRevenue} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fill="url(#analyticsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Type - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={55}
                    dataKey="count"
                    nameKey="name"
                    paddingAngle={2}
                  >
                    {formattedTypes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, "Orders"]} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Cleaners - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Cleaners by Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topCleaners.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="cleanerName"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={110}
                  />
                  <Tooltip formatter={(value: number) => [value, "Orders"]} />
                  <Bar dataKey="completedOrders" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Cleaners Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCleaners.slice(0, 5).map((cleaner, i) => {
              const [first = "", last = ""] = cleaner.cleanerName.split(" ");
              return (
                <div key={cleaner.cleanerId} className="flex items-center gap-4 py-2">
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    #{i + 1}
                  </span>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-xs dark:bg-teal-900/50 dark:text-teal-300">
                      {getInitials(first, last)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cleaner.cleanerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {cleaner.completedOrders} orders &middot; {formatCurrency(cleaner.revenue)} revenue
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{cleaner.rating}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
