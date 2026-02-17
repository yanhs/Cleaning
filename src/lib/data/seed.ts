import { faker } from "@faker-js/faker";
import type {
  Cleaner,
  CleaningSpecialization,
  CleanerAvailability,
} from "@/types/cleaner";
import type { Client } from "@/types/client";
import type { Order, OrderStatus, OrderPriority } from "@/types/order";
import type { Notification, NotificationType } from "@/types/notification";

faker.seed(42);

const ZONES = [
  "Downtown",
  "North Side",
  "South Side",
  "East End",
  "West End",
  "Suburbs North",
  "Suburbs South",
  "Midtown",
  "Uptown",
  "Waterfront",
];

const SPECIALIZATIONS: CleaningSpecialization[] = [
  "residential",
  "commercial",
  "deep_clean",
  "move_in_out",
  "post_construction",
  "carpet",
  "window",
  "sanitization",
];

const NYC_CENTER = { lat: 40.7128, lon: -73.996 };

function randomNYCLocation() {
  return {
    latitude:
      NYC_CENTER.lat + faker.number.float({ min: -0.06, max: 0.06 }),
    longitude:
      NYC_CENTER.lon + faker.number.float({ min: -0.06, max: 0.06 }),
    address: faker.location.streetAddress(),
    city: "New York",
    state: "NY",
    zipCode: faker.location.zipCode("100##"),
  };
}

