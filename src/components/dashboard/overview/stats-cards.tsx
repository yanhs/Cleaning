"use client";

import {
  DollarSign,
  ClipboardCheck,
  XCircle,
  Star,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  iconBg,
}: StatCardProps) {
  const isPositive = change >= 0;
  const isGood = title.includes("Cancellation") ? !isPositive : isPositive;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-xs font-medium",
                isGood
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{Math.abs(change)}% vs last month</span>
            </div>
          </div>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              iconBg
            )}
          >
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats: {
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
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards: StatCardProps[] = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: stats.revenueChange,
      icon: DollarSign,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders.toString(),
      change: stats.completedOrdersChange,
      icon: ClipboardCheck,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Cancellation Rate",
      value: `${stats.cancellationRate}%`,
      change: stats.cancellationRateChange,
      icon: XCircle,
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-100 dark:bg-rose-900/30",
    },
    {
      title: "Average Rating",
      value: stats.averageRating.toFixed(1),
      change: stats.averageRatingChange,
      icon: Star,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      title: "Active Cleaners",
      value: stats.activeCleaners.toString(),
      change: stats.activeCleanersChange,
      icon: Users,
      iconColor: "text-teal-600 dark:text-teal-400",
      iconBg: "bg-teal-100 dark:bg-teal-900/30",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
