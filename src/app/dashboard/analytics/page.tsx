import { PageHeader } from "@/components/shared/page-header";
import { AnalyticsDashboard } from "@/components/dashboard/analytics/analytics-dashboard";
import { analyticsStore } from "@/lib/services/db-service";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const stats = await analyticsStore.getDashboardStats();
  const revenueData = await analyticsStore.getRevenueOverTime(30);
  const ordersByType = await analyticsStore.getOrdersByType();
  const topCleaners = await analyticsStore.getTopCleaners(10);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Insights into your cleaning operations performance."
      />
      <AnalyticsDashboard
        stats={stats}
        revenueData={revenueData}
        ordersByType={ordersByType}
        topCleaners={topCleaners}
      />
    </div>
  );
}
