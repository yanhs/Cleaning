"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";
import { cn, formatCurrency, formatDate, formatTime } from "@/lib/utils";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  SPECIALIZATION_LABELS,
  SPECIALIZATION_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from "@/lib/constants";
import type { Order, OrderStatus, OrderPriority } from "@/types/order";

interface OrdersTableProps {
  orders: Order[];
}

type SortKey =
  | "orderNumber"
  | "clientName"
  | "type"
  | "scheduledDate"
  | "cleaner"
  | "status"
  | "priority"
  | "total";

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  assigned: 1,
  in_progress: 2,
  completed: 3,
  cancelled: 4,
};

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("scheduledDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let result = orders;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.clientName.toLowerCase().includes(q) ||
          o.address.address.toLowerCase().includes(q) ||
          (o.assignedCleanerName || "").toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter((o) => o.priority === priorityFilter);
    }

    result = [...result].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "orderNumber":
          return a.orderNumber.localeCompare(b.orderNumber) * dir;
        case "clientName":
          return a.clientName.localeCompare(b.clientName) * dir;
        case "type":
          return a.type.localeCompare(b.type) * dir;
        case "scheduledDate":
          return (new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()) * dir;
        case "cleaner":
          return (a.assignedCleanerName || "").localeCompare(b.assignedCleanerName || "") * dir;
        case "status":
          return ((STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99)) * dir;
        case "priority":
          return ((PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)) * dir;
        case "total":
          return (a.total - b.total) * dir;
        default:
          return 0;
      }
    });

    return result;
  }, [orders, search, statusFilter, priorityFilter, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).map(
              ([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {(Object.entries(PRIORITY_LABELS) as [OrderPriority, string][]).map(
              ([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} order{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 font-semibold" onClick={() => handleSort("orderNumber")}>
                  Order # <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 font-semibold" onClick={() => handleSort("clientName")}>
                  Client <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 font-semibold" onClick={() => handleSort("type")}>
                  Type <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 font-semibold" onClick={() => handleSort("scheduledDate")}>
                  Date & Time <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 font-semibold" onClick={() => handleSort("cleaner")}>
                  Cleaner <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 font-semibold" onClick={() => handleSort("status")}>
                  Status <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 font-semibold" onClick={() => handleSort("priority")}>
                  Priority <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="-ml-3 font-semibold" onClick={() => handleSort("total")}>
                  Total <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.slice(0, 50).map((order) => (
                <TableRow
                  key={order.id}
                  className="group cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                >
                  <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium truncate max-w-[180px]">{order.clientName}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{order.address.address}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", SPECIALIZATION_COLORS[order.type])}>
                      {SPECIALIZATION_LABELS[order.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{formatDate(order.scheduledDate)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(order.scheduledStartTime)} - {formatTime(order.scheduledEndTime)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.assignedCleanerName ? (
                      <span className="text-sm">{order.assignedCleanerName}</span>
                    ) : (
                      <span className="text-sm text-teal-600 font-medium">
                        Assign
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", ORDER_STATUS_COLORS[order.status])}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-[10px]", PRIORITY_COLORS[order.priority])}>
                      {PRIORITY_LABELS[order.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-semibold">{formatCurrency(order.total)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
