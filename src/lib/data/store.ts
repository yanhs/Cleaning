import {
  generateCleaners,
  generateClients,
  generateOrders,
  generateNotifications,
} from "./seed";
import type { Cleaner, CleanerFormData } from "@/types/cleaner";
import type { Client } from "@/types/client";
import type { Order, OrderFormData, OrderStatus } from "@/types/order";
import type { Notification } from "@/types/notification";
import type {
  PaginatedResponse,
  FilterConfig,
  SortConfig,
} from "@/types/common";

// ---------------------------------------------------------------------------
// Generate initial data
// ---------------------------------------------------------------------------
const initialCleaners = generateCleaners(30);
const initialClients = generateClients(50);
const initialOrders = generateOrders(150, initialCleaners, initialClients);
const initialNotifications = generateNotifications(
  30,
  initialOrders,
  initialCleaners
);

// ---------------------------------------------------------------------------
// In-memory store (mutable arrays)
// ---------------------------------------------------------------------------
let cleaners = [...initialCleaners];
let clients = [...initialClients];
let orders = [...initialOrders];
let notifications = [...initialNotifications];

// ---------------------------------------------------------------------------
// Generic filter, sort and pagination helpers
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters<T extends Record<string, any>>(
  data: T[],
  filters: FilterConfig[]
): T[] {
  return data.filter((item) =>
    filters.every((filter) => {
      const value = item[filter.field];
      if (value === undefined || value === null) return false;
      switch (filter.operator) {
        case "eq":
          return value === filter.value;
        case "neq":
          return value !== filter.value;
        case "gt":
          return (value as number) > (filter.value as number);
        case "lt":
          return (value as number) < (filter.value as number);
        case "gte":
          return (value as number) >= (filter.value as number);
        case "lte":
          return (value as number) <= (filter.value as number);
        case "contains":
          return String(value)
            .toLowerCase()
            .includes(String(filter.value).toLowerCase());
        case "in":
          return (
            Array.isArray(filter.value) &&
            filter.value.includes(String(value))
          );
        default:
          return true;
      }
    })
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySort<T extends Record<string, any>>(
  data: T[],
  sort?: SortConfig
): T[] {
  if (!sort) return data;
  return [...data].sort((a, b) => {
    const aVal = a[sort.field];
    const bVal = b[sort.field];
    const dir = sort.direction === "asc" ? 1 : -1;
    if (aVal instanceof Date && bVal instanceof Date)
      return (aVal.getTime() - bVal.getTime()) * dir;
    if (typeof aVal === "string")
      return aVal.localeCompare(String(bVal)) * dir;
    return ((Number(aVal) || 0) - (Number(bVal) || 0)) * dir;
  });
}

function paginate<T>(
  data: T[],
  page: number = 1,
  pageSize: number = 20
): PaginatedResponse<T> {
  const total = data.length;
  const start = (page - 1) * pageSize;
  return {
    data: data.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ---------------------------------------------------------------------------
// Cleaners CRUD
// ---------------------------------------------------------------------------
export const cleanerStore = {
  getAll(
    filters: FilterConfig[] = [],
    sort?: SortConfig,
    page = 1,
    pageSize = 20
  ): PaginatedResponse<Cleaner> {
    let result = applyFilters(cleaners, filters);
    result = applySort(result, sort) as Cleaner[];
    return paginate(result, page, pageSize);
  },

  getById(id: string): Cleaner | undefined {
    return cleaners.find((c) => c.id === id);
  },

  getAvailable(): Cleaner[] {
    return cleaners.filter(
      (c) => c.status === "active" && c.availability === "available"
    );
  },

  create(data: CleanerFormData): Cleaner {
    const newCleaner: Cleaner = {
      id: crypto.randomUUID(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${data.firstName}${data.lastName}`,
      status: "active",
      availability: "available",
      specializations: data.specializations,
      rating: 0,
      totalReviews: 0,
      yearsExperience: 0,
      certifications: [],
      backgroundCheckStatus: "pending",
      homeLocation: {
        latitude: 0,
        longitude: 0,
        address: "",
        city: "",
        state: "",
        zipCode: "",
        ...data.homeLocation,
      },
      serviceRadius: data.serviceRadius,
      zone: data.zone,
      hoursWorkedThisWeek: 0,
      hoursWorkedThisMonth: 0,
      hourlyRate: data.hourlyRate,
      overtimeRate: Math.round(data.hourlyRate * 1.5),
      completedOrders: 0,
      cancellationRate: 0,
      schedulePreference: {
        preferredDays: [],
        preferredStartTime: "08:00",
        preferredEndTime: "17:00",
        maxHoursPerWeek: 40,
        noGoZones: [],
        ...data.schedulePreference,
      },
      notes: data.notes || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    cleaners = [newCleaner, ...cleaners];
    return newCleaner;
  },

  update(id: string, data: Partial<Cleaner>): Cleaner | undefined {
    const index = cleaners.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    cleaners[index] = { ...cleaners[index], ...data, updatedAt: new Date() };
    return cleaners[index];
  },

  delete(id: string): boolean {
    const len = cleaners.length;
    cleaners = cleaners.filter((c) => c.id !== id);
    return cleaners.length < len;
  },

  getCount(): number {
    return cleaners.filter((c) => c.status === "active").length;
  },
};

// ---------------------------------------------------------------------------
// Orders CRUD
// ---------------------------------------------------------------------------
export const orderStore = {
  getAll(
    filters: FilterConfig[] = [],
    sort?: SortConfig,
    page = 1,
    pageSize = 20
  ): PaginatedResponse<Order> {
    let result = applyFilters(orders, filters);
    result = applySort(
      result,
      sort || { field: "scheduledDate", direction: "desc" }
    ) as Order[];
    return paginate(result, page, pageSize);
  },

  getById(id: string): Order | undefined {
    return orders.find((o) => o.id === id);
  },

  getRecent(limit: number = 5): Order[] {
    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);
  },

  getToday(): Order[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return orders.filter((o) => {
      const d = new Date(o.scheduledDate);
      return d >= today && d < tomorrow;
    });
  },

  create(data: OrderFormData): Order {
    const client = clients.find((c) => c.id === data.clientId);
    const cleaner = data.assignedCleanerId
      ? cleaners.find((c) => c.id === data.assignedCleanerId)
      : undefined;
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const tax = Math.round(subtotal * 0.08875);
    const orderNum = (orders.length + 1).toString().padStart(5, "0");

    const newOrder: Order = {
      id: crypto.randomUUID(),
      orderNumber: `CLN-${new Date().getFullYear()}-${orderNum}`,
      clientId: data.clientId,
      clientName: client?.name || "Unknown",
      clientPhone: client?.phone || "",
      address: {
        latitude: 0,
        longitude: 0,
        address: "",
        city: "",
        state: "",
        zipCode: "",
        ...data.address,
      },
      type: data.type,
      items: data.items,
      specialInstructions: data.specialInstructions,
      estimatedDuration: data.estimatedDuration,
      squareFootage: data.squareFootage,
      scheduledDate: data.scheduledDate,
      scheduledStartTime: data.scheduledStartTime,
      scheduledEndTime: data.scheduledEndTime,
      recurrence: data.recurrence,
      assignedCleanerId: data.assignedCleanerId,
      assignedCleanerName: cleaner
        ? `${cleaner.firstName} ${cleaner.lastName}`
        : undefined,
      previousCleanerIds: [],
      autoAssigned: false,
      status: data.assignedCleanerId ? "assigned" : "pending",
      priority: data.priority,
      subtotal,
      tax,
      discount: 0,
      total: subtotal + tax,
      paymentStatus: "unpaid",
      beforePhotos: [],
      afterPhotos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    orders = [newOrder, ...orders];
    return newOrder;
  },

  update(id: string, data: Partial<Order>): Order | undefined {
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return undefined;
    orders[index] = { ...orders[index], ...data, updatedAt: new Date() };
    return orders[index];
  },

  updateStatus(id: string, status: OrderStatus): Order | undefined {
    return this.update(id, { status });
  },

  getStats() {
    const completed = orders.filter((o) => o.status === "completed");
    const cancelled = orders.filter((o) => o.status === "cancelled");
    const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0);
    const ratedOrders = completed.filter((o) => o.clientRating);
    const avgRating =
      ratedOrders.length > 0
        ? ratedOrders.reduce((sum, o) => sum + (o.clientRating || 0), 0) /
          ratedOrders.length
        : 0;

    return {
      totalRevenue,
      completedOrders: completed.length,
      cancelledOrders: cancelled.length,
      cancellationRate:
        orders.length > 0
          ? parseFloat(
              ((cancelled.length / orders.length) * 100).toFixed(1)
            )
          : 0,
      averageRating: parseFloat(avgRating.toFixed(1)),
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      activeOrders: orders.filter((o) =>
        ["assigned", "confirmed", "in_progress"].includes(o.status)
      ).length,
    };
  },
};

// ---------------------------------------------------------------------------
// Clients CRUD
// ---------------------------------------------------------------------------
export const clientStore = {
  getAll(
    filters: FilterConfig[] = [],
    sort?: SortConfig,
    page = 1,
    pageSize = 50
  ): PaginatedResponse<Client> {
    let result = applyFilters(clients, filters);
    result = applySort(result, sort) as Client[];
    return paginate(result, page, pageSize);
  },

  getById(id: string): Client | undefined {
    return clients.find((c) => c.id === id);
  },

  search(query: string): Client[] {
    const q = query.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  },
};

// ---------------------------------------------------------------------------
// Notifications CRUD
// ---------------------------------------------------------------------------
export const notificationStore = {
  getAll(page = 1, pageSize = 20): PaginatedResponse<Notification> {
    const sorted = [...notifications].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return paginate(sorted, page, pageSize);
  },

  getUnreadCount(): number {
    return notifications.filter((n) => !n.read).length;
  },

  markAsRead(id: string): void {
    const notification = notifications.find((n) => n.id === id);
    if (notification) notification.read = true;
  },

  markAllAsRead(): void {
    notifications.forEach((n) => (n.read = true));
  },

  add(
    notification: Omit<Notification, "id" | "createdAt" | "updatedAt">
  ): Notification {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    notifications = [newNotification, ...notifications];
    return newNotification;
  },
};

// ---------------------------------------------------------------------------
// Analytics data generator
// ---------------------------------------------------------------------------
export const analyticsStore = {
  getRevenueOverTime(
    days: number = 30
  ): { date: string; revenue: number; orders: number }[] {
    const result: { date: string; revenue: number; orders: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayOrders = orders.filter((o) => {
        const d = new Date(o.scheduledDate);
        return (
          d.toISOString().split("T")[0] === dateStr &&
          o.status === "completed"
        );
      });
      result.push({
        date: dateStr,
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
      });
    }
    return result;
  },

  getOrdersByType(): {
    type: string;
    count: number;
    revenue: number;
    percentage: number;
  }[] {
    const completed = orders.filter((o) => o.status === "completed");
    const typeMap = new Map<string, { count: number; revenue: number }>();
    completed.forEach((o) => {
      const existing = typeMap.get(o.type) || { count: 0, revenue: 0 };
      typeMap.set(o.type, {
        count: existing.count + 1,
        revenue: existing.revenue + o.total,
      });
    });
    const total = completed.length || 1;
    return Array.from(typeMap.entries())
      .map(([type, data]) => ({
        type,
        count: data.count,
        revenue: data.revenue,
        percentage: parseFloat(((data.count / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.count - a.count);
  },

  getTopCleaners(
    limit: number = 10
  ): {
    cleanerId: string;
    cleanerName: string;
    completedOrders: number;
    revenue: number;
    rating: number;
    avatar?: string;
  }[] {
    const completed = orders.filter(
      (o) => o.status === "completed" && o.assignedCleanerId
    );
    const cleanerMap = new Map<
      string,
      { orders: number; revenue: number }
    >();
    completed.forEach((o) => {
      const existing = cleanerMap.get(o.assignedCleanerId!) || {
        orders: 0,
        revenue: 0,
      };
      cleanerMap.set(o.assignedCleanerId!, {
        orders: existing.orders + 1,
        revenue: existing.revenue + o.total,
      });
    });
    return Array.from(cleanerMap.entries())
      .map(([id, data]) => {
        const cleaner = cleaners.find((c) => c.id === id);
        return {
          cleanerId: id,
          cleanerName: cleaner
            ? `${cleaner.firstName} ${cleaner.lastName}`
            : "Unknown",
          completedOrders: data.orders,
          revenue: data.revenue,
          rating: cleaner?.rating || 0,
          avatar: cleaner?.avatar,
        };
      })
      .sort((a, b) => b.completedOrders - a.completedOrders)
      .slice(0, limit);
  },

  getDashboardStats() {
    const stats = orderStore.getStats();
    return {
      totalRevenue: stats.totalRevenue,
      revenueChange: 12.5,
      completedOrders: stats.completedOrders,
      completedOrdersChange: 8.2,
      cancellationRate: stats.cancellationRate,
      cancellationRateChange: -2.1,
      averageRating: stats.averageRating,
      averageRatingChange: 0.3,
      activeCleaners: cleanerStore.getCount(),
      activeCleanersChange: 5.0,
      pendingOrders: stats.pendingOrders,
    };
  },
};
