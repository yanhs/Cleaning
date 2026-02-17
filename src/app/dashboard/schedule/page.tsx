import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CalendarDays } from "lucide-react";
import { cn, formatDate, formatTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, SPECIALIZATION_LABELS } from "@/lib/constants";
import { orderStore } from "@/lib/services/db-service";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const { data: allOrders } = await orderStore.getAll([], undefined, 1, 200);

  // Group orders by date
  const grouped = allOrders
    .filter((o) => ["assigned", "confirmed", "in_progress", "pending"].includes(o.status))
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .reduce((acc, order) => {
      const dateKey = new Date(order.scheduledDate).toISOString().split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(order);
      return acc;
    }, {} as Record<string, typeof allOrders>);

  const dateEntries = Object.entries(grouped).slice(0, 14);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule"
        description="View upcoming cleaning jobs organized by date."
      />

      {dateEntries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No upcoming jobs scheduled.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {dateEntries.map(([dateKey, orders]) => (
            <Card key={dateKey}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-teal-600" />
                  {formatDate(dateKey)}
                  <Badge variant="outline" className="text-[10px] ml-2">
                    {orders.length} job{orders.length !== 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders
                    .sort((a, b) => a.scheduledStartTime.localeCompare(b.scheduledStartTime))
                    .map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center gap-4 py-2 px-3 rounded-lg border bg-muted/30"
                      >
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground w-32 shrink-0">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(order.scheduledStartTime)} - {formatTime(order.scheduledEndTime)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{order.clientName}</p>
                          <p className="text-xs text-muted-foreground truncate">{order.address.address}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {SPECIALIZATION_LABELS[order.type]}
                        </Badge>
                        <div className="text-sm text-right shrink-0 w-28">
                          <p className="font-medium">{order.assignedCleanerName || "Unassigned"}</p>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] shrink-0", ORDER_STATUS_COLORS[order.status])}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
