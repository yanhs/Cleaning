import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import { cn, formatTime, getInitials } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import type { Order } from "@/types/order";

interface TodayScheduleProps {
  orders: Order[];
}

export function TodaySchedule({ orders }: TodayScheduleProps) {
  const sorted = [...orders].sort((a, b) =>
    a.scheduledStartTime.localeCompare(b.scheduledStartTime)
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Today&apos;s Schedule
          </CardTitle>
          <Link
            href="/dashboard/orders"
            className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium"
          >
            All orders
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No jobs scheduled for today.
          </p>
        ) : (
          <div className="space-y-3">
            {sorted.slice(0, 6).map((order) => {
              const [firstName = "?", lastName = "?"] = (
                order.assignedCleanerName || "? ?"
              ).split(" ");
              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors -mx-3"
                >
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-20 shrink-0">
                    <Clock className="h-3 w-3" />
                    {formatTime(order.scheduledStartTime)}
                  </div>
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="text-[10px] bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                      {getInitials(firstName, lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {order.clientName}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {order.address.address}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] shrink-0",
                      ORDER_STATUS_COLORS[order.status]
                    )}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
