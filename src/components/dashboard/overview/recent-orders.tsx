import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  SPECIALIZATION_LABELS,
} from "@/lib/constants";
import type { Order } from "@/types/order";

interface RecentOrdersProps {
  orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Recent Orders
          </CardTitle>
          <Link
            href="/dashboard/orders"
            className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors -mx-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {order.orderNumber}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] px-1.5 py-0",
                      ORDER_STATUS_COLORS[order.status]
                    )}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {order.clientName} &middot;{" "}
                  {SPECIALIZATION_LABELS[order.type]}
                </p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-semibold">
                  {formatCurrency(order.total)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatDate(order.scheduledDate)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
