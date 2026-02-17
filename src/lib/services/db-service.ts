import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
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
// Helper: Convert FilterConfig[] to Prisma `where` clause
// ---------------------------------------------------------------------------
function buildPrismaWhere(filters: FilterConfig[]): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  for (const filter of filters) {
    const { field, operator, value } = filter;

    switch (operator) {
      case "eq":
        where[field] = { equals: value };
        break;
      case "neq":
        where[field] = { not: value };
        break;
      case "gt":
        where[field] = { gt: value };
        break;
      case "lt":
        where[field] = { lt: value };
        break;
      case "gte":
        where[field] = { gte: value };
        break;
      case "lte":
        where[field] = { lte: value };
        break;
      case "contains":
        where[field] = {
          contains: String(value),
          mode: "insensitive" as const,
        };
        break;
      case "in":
        where[field] = { in: Array.isArray(value) ? value : [value] };
        break;
      default:
        break;
    }
  }

  return where;
}

// ---------------------------------------------------------------------------
// Helper: Convert SortConfig to Prisma `orderBy`
// ---------------------------------------------------------------------------
function buildPrismaOrderBy(
  sort?: SortConfig
): Record<string, "asc" | "desc"> | undefined {
  if (!sort) return undefined;
  return { [sort.field]: sort.direction };
}

