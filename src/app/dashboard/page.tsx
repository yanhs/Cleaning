import { PageHeader } from "@/components/shared/page-header";
import { StatsCards } from "@/components/dashboard/overview/stats-cards";
import { RevenueChart } from "@/components/dashboard/overview/revenue-chart";
import { RecentOrders } from "@/components/dashboard/overview/recent-orders";
import { TodaySchedule } from "@/components/dashboard/overview/today-schedule";
import { analyticsStore, orderStore } from "@/lib/services/db-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await analyticsStore.getDashboardStats();
  const revenueData = await analyticsStore.getRevenueOverTime(30);
  const recentOrders = await orderStore.getRecent(5);
  const todayOrders = await orderStore.getToday();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your cleaning operations."
      />
      <StatsCards stats={stats} />
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={revenueData} />
        <TodaySchedule orders={todayOrders} />
      </div>
      <RecentOrders orders={recentOrders} />
    </div>
  );
}