export function generateCleaners(count: number = 30): Cleaner[] {
  return Array.from({ length: count }, () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const hourlyRate = faker.number.int({ min: 20, max: 55 });
    const availability = faker.helpers.weightedArrayElement([
      { value: "available" as CleanerAvailability, weight: 5 },
      { value: "on_job" as CleanerAvailability, weight: 3 },
      { value: "unavailable" as CleanerAvailability, weight: 1 },
      { value: "day_off" as CleanerAvailability, weight: 1 },
    ]);

    return {
      id: faker.string.uuid(),
      firstName,
      lastName,
      email: faker.internet
        .email({ firstName, lastName })
        .toLowerCase(),
      phone: faker.phone.number({ style: "national" }),
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${firstName}${lastName}`,
      status: faker.helpers.weightedArrayElement([
        { value: "active" as const, weight: 8 },
        { value: "inactive" as const, weight: 1 },
        { value: "suspended" as const, weight: 1 },
      ]),
      availability,
      specializations: faker.helpers.arrayElements(SPECIALIZATIONS, {
        min: 1,
        max: 4,
      }),
      rating: parseFloat(
        faker.number
          .float({ min: 3.2, max: 5.0, fractionDigits: 1 })
          .toFixed(1)
      ),
      totalReviews: faker.number.int({ min: 5, max: 250 }),
      yearsExperience: faker.number.int({ min: 1, max: 15 }),
      certifications: faker.helpers.arrayElements(
        [
          "OSHA Certified",
          "Green Cleaning",
          "ISSA Member",
          "EPA Certified",
          "First Aid",
        ],
        { min: 0, max: 3 }
      ),
      backgroundCheckDate: faker.date.past({ years: 1 }),
      backgroundCheckStatus: faker.helpers.weightedArrayElement([
        { value: "cleared" as const, weight: 9 },
        { value: "pending" as const, weight: 1 },
      ]),
      homeLocation: randomNYCLocation(),
      serviceRadius: faker.number.int({ min: 5, max: 20 }),
      currentLocation:
        availability === "on_job" ? randomNYCLocation() : undefined,
      zone: faker.helpers.arrayElement(ZONES),
      hoursWorkedThisWeek: faker.number.int({ min: 0, max: 42 }),
      hoursWorkedThisMonth: faker.number.int({ min: 20, max: 180 }),
      hourlyRate,
      overtimeRate: Math.round(hourlyRate * 1.5),
      completedOrders: faker.number.int({ min: 15, max: 500 }),
      cancellationRate: parseFloat(
        faker.number
          .float({ min: 0, max: 12, fractionDigits: 1 })
          .toFixed(1)
      ),
      schedulePreference: {
        preferredDays: faker.helpers.arrayElements(
          [0, 1, 2, 3, 4, 5, 6],
          { min: 4, max: 6 }
        ),
        preferredStartTime: faker.helpers.arrayElement([
          "07:00",
          "08:00",
          "09:00",
        ]),
        preferredEndTime: faker.helpers.arrayElement([
          "17:00",
          "18:00",
          "19:00",
        ]),
        maxHoursPerWeek: faker.helpers.arrayElement([30, 35, 40, 45]),
        noGoZones: faker.helpers.arrayElements(
          ["10001", "10002", "10003", "10004", "10005"],
          { min: 0, max: 2 }
        ),
      },
      notes:
        faker.helpers.maybe(() => faker.lorem.sentence(), {
          probability: 0.3,
        }) || "",
      currentOrderId: undefined,
      lastOrderDate: faker.date.recent({ days: 14 }),
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 }),
    };
  });
}

export function generateClients(count: number = 50): Client[] {
  return Array.from({ length: count }, () => {
    const isCommercial = faker.datatype.boolean(0.3);
    const name = isCommercial
      ? faker.company.name()
      : `${faker.person.firstName()} ${faker.person.lastName()}`;
    return {
      id: faker.string.uuid(),
      name,
      type: isCommercial ? ("commercial" as const) : ("residential" as const),
      contactPerson: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number({ style: "national" }),
      address: randomNYCLocation(),
      preferredCleanerId: undefined,
      notes:
        faker.helpers.maybe(() => faker.lorem.sentence(), {
          probability: 0.2,
        }) || "",
      totalOrders: faker.number.int({ min: 1, max: 50 }),
      averageOrderValue: faker.number.int({ min: 80, max: 500 }),
      lastServiceDate: faker.date.recent({ days: 60 }),
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 }),
    };
  });
}

export function generateOrders(
  count: number = 150,
  cleaners: Cleaner[],
  clients: Client[]
): Order[] {
  const activeCleaners = cleaners.filter((c) => c.status === "active");

  return Array.from({ length: count }, (_, i) => {
    const client = faker.helpers.arrayElement(clients);
    const cleaner = faker.helpers.arrayElement(activeCleaners);
    const type = faker.helpers.arrayElement(SPECIALIZATIONS);

    // Distribute orders: 60% past (completed/cancelled), 20% today/near future (in_progress/assigned), 20% future (pending)
    let scheduledDate: Date;
    let status: OrderStatus;
    let priority: OrderPriority;

    if (i < count * 0.6) {
      // Past orders
      scheduledDate = faker.date.recent({ days: 60 });
      status = faker.helpers.weightedArrayElement([
        { value: "completed" as OrderStatus, weight: 8 },
        { value: "cancelled" as OrderStatus, weight: 1 },
        { value: "no_show" as OrderStatus, weight: 1 },
      ]);
      priority = "normal";
    } else if (i < count * 0.8) {
      // Current orders
      scheduledDate = faker.date.soon({ days: 3 });
      status = faker.helpers.weightedArrayElement([
        { value: "assigned" as OrderStatus, weight: 3 },
        { value: "confirmed" as OrderStatus, weight: 3 },
        { value: "in_progress" as OrderStatus, weight: 3 },
        { value: "reassigning" as OrderStatus, weight: 1 },
      ]);
      priority = faker.helpers.arrayElement([
        "normal",
        "high",
      ] as OrderPriority[]);
    } else {
      // Future orders
      scheduledDate = faker.date.soon({
        days: 30,
        refDate: new Date(Date.now() + 3 * 86400000),
      });
      status = faker.helpers.weightedArrayElement([
        { value: "pending" as OrderStatus, weight: 6 },
        { value: "assigned" as OrderStatus, weight: 4 },
      ]);
      priority = faker.helpers.arrayElement([
        "low",
        "normal",
        "normal",
        "high",
      ] as OrderPriority[]);
    }

    const startHour = faker.number.int({ min: 7, max: 15 });
    const duration = faker.helpers.arrayElement([60, 90, 120, 180, 240]);
    const endHour = Math.min(startHour + Math.ceil(duration / 60), 20);
    const subtotal = faker.number.int({ min: 80, max: 600 });
    const tax = Math.round(subtotal * 0.08875);
    const discount =
      faker.helpers.maybe(() => faker.number.int({ min: 10, max: 50 }), {
        probability: 0.15,
      }) || 0;

    const orderYear = scheduledDate.getFullYear();
    const orderNum = (i + 1).toString().padStart(5, "0");

    return {
      id: faker.string.uuid(),
      orderNumber: `CLN-${orderYear}-${orderNum}`,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      address: client.address,
      type,
      items: [
        {
          service: type,
          quantity: faker.number.int({ min: 1, max: 5 }),
          unitPrice: subtotal,
        },
      ],
      specialInstructions: faker.helpers.maybe(
        () => faker.lorem.sentence(),
        { probability: 0.25 }
      ),
      estimatedDuration: duration,
      squareFootage: faker.helpers.maybe(
        () => faker.number.int({ min: 500, max: 5000 }),
        { probability: 0.5 }
      ),
      scheduledDate,
      scheduledStartTime: `${startHour.toString().padStart(2, "0")}:00`,
      scheduledEndTime: `${endHour.toString().padStart(2, "0")}:00`,
      actualStartTime:
        status === "completed" || status === "in_progress"
          ? `${startHour.toString().padStart(2, "0")}:${faker.helpers.arrayElement(["00", "05", "10"])}`
          : undefined,
      actualEndTime:
        status === "completed"
          ? `${endHour.toString().padStart(2, "0")}:${faker.helpers.arrayElement(["00", "10", "15"])}`
          : undefined,
      recurrence: faker.helpers.weightedArrayElement([
        { value: "one_time" as const, weight: 6 },
        { value: "weekly" as const, weight: 2 },
        { value: "biweekly" as const, weight: 1 },
        { value: "monthly" as const, weight: 1 },
      ]),
      assignedCleanerId: status !== "pending" ? cleaner.id : undefined,
      assignedCleanerName:
        status !== "pending"
          ? `${cleaner.firstName} ${cleaner.lastName}`
          : undefined,
      previousCleanerIds: [],
      autoAssigned: faker.datatype.boolean(0.4),
      status,
      priority,
      cancellationReason:
        status === "cancelled"
          ? faker.helpers.arrayElement([
              "Client cancelled",
              "Schedule conflict",
              "Weather",
              "Cleaner unavailable",
            ])
          : undefined,
      cancellationTime:
        status === "cancelled"
          ? faker.date.recent({ days: 7 })
          : undefined,
      subtotal,
      tax,
      discount,
      total: subtotal + tax - discount,
      paymentStatus:
        status === "completed"
          ? "paid"
          : status === "cancelled"
            ? faker.helpers.arrayElement(["refunded", "unpaid"] as const)
            : "unpaid",
      clientRating:
        status === "completed"
          ? faker.helpers.maybe(
              () => faker.number.int({ min: 3, max: 5 }),
              { probability: 0.6 }
            )
          : undefined,
      clientFeedback:
        status === "completed"
          ? faker.helpers.maybe(() => faker.lorem.sentence(), {
              probability: 0.3,
            })
          : undefined,
      cleanerNotes:
        status === "completed"
          ? faker.helpers.maybe(() => faker.lorem.sentence(), {
              probability: 0.2,
            })
          : undefined,
      beforePhotos: [],
      afterPhotos: [],
      createdAt: new Date(
        scheduledDate.getTime() -
          faker.number.int({ min: 1, max: 14 }) * 86400000
      ),
      updatedAt: faker.date.recent({ days: 7 }),
    };
  });
}

export function generateNotifications(
  count: number = 30,
  orders: Order[],
  cleaners: Cleaner[]
): Notification[] {
  const types: NotificationType[] = [
    "order_assigned",
    "order_cancelled",
    "order_completed",
    "cleaner_cancelled",
    "replacement_found",
    "shift_reminder",
    "rating_received",
    "system_alert",
  ];

  return Array.from({ length: count }, () => {
    const type = faker.helpers.arrayElement(types);
    const order = faker.helpers.arrayElement(orders);
    const cleaner = faker.helpers.arrayElement(cleaners);

    const titleMap: Record<NotificationType, string> = {
      order_assigned: `Order ${order.orderNumber} assigned to ${cleaner.firstName}`,
      order_cancelled: `Order ${order.orderNumber} was cancelled`,
      order_completed: `Order ${order.orderNumber} completed successfully`,
      cleaner_cancelled: `${cleaner.firstName} ${cleaner.lastName} cancelled shift`,
      replacement_found: `Replacement found for ${order.orderNumber}`,
      replacement_failed: `No replacement found for ${order.orderNumber}`,
      shift_reminder: `Shift reminder: ${order.orderNumber} starts soon`,
      rating_received: `New ${faker.number.int({ min: 4, max: 5 })}-star rating received`,
      system_alert: "System maintenance scheduled",
    };

    const messageMap: Record<NotificationType, string> = {
      order_assigned: `${cleaner.firstName} ${cleaner.lastName} has been assigned to clean at ${order.address.address}.`,
      order_cancelled: `The client cancelled order ${order.orderNumber}. Reason: ${faker.helpers.arrayElement(["Schedule change", "No longer needed", "Found alternative"])}`,
      order_completed: `${cleaner.firstName} has completed the ${order.type} cleaning at ${order.address.address}.`,
      cleaner_cancelled: `${cleaner.firstName} is no longer available for their upcoming shift. Auto-replacement initiated.`,
      replacement_found: `A replacement cleaner has been found and assigned to order ${order.orderNumber}.`,
      replacement_failed: `Unable to find a replacement for order ${order.orderNumber}. Manual intervention required.`,
      shift_reminder: `Order ${order.orderNumber} is scheduled to begin in 1 hour at ${order.address.address}.`,
      rating_received: `${order.clientName} gave a ${faker.number.int({ min: 4, max: 5 })}-star rating for order ${order.orderNumber}.`,
      system_alert:
        "Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM EST.",
    };

    return {
      id: faker.string.uuid(),
      type,
      title: titleMap[type],
      message: messageMap[type],
      read: faker.datatype.boolean(0.5),
      channels: ["in_app" as const],
      relatedOrderId: order.id,
      relatedCleanerId: cleaner.id,
      actionUrl: `/dashboard/orders/${order.id}`,
      createdAt: faker.date.recent({ days: 7 }),
      updatedAt: faker.date.recent({ days: 7 }),
    };
  });
}