// ---------------------------------------------------------------------------
// Helper: Build paginated response
// ---------------------------------------------------------------------------
function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ---------------------------------------------------------------------------
// Transform: Prisma Cleaner row -> UI Cleaner type (nested objects)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformCleaner(row: any): Cleaner {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    avatar: row.avatar ?? undefined,
    status: row.status,
    availability: row.availability,
    specializations: row.specializations,
    rating: row.rating,
    totalReviews: row.totalReviews,
    yearsExperience: row.yearsExperience,
    certifications: row.certifications,
    backgroundCheckDate: row.backgroundCheckDate ?? undefined,
    backgroundCheckStatus: row.backgroundCheckStatus,
    homeLocation: {
      latitude: row.homeLatitude ?? 0,
      longitude: row.homeLongitude ?? 0,
      address: row.homeAddress ?? "",
      city: row.homeCity ?? "",
      state: row.homeState ?? "",
      zipCode: row.homeZipCode ?? "",
    },
    serviceRadius: row.serviceRadius,
    currentLocation: row.currentLatitude != null
      ? {
          latitude: row.currentLatitude,
          longitude: row.currentLongitude ?? 0,
          address: "",
          city: "",
          state: "",
          zipCode: "",
        }
      : undefined,
    zone: row.zone,
    hoursWorkedThisWeek: row.hoursWorkedThisWeek,
    hoursWorkedThisMonth: row.hoursWorkedThisMonth,
    hourlyRate: row.hourlyRate,
    overtimeRate: row.overtimeRate,
    completedOrders: row.completedOrders,
    cancellationRate: row.cancellationRate,
    schedulePreference: {
      preferredDays: row.preferredDays,
      preferredStartTime: row.preferredStartTime,
      preferredEndTime: row.preferredEndTime,
      maxHoursPerWeek: row.maxHoursPerWeek,
      noGoZones: row.noGoZones,
    },
    notes: row.notes,
    lastOrderDate: row.lastOrderDate ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Transform: Prisma Client row -> UI Client type (nested address)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    contactPerson: row.contactPerson,
    email: row.email,
    phone: row.phone,
    address: {
      latitude: row.latitude ?? 0,
      longitude: row.longitude ?? 0,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zipCode,
    },
    preferredCleanerId: row.preferredCleanerId ?? undefined,
    notes: row.notes,
    totalOrders: row.totalOrders,
    averageOrderValue: row.averageOrderValue,
    lastServiceDate: row.lastServiceDate ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Transform: Prisma Order row -> UI Order type (nested address, items)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformOrder(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    clientId: row.clientId,
    clientName: row.clientName,
    clientPhone: row.clientPhone,
    address: {
      latitude: row.latitude ?? 0,
      longitude: row.longitude ?? 0,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zipCode,
    },
    type: row.type,
    items: (row.items ?? []) as Order["items"],
    specialInstructions: row.specialInstructions ?? undefined,
    estimatedDuration: row.estimatedDuration,
    squareFootage: row.squareFootage ?? undefined,
    scheduledDate: row.scheduledDate,
    scheduledStartTime: row.scheduledStartTime,
    scheduledEndTime: row.scheduledEndTime,
    actualStartTime: row.actualStartTime ?? undefined,
    actualEndTime: row.actualEndTime ?? undefined,
    recurrence: row.recurrence,
    assignedCleanerId: row.assignedCleanerId ?? undefined,
    assignedCleanerName: row.assignedCleanerName ?? undefined,
    previousCleanerIds: row.previousCleanerIds,
    autoAssigned: row.autoAssigned,
    status: row.status,
    priority: row.priority,
    cancellationReason: row.cancellationReason ?? undefined,
    cancellationTime: row.cancellationTime ?? undefined,
    subtotal: row.subtotal,
    tax: row.tax,
    discount: row.discount,
    total: row.total,
    paymentStatus: row.paymentStatus,
    clientRating: row.clientRating ?? undefined,
    clientFeedback: row.clientFeedback ?? undefined,
    cleanerNotes: row.cleanerNotes ?? undefined,
    beforePhotos: row.beforePhotos,
    afterPhotos: row.afterPhotos,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Transform: Prisma Notification row -> UI Notification type
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformNotification(row: any): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    read: row.read,
    channels: row.channels,
    relatedOrderId: row.relatedOrderId ?? undefined,
    relatedCleanerId: row.relatedCleanerId ?? undefined,
    actionUrl: row.actionUrl ?? undefined,
    metadata: (row.metadata as Record<string, unknown>) ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Helper: Flatten nested Cleaner data for Prisma create/update
// ---------------------------------------------------------------------------
function flattenCleanerData(
  data: Partial<Cleaner> | CleanerFormData
): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const input = data as any;
  const flat: Record<string, unknown> = {};

  // Copy simple top-level fields (skip nested objects)
  const skipFields = new Set([
    "homeLocation",
    "currentLocation",
    "schedulePreference",
    "id",
    "createdAt",
    "updatedAt",
  ]);

  for (const [key, value] of Object.entries(input)) {
    if (!skipFields.has(key) && value !== undefined) {
      flat[key] = value;
    }
  }

  // Flatten homeLocation
  if (input.homeLocation) {
    if (input.homeLocation.latitude !== undefined)
      flat.homeLatitude = input.homeLocation.latitude;
    if (input.homeLocation.longitude !== undefined)
      flat.homeLongitude = input.homeLocation.longitude;
    if (input.homeLocation.address !== undefined)
      flat.homeAddress = input.homeLocation.address;
    if (input.homeLocation.city !== undefined)
      flat.homeCity = input.homeLocation.city;
    if (input.homeLocation.state !== undefined)
      flat.homeState = input.homeLocation.state;
    if (input.homeLocation.zipCode !== undefined)
      flat.homeZipCode = input.homeLocation.zipCode;
  }

  // Flatten currentLocation
  if (input.currentLocation) {
    if (input.currentLocation.latitude !== undefined)
      flat.currentLatitude = input.currentLocation.latitude;
    if (input.currentLocation.longitude !== undefined)
      flat.currentLongitude = input.currentLocation.longitude;
  }

  // Flatten schedulePreference
  if (input.schedulePreference) {
    if (input.schedulePreference.preferredDays !== undefined)
      flat.preferredDays = input.schedulePreference.preferredDays;
    if (input.schedulePreference.preferredStartTime !== undefined)
      flat.preferredStartTime = input.schedulePreference.preferredStartTime;
    if (input.schedulePreference.preferredEndTime !== undefined)
      flat.preferredEndTime = input.schedulePreference.preferredEndTime;
    if (input.schedulePreference.maxHoursPerWeek !== undefined)
      flat.maxHoursPerWeek = input.schedulePreference.maxHoursPerWeek;
    if (input.schedulePreference.noGoZones !== undefined)
      flat.noGoZones = input.schedulePreference.noGoZones;
  }

  return flat;
}

// ---------------------------------------------------------------------------
// Helper: Flatten nested Order data for Prisma create/update
// ---------------------------------------------------------------------------
function flattenOrderData(
  data: Partial<Order> | OrderFormData
): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const input = data as any;
  const flat: Record<string, unknown> = {};

  const skipFields = new Set(["address", "id", "createdAt", "updatedAt"]);

  for (const [key, value] of Object.entries(input)) {
    if (!skipFields.has(key) && value !== undefined) {
      flat[key] = value;
    }
  }

  // Flatten address
  if (input.address) {
    if (input.address.latitude !== undefined)
      flat.latitude = input.address.latitude;
    if (input.address.longitude !== undefined)
      flat.longitude = input.address.longitude;
    if (input.address.address !== undefined) flat.address = input.address.address;
    if (input.address.city !== undefined) flat.city = input.address.city;
    if (input.address.state !== undefined) flat.state = input.address.state;
    if (input.address.zipCode !== undefined)
      flat.zipCode = input.address.zipCode;
  }

  return flat;
}

// ---------------------------------------------------------------------------
// Cleaners CRUD
// ---------------------------------------------------------------------------
export const cleanerStore = {
  async getAll(
    filters: FilterConfig[] = [],
    sort?: SortConfig,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Cleaner>> {
    try {
      const where = buildPrismaWhere(filters) as Prisma.CleanerWhereInput;
      const orderBy = buildPrismaOrderBy(sort);

      const [rows, total] = await Promise.all([
        prisma.cleaner.findMany({
          where,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.cleaner.count({ where }),
      ]);

      return buildPaginatedResponse(
        rows.map(transformCleaner),
        total,
        page,
        pageSize
      );
    } catch (error) {
      console.error("cleanerStore.getAll error:", error);
      return buildPaginatedResponse<Cleaner>([], 0, page, pageSize);
    }
  },

  async getById(id: string): Promise<Cleaner | undefined> {
    try {
      const row = await prisma.cleaner.findUnique({ where: { id } });
      return row ? transformCleaner(row) : undefined;
    } catch (error) {
      console.error("cleanerStore.getById error:", error);
      return undefined;
    }
  },

  async getAvailable(): Promise<Cleaner[]> {
    try {
      const rows = await prisma.cleaner.findMany({
        where: {
          status: "active",
          availability: "available",
        },
      });
      return rows.map(transformCleaner);
    } catch (error) {
      console.error("cleanerStore.getAvailable error:", error);
      return [];
    }
  },

  async create(data: CleanerFormData): Promise<Cleaner> {
    try {
      const flat = flattenCleanerData(data);

      const row = await prisma.cleaner.create({
        data: {
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
          homeLatitude: (flat.homeLatitude as number) ?? 0,
          homeLongitude: (flat.homeLongitude as number) ?? 0,
          homeAddress: (flat.homeAddress as string) ?? "",
          homeCity: (flat.homeCity as string) ?? "",
          homeState: (flat.homeState as string) ?? "",
          homeZipCode: (flat.homeZipCode as string) ?? "",
          serviceRadius: data.serviceRadius,
          zone: data.zone,
          hoursWorkedThisWeek: 0,
          hoursWorkedThisMonth: 0,
          hourlyRate: data.hourlyRate,
          overtimeRate: Math.round(data.hourlyRate * 1.5),
          completedOrders: 0,
          cancellationRate: 0,
          preferredDays:
            (flat.preferredDays as number[]) ?? [1, 2, 3, 4, 5],
          preferredStartTime:
            (flat.preferredStartTime as string) ?? "08:00",
          preferredEndTime:
            (flat.preferredEndTime as string) ?? "17:00",
          maxHoursPerWeek: (flat.maxHoursPerWeek as number) ?? 40,
          noGoZones: (flat.noGoZones as string[]) ?? [],
          notes: data.notes ?? "",
        },
      });

      return transformCleaner(row);
    } catch (error) {
      console.error("cleanerStore.create error:", error);
      throw error;
    }
  },

  async update(
    id: string,
    data: Partial<Cleaner>
  ): Promise<Cleaner | undefined> {
    try {
      const flat = flattenCleanerData(data);

      const row = await prisma.cleaner.update({
        where: { id },
        data: flat as Prisma.CleanerUpdateInput,
      });

      return transformCleaner(row);
    } catch (error) {
      console.error("cleanerStore.update error:", error);
      return undefined;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.cleaner.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error("cleanerStore.delete error:", error);
      return false;
    }
  },

  async getCount(): Promise<number> {
    try {
      return await prisma.cleaner.count({
        where: { status: "active" },
      });
    } catch (error) {
      console.error("cleanerStore.getCount error:", error);
      return 0;
    }
  },
};

// ---------------------------------------------------------------------------
// Orders CRUD
// ---------------------------------------------------------------------------
export const orderStore = {
  async getAll(
    filters: FilterConfig[] = [],
    sort?: SortConfig,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Order>> {
    try {
      const where = buildPrismaWhere(filters) as Prisma.OrderWhereInput;
      const orderBy =
        buildPrismaOrderBy(sort) ?? ({ scheduledDate: "desc" } as const);

      const [rows, total] = await Promise.all([
        prisma.order.findMany({
          where,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.order.count({ where }),
      ]);

      return buildPaginatedResponse(
        rows.map(transformOrder),
        total,
        page,
        pageSize
      );
    } catch (error) {
      console.error("orderStore.getAll error:", error);
      return buildPaginatedResponse<Order>([], 0, page, pageSize);
    }
  },

  async getById(id: string): Promise<Order | undefined> {
    try {
      const row = await prisma.order.findUnique({ where: { id } });
      return row ? transformOrder(row) : undefined;
    } catch (error) {
      console.error("orderStore.getById error:", error);
      return undefined;
    }
  },

  async getRecent(limit: number = 5): Promise<Order[]> {
    try {
      const rows = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return rows.map(transformOrder);
    } catch (error) {
      console.error("orderStore.getRecent error:", error);
      return [];
    }
  },

  async getToday(): Promise<Order[]> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const rows = await prisma.order.findMany({
        where: {
          scheduledDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        orderBy: { scheduledStartTime: "asc" },
      });

      return rows.map(transformOrder);
    } catch (error) {
      console.error("orderStore.getToday error:", error);
      return [];
    }
  },

  async create(data: OrderFormData): Promise<Order> {
    try {
      // Look up client and (optionally) cleaner for denormalized fields
      const client = await prisma.client.findUnique({
        where: { id: data.clientId },
      });
      const cleaner = data.assignedCleanerId
        ? await prisma.cleaner.findUnique({
            where: { id: data.assignedCleanerId },
          })
        : null;

      const subtotal = data.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      const tax = Math.round(subtotal * 0.08875);

      // Get next order number
      const orderCount = await prisma.order.count();
      const orderNum = (orderCount + 1).toString().padStart(5, "0");

      const flat = flattenOrderData(data);

      const row = await prisma.order.create({
        data: {
          orderNumber: `CLN-${new Date().getFullYear()}-${orderNum}`,
          clientId: data.clientId,
          clientName: client?.name ?? "Unknown",
          clientPhone: client?.phone ?? "",
          latitude: (flat.latitude as number) ?? 0,
          longitude: (flat.longitude as number) ?? 0,
          address: (flat.address as string) ?? "",
          city: (flat.city as string) ?? "",
          state: (flat.state as string) ?? "",
          zipCode: (flat.zipCode as string) ?? "",
          type: data.type,
          items: data.items as unknown as Prisma.InputJsonValue,
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
            : null,
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
        },
      });

      return transformOrder(row);
    } catch (error) {
      console.error("orderStore.create error:", error);
      throw error;
    }
  },

  async update(
    id: string,
    data: Partial<Order>
  ): Promise<Order | undefined> {
    try {
      const flat = flattenOrderData(data);

      // If items is present, wrap as JSON
      if (flat.items !== undefined) {
        flat.items = flat.items as unknown as Prisma.InputJsonValue;
      }

      const row = await prisma.order.update({
        where: { id },
        data: flat as Prisma.OrderUpdateInput,
      });

      return transformOrder(row);
    } catch (error) {
      console.error("orderStore.update error:", error);
      return undefined;
    }
  },

  async updateStatus(
    id: string,
    status: OrderStatus
  ): Promise<Order | undefined> {
    try {
      const row = await prisma.order.update({
        where: { id },
        data: { status: status as Prisma.EnumOrderStatusFieldUpdateOperationsInput["set"] },
      });
      return transformOrder(row);
    } catch (error) {
      console.error("orderStore.updateStatus error:", error);
      return undefined;
    }
  },

  async getStats(): Promise<{
    totalRevenue: number;
    completedOrders: number;
    cancelledOrders: number;
    cancellationRate: number;
    averageRating: number;
    pendingOrders: number;
    activeOrders: number;
  }> {
    try {
      const [
        completedAgg,
        completedCount,
        cancelledCount,
        totalCount,
        ratingAgg,
        pendingCount,
        activeCount,
      ] = await Promise.all([
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: "completed" },
        }),
        prisma.order.count({ where: { status: "completed" } }),
        prisma.order.count({ where: { status: "cancelled" } }),
        prisma.order.count(),
        prisma.order.aggregate({
          _avg: { clientRating: true },
          where: {
            status: "completed",
            clientRating: { not: null },
          },
        }),
        prisma.order.count({ where: { status: "pending" } }),
        prisma.order.count({
          where: {
            status: { in: ["assigned", "confirmed", "in_progress"] },
          },
        }),
      ]);

      const totalRevenue = completedAgg._sum.total ?? 0;
      const avgRating = ratingAgg._avg.clientRating ?? 0;
      const cancellationRate =
        totalCount > 0
          ? parseFloat(((cancelledCount / totalCount) * 100).toFixed(1))
          : 0;

      return {
        totalRevenue,
        completedOrders: completedCount,
        cancelledOrders: cancelledCount,
        cancellationRate,
        averageRating: parseFloat(avgRating.toFixed(1)),
        pendingOrders: pendingCount,
        activeOrders: activeCount,
      };
    } catch (error) {
      console.error("orderStore.getStats error:", error);
      return {
        totalRevenue: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        cancellationRate: 0,
        averageRating: 0,
        pendingOrders: 0,
        activeOrders: 0,
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Clients CRUD
// ---------------------------------------------------------------------------
export const clientStore = {
  async getAll(
    filters: FilterConfig[] = [],
    sort?: SortConfig,
    page = 1,
    pageSize = 50
  ): Promise<PaginatedResponse<Client>> {
    try {
      const where = buildPrismaWhere(filters) as Prisma.ClientWhereInput;
      const orderBy = buildPrismaOrderBy(sort);

      const [rows, total] = await Promise.all([
        prisma.client.findMany({
          where,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.client.count({ where }),
      ]);

      return buildPaginatedResponse(
        rows.map(transformClient),
        total,
        page,
        pageSize
      );
    } catch (error) {
      console.error("clientStore.getAll error:", error);
      return buildPaginatedResponse<Client>([], 0, page, pageSize);
    }
  },

  async getById(id: string): Promise<Client | undefined> {
    try {
      const row = await prisma.client.findUnique({ where: { id } });
      return row ? transformClient(row) : undefined;
    } catch (error) {
      console.error("clientStore.getById error:", error);
      return undefined;
    }
  },

  async search(query: string): Promise<Client[]> {
    try {
      const q = query.toLowerCase();
      const rows = await prisma.client.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { contactPerson: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
      });
      return rows.map(transformClient);
    } catch (error) {
      console.error("clientStore.search error:", error);
      return [];
    }
  },
};

// ---------------------------------------------------------------------------
// Notifications CRUD
// ---------------------------------------------------------------------------
export const notificationStore = {
  async getAll(
    page = 1,
    pageSize = 20
  ): Promise<PaginatedResponse<Notification>> {
    try {
      const [rows, total] = await Promise.all([
        prisma.notification.findMany({
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.notification.count(),
      ]);

      return buildPaginatedResponse(
        rows.map(transformNotification),
        total,
        page,
        pageSize
      );
    } catch (error) {
      console.error("notificationStore.getAll error:", error);
      return buildPaginatedResponse<Notification>([], 0, page, pageSize);
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      return await prisma.notification.count({
        where: { read: false },
      });
    } catch (error) {
      console.error("notificationStore.getUnreadCount error:", error);
      return 0;
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });
    } catch (error) {
      console.error("notificationStore.markAsRead error:", error);
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
    } catch (error) {
      console.error("notificationStore.markAllAsRead error:", error);
    }
  },

  async add(
    notification: Omit<Notification, "id" | "createdAt" | "updatedAt">
  ): Promise<Notification> {
    try {
      const row = await prisma.notification.create({
        data: {
          type: notification.type as Prisma.EnumNotificationTypeFieldUpdateOperationsInput["set"] &
            string,
          title: notification.title,
          message: notification.message,
          read: notification.read,
          channels: notification.channels,
          relatedOrderId: notification.relatedOrderId,
          relatedCleanerId: notification.relatedCleanerId,
          actionUrl: notification.actionUrl,
          metadata:
            (notification.metadata as Prisma.InputJsonValue) ?? undefined,
        },
      });

      return transformNotification(row);
    } catch (error) {
      console.error("notificationStore.add error:", error);
      throw error;
    }
  },
};

// ---------------------------------------------------------------------------
// Analytics (uses Prisma aggregations where possible)
// ---------------------------------------------------------------------------
export const analyticsStore = {
  async getRevenueOverTime(
    days: number = 30
  ): Promise<{ date: string; revenue: number; orders: number }[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);

      // Fetch completed orders in the date range, grouped by day
      const rows = await prisma.order.findMany({
        where: {
          status: "completed",
          scheduledDate: { gte: startDate },
        },
        select: {
          scheduledDate: true,
          total: true,
        },
        orderBy: { scheduledDate: "asc" },
      });

      // Build a map of dateString -> { revenue, orders }
      const dayMap = new Map<string, { revenue: number; orders: number }>();
      for (const row of rows) {
        const dateStr = row.scheduledDate.toISOString().split("T")[0];
        const existing = dayMap.get(dateStr) ?? { revenue: 0, orders: 0 };
        dayMap.set(dateStr, {
          revenue: existing.revenue + row.total,
          orders: existing.orders + 1,
        });
      }

      // Build result for every day in the range (fill gaps with zeros)
      const result: { date: string; revenue: number; orders: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayData = dayMap.get(dateStr) ?? { revenue: 0, orders: 0 };
        result.push({
          date: dateStr,
          revenue: dayData.revenue,
          orders: dayData.orders,
        });
      }

      return result;
    } catch (error) {
      console.error("analyticsStore.getRevenueOverTime error:", error);
      return [];
    }
  },

  async getOrdersByType(): Promise<
    { type: string; count: number; revenue: number; percentage: number }[]
  > {
    try {
      // Use groupBy for aggregation by type on completed orders
      const groups = await prisma.order.groupBy({
        by: ["type"],
        where: { status: "completed" },
        _count: { id: true },
        _sum: { total: true },
      });

      const totalCompleted = groups.reduce(
        (sum: number, g: { _count: { id: number } }) => sum + g._count.id,
        0
      );
      const divisor = totalCompleted || 1;

      return groups
        .map(
          (g: {
            type: string;
            _count: { id: number };
            _sum: { total: number | null };
          }) => ({
            type: g.type,
            count: g._count.id,
            revenue: g._sum.total ?? 0,
            percentage: parseFloat(
              ((g._count.id / divisor) * 100).toFixed(1)
            ),
          })
        )
        .sort(
          (
            a: { count: number },
            b: { count: number }
          ) => b.count - a.count
        );
    } catch (error) {
      console.error("analyticsStore.getOrdersByType error:", error);
      return [];
    }
  },

  async getTopCleaners(
    limit: number = 10
  ): Promise<
    {
      cleanerId: string;
      cleanerName: string;
      completedOrders: number;
      revenue: number;
      rating: number;
      avatar?: string;
    }[]
  > {
    try {
      // Group completed orders by assignedCleanerId
      const groups = await prisma.order.groupBy({
        by: ["assignedCleanerId"],
        where: {
          status: "completed",
          assignedCleanerId: { not: null },
        },
        _count: { id: true },
        _sum: { total: true },
        orderBy: { _count: { id: "desc" } },
        take: limit,
      });

      type GroupResult = {
        assignedCleanerId: string | null;
        _count: { id: number };
        _sum: { total: number | null };
      };

      type CleanerInfo = {
        id: string;
        firstName: string;
        lastName: string;
        rating: number;
        avatar: string | null;
      };

      // Fetch cleaner details for the top cleaners
      const cleanerIds = groups
        .map((g: GroupResult) => g.assignedCleanerId)
        .filter((id: string | null): id is string => id !== null);

      const cleanerRows: CleanerInfo[] = await prisma.cleaner.findMany({
        where: { id: { in: cleanerIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          rating: true,
          avatar: true,
        },
      });

      const cleanerMap = new Map<string, CleanerInfo>(
        cleanerRows.map((c: CleanerInfo) => [c.id, c])
      );

      return groups.map((g: GroupResult) => {
        const cleaner = g.assignedCleanerId
          ? cleanerMap.get(g.assignedCleanerId)
          : undefined;
        return {
          cleanerId: g.assignedCleanerId ?? "",
          cleanerName: cleaner
            ? `${cleaner.firstName} ${cleaner.lastName}`
            : "Unknown",
          completedOrders: g._count.id,
          revenue: g._sum.total ?? 0,
          rating: cleaner?.rating ?? 0,
          avatar: cleaner?.avatar ?? undefined,
        };
      });
    } catch (error) {
      console.error("analyticsStore.getTopCleaners error:", error);
      return [];
    }
  },

  async getDashboardStats(): Promise<{
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
  }> {
    try {
      // Current period stats
      const stats = await orderStore.getStats();
      const activeCleaners = await cleanerStore.getCount();

      // Previous period (30 days ago to 60 days ago) for computing change %
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const [prevRevenueAgg, prevCompletedCount, prevCancelledCount, prevTotalCount, prevRatingAgg] =
        await Promise.all([
          prisma.order.aggregate({
            _sum: { total: true },
            where: {
              status: "completed",
              scheduledDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
          }),
          prisma.order.count({
            where: {
              status: "completed",
              scheduledDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
          }),
          prisma.order.count({
            where: {
              status: "cancelled",
              scheduledDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
          }),
          prisma.order.count({
            where: {
              scheduledDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
          }),
          prisma.order.aggregate({
            _avg: { clientRating: true },
            where: {
              status: "completed",
              clientRating: { not: null },
              scheduledDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
          }),
        ]);

      // Current period (last 30 days)
      const [curRevenueAgg, curCompletedCount] = await Promise.all([
        prisma.order.aggregate({
          _sum: { total: true },
          where: {
            status: "completed",
            scheduledDate: { gte: thirtyDaysAgo },
          },
        }),
        prisma.order.count({
          where: {
            status: "completed",
            scheduledDate: { gte: thirtyDaysAgo },
          },
        }),
      ]);

      const prevRevenue = prevRevenueAgg._sum.total ?? 0;
      const curRevenue = curRevenueAgg._sum.total ?? 0;
      const prevCancellationRate =
        prevTotalCount > 0
          ? (prevCancelledCount / prevTotalCount) * 100
          : 0;
      const prevAvgRating = prevRatingAgg._avg.clientRating ?? 0;

      // Calculate percentage changes
      const revenueChange =
        prevRevenue > 0
          ? parseFloat(
              (((curRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
            )
          : 0;
      const completedOrdersChange =
        prevCompletedCount > 0
          ? parseFloat(
              (
                ((curCompletedCount - prevCompletedCount) /
                  prevCompletedCount) *
                100
              ).toFixed(1)
            )
          : 0;
      const cancellationRateChange =
        prevCancellationRate > 0
          ? parseFloat(
              (stats.cancellationRate - prevCancellationRate).toFixed(1)
            )
          : 0;
      const averageRatingChange =
        prevAvgRating > 0
          ? parseFloat((stats.averageRating - prevAvgRating).toFixed(1))
          : 0;

      return {
        totalRevenue: stats.totalRevenue,
        revenueChange,
        completedOrders: stats.completedOrders,
        completedOrdersChange,
        cancellationRate: stats.cancellationRate,
        cancellationRateChange,
        averageRating: stats.averageRating,
        averageRatingChange,
        activeCleaners,
        activeCleanersChange: 0, // No historical cleaner count tracked
        pendingOrders: stats.pendingOrders,
      };
    } catch (error) {
      console.error("analyticsStore.getDashboardStats error:", error);
      return {
        totalRevenue: 0,
        revenueChange: 0,
        completedOrders: 0,
        completedOrdersChange: 0,
        cancellationRate: 0,
        cancellationRateChange: 0,
        averageRating: 0,
        averageRatingChange: 0,
        activeCleaners: 0,
        activeCleanersChange: 0,
        pendingOrders: 0,
      };
    }
  },
};
