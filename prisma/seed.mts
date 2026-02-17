import "dotenv/config";
import { faker } from "@faker-js/faker";

// Dynamic import for Prisma generated client (ESM)
const { PrismaClient } = await import("../src/generated/prisma/client.ts");

const prisma = new PrismaClient();

faker.seed(42);

const ZONES = [
  "Downtown", "North Side", "South Side", "East End", "West End",
  "Suburbs North", "Suburbs South", "Midtown", "Uptown", "Waterfront",
];

const SPECIALIZATIONS = [
  "residential", "commercial", "deep_clean", "move_in_out",
  "post_construction", "carpet", "window", "sanitization",
] as const;

const NYC_CENTER = { lat: 40.7128, lon: -73.996 };

function randomLat() {
  return NYC_CENTER.lat + faker.number.float({ min: -0.06, max: 0.06 });
}
function randomLon() {
  return NYC_CENTER.lon + faker.number.float({ min: -0.06, max: 0.06 });
}

async function main() {
  console.log("🧹 Seeding CleanSlate database...");

  await prisma.assignmentLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.order.deleteMany();
  await prisma.client.deleteMany();
  await prisma.cleaner.deleteMany();
  await prisma.assignmentRule.deleteMany();

  // ─── Cleaners ──────────────────────────────────────────────────────────
  console.log("  Creating 30 cleaners...");
  const cleanerIds: string[] = [];

  for (let i = 0; i < 30; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const hourlyRate = faker.number.int({ min: 20, max: 55 });
    const availability = faker.helpers.weightedArrayElement([
      { value: "available" as const, weight: 5 },
      { value: "on_job" as const, weight: 3 },
      { value: "unavailable" as const, weight: 1 },
      { value: "day_off" as const, weight: 1 },
    ]);

    const cleaner = await prisma.cleaner.create({
      data: {
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone: faker.phone.number({ style: "national" }),
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${firstName}${lastName}`,
        status: faker.helpers.weightedArrayElement([
          { value: "active" as const, weight: 8 },
          { value: "inactive" as const, weight: 1 },
          { value: "suspended" as const, weight: 1 },
        ]),
        availability,
        specializations: faker.helpers.arrayElements([...SPECIALIZATIONS], { min: 1, max: 4 }),
        rating: parseFloat(faker.number.float({ min: 3.2, max: 5.0, fractionDigits: 1 }).toFixed(1)),
        totalReviews: faker.number.int({ min: 5, max: 250 }),
        yearsExperience: faker.number.int({ min: 1, max: 15 }),
        certifications: faker.helpers.arrayElements(
          ["OSHA Certified", "Green Cleaning", "ISSA Member", "EPA Certified", "First Aid"],
          { min: 0, max: 3 }
        ),
        backgroundCheckDate: faker.date.past({ years: 1 }),
        backgroundCheckStatus: faker.helpers.weightedArrayElement([
          { value: "cleared" as const, weight: 9 },
          { value: "pending" as const, weight: 1 },
        ]),
        homeLatitude: randomLat(),
        homeLongitude: randomLon(),
        homeAddress: faker.location.streetAddress(),
        homeCity: "New York",
        homeState: "NY",
        homeZipCode: faker.location.zipCode("100##"),
        serviceRadius: faker.number.int({ min: 5, max: 20 }),
        currentLatitude: availability === "on_job" ? randomLat() : null,
        currentLongitude: availability === "on_job" ? randomLon() : null,
        zone: faker.helpers.arrayElement(ZONES),
        hoursWorkedThisWeek: faker.number.int({ min: 0, max: 42 }),
        hoursWorkedThisMonth: faker.number.int({ min: 20, max: 180 }),
        hourlyRate,
        overtimeRate: Math.round(hourlyRate * 1.5),
        completedOrders: faker.number.int({ min: 15, max: 500 }),
        cancellationRate: parseFloat(faker.number.float({ min: 0, max: 12, fractionDigits: 1 }).toFixed(1)),
        preferredDays: faker.helpers.arrayElements([0, 1, 2, 3, 4, 5, 6], { min: 4, max: 6 }),
        preferredStartTime: faker.helpers.arrayElement(["07:00", "08:00", "09:00"]),
        preferredEndTime: faker.helpers.arrayElement(["17:00", "18:00", "19:00"]),
        maxHoursPerWeek: faker.helpers.arrayElement([30, 35, 40, 45]),
        noGoZones: faker.helpers.arrayElements(["10001", "10002", "10003", "10004", "10005"], { min: 0, max: 2 }),
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || "",
        lastOrderDate: faker.date.recent({ days: 14 }),
        createdAt: faker.date.past({ years: 2 }),
      },
    });
    cleanerIds.push(cleaner.id);
  }

  // ─── Clients ───────────────────────────────────────────────────────────
  console.log("  Creating 50 clients...");
  const clientIds: string[] = [];

  for (let i = 0; i < 50; i++) {
    const isCommercial = faker.datatype.boolean(0.3);
    const name = isCommercial
      ? faker.company.name()
      : `${faker.person.firstName()} ${faker.person.lastName()}`;

    const client = await prisma.client.create({
      data: {
        name,
        type: isCommercial ? "commercial" : "residential",
        contactPerson: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number({ style: "national" }),
        latitude: randomLat(),
        longitude: randomLon(),
        address: faker.location.streetAddress(),
        city: "New York",
        state: "NY",
        zipCode: faker.location.zipCode("100##"),
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }) || "",
        totalOrders: faker.number.int({ min: 1, max: 50 }),
        averageOrderValue: faker.number.int({ min: 80, max: 500 }),
        lastServiceDate: faker.date.recent({ days: 60 }),
        createdAt: faker.date.past({ years: 2 }),
      },
    });
    clientIds.push(client.id);
  }

  // ─── Orders ────────────────────────────────────────────────────────────
  console.log("  Creating 150 orders...");
  const orderIds: string[] = [];

  for (let i = 0; i < 150; i++) {
    const clientId = faker.helpers.arrayElement(clientIds);
    const cleanerId = faker.helpers.arrayElement(cleanerIds);
    const type = faker.helpers.arrayElement([...SPECIALIZATIONS]);

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    const cleaner = await prisma.cleaner.findUnique({ where: { id: cleanerId } });

    let scheduledDate: Date;
    let status: string;
    let priority: string;

    if (i < 90) {
      scheduledDate = faker.date.recent({ days: 60 });
      status = faker.helpers.weightedArrayElement([
        { value: "completed", weight: 8 },
        { value: "cancelled", weight: 1 },
        { value: "no_show", weight: 1 },
      ]);
      priority = "normal";
    } else if (i < 120) {
      scheduledDate = faker.date.soon({ days: 3 });
      status = faker.helpers.weightedArrayElement([
        { value: "assigned", weight: 3 },
        { value: "confirmed", weight: 3 },
        { value: "in_progress", weight: 3 },
        { value: "reassigning", weight: 1 },
      ]);
      priority = faker.helpers.arrayElement(["normal", "high"]);
    } else {
      scheduledDate = faker.date.soon({ days: 30, refDate: new Date(Date.now() + 3 * 86400000) });
      status = faker.helpers.weightedArrayElement([
        { value: "pending", weight: 6 },
        { value: "assigned", weight: 4 },
      ]);
      priority = faker.helpers.arrayElement(["low", "normal", "normal", "high"]);
    }

    const startHour = faker.number.int({ min: 7, max: 15 });
    const duration = faker.helpers.arrayElement([60, 90, 120, 180, 240]);
    const endHour = Math.min(startHour + Math.ceil(duration / 60), 20);
    const subtotal = faker.number.int({ min: 80, max: 600 });
    const tax = Math.round(subtotal * 0.08875);
    const discount = faker.helpers.maybe(() => faker.number.int({ min: 10, max: 50 }), { probability: 0.15 }) || 0;
    const orderNum = (i + 1).toString().padStart(5, "0");

    const order = await prisma.order.create({
      data: {
        orderNumber: `CLN-${scheduledDate.getFullYear()}-${orderNum}`,
        clientId,
        clientName: client?.name || "Unknown",
        clientPhone: client?.phone || "",
        latitude: client?.latitude,
        longitude: client?.longitude,
        address: client?.address || "",
        city: client?.city || "New York",
        state: client?.state || "NY",
        zipCode: client?.zipCode || "",
        type: type as any,
        items: [{ service: type, quantity: faker.number.int({ min: 1, max: 5 }), unitPrice: subtotal }],
        specialInstructions: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.25 }),
        estimatedDuration: duration,
        squareFootage: faker.helpers.maybe(() => faker.number.int({ min: 500, max: 5000 }), { probability: 0.5 }),
        scheduledDate,
        scheduledStartTime: `${startHour.toString().padStart(2, "0")}:00`,
        scheduledEndTime: `${endHour.toString().padStart(2, "0")}:00`,
        actualStartTime:
          status === "completed" || status === "in_progress"
            ? `${startHour.toString().padStart(2, "0")}:${faker.helpers.arrayElement(["00", "05", "10"])}`
            : null,
        actualEndTime: status === "completed" ? `${endHour.toString().padStart(2, "0")}:${faker.helpers.arrayElement(["00", "10", "15"])}` : null,
        recurrence: faker.helpers.weightedArrayElement([
          { value: "one_time", weight: 6 },
          { value: "weekly", weight: 2 },
          { value: "biweekly", weight: 1 },
          { value: "monthly", weight: 1 },
        ]) as any,
        assignedCleanerId: status !== "pending" ? cleanerId : null,
        assignedCleanerName: status !== "pending" && cleaner ? `${cleaner.firstName} ${cleaner.lastName}` : null,
        previousCleanerIds: [],
        autoAssigned: faker.datatype.boolean(0.4),
        status: status as any,
        priority: priority as any,
        cancellationReason: status === "cancelled" ? faker.helpers.arrayElement(["Client cancelled", "Schedule conflict", "Weather", "Cleaner unavailable"]) : null,
        cancellationTime: status === "cancelled" ? faker.date.recent({ days: 7 }) : null,
        subtotal,
        tax,
        discount,
        total: subtotal + tax - discount,
        paymentStatus: (status === "completed" ? "paid" : status === "cancelled" ? faker.helpers.arrayElement(["refunded", "unpaid"]) : "unpaid") as any,
        clientRating: status === "completed" ? (faker.helpers.maybe(() => faker.number.int({ min: 3, max: 5 }), { probability: 0.6 }) ?? null) : null,
        clientFeedback: status === "completed" ? (faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) ?? null) : null,
        cleanerNotes: status === "completed" ? (faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }) ?? null) : null,
        beforePhotos: [],
        afterPhotos: [],
        createdAt: new Date(scheduledDate.getTime() - faker.number.int({ min: 1, max: 14 }) * 86400000),
      },
    });
    orderIds.push(order.id);
  }

  // ─── Notifications ─────────────────────────────────────────────────────
  console.log("  Creating 30 notifications...");
  const notifTypes = ["order_assigned", "order_cancelled", "order_completed", "cleaner_cancelled", "replacement_found", "shift_reminder", "rating_received", "system_alert"] as const;

  for (let i = 0; i < 30; i++) {
    const type = faker.helpers.arrayElement([...notifTypes]);
    const orderId = faker.helpers.arrayElement(orderIds);
    const cleanerId = faker.helpers.arrayElement(cleanerIds);
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    const cleaner = await prisma.cleaner.findUnique({ where: { id: cleanerId } });

    const titles: Record<string, string> = {
      order_assigned: `Order ${order?.orderNumber} assigned to ${cleaner?.firstName}`,
      order_cancelled: `Order ${order?.orderNumber} was cancelled`,
      order_completed: `Order ${order?.orderNumber} completed`,
      cleaner_cancelled: `${cleaner?.firstName} ${cleaner?.lastName} cancelled shift`,
      replacement_found: `Replacement found for ${order?.orderNumber}`,
      shift_reminder: `Shift reminder: ${order?.orderNumber} starts soon`,
      rating_received: `New ${faker.number.int({ min: 4, max: 5 })}-star rating`,
      system_alert: "System maintenance scheduled",
    };

    const messages: Record<string, string> = {
      order_assigned: `${cleaner?.firstName} assigned to clean at ${order?.address}.`,
      order_cancelled: `Client cancelled order ${order?.orderNumber}.`,
      order_completed: `${cleaner?.firstName} completed ${order?.type} cleaning.`,
      cleaner_cancelled: `${cleaner?.firstName} unavailable. Auto-replacement initiated.`,
      replacement_found: `Replacement assigned to ${order?.orderNumber}.`,
      shift_reminder: `${order?.orderNumber} begins in 1 hour at ${order?.address}.`,
      rating_received: `Rating received for ${order?.orderNumber}.`,
      system_alert: "Maintenance tonight 2:00-4:00 AM EST.",
    };

    await prisma.notification.create({
      data: {
        type: type as any,
        title: titles[type] || "Notification",
        message: messages[type] || "",
        read: faker.datatype.boolean(0.5),
        channels: ["in_app"],
        relatedOrderId: orderId,
        relatedCleanerId: cleanerId,
        actionUrl: `/dashboard/orders/${orderId}`,
        createdAt: faker.date.recent({ days: 7 }),
      },
    });
  }

  // ─── Assignment Rules ──────────────────────────────────────────────────
  console.log("  Creating assignment rules...");
  const rules = [
    { name: "Proximity", type: "proximity", priority: 1, weight: 30 },
    { name: "Availability", type: "availability", priority: 2, weight: 25 },
    { name: "Specialization Match", type: "specialization", priority: 3, weight: 20 },
    { name: "Rating Score", type: "rating", priority: 4, weight: 15 },
    { name: "Overtime Prevention", type: "overtime_prevention", priority: 5, weight: 10 },
    { name: "Client Preference", type: "client_preference", priority: 6, weight: 15 },
    { name: "Workload Balance", type: "workload_balance", priority: 7, weight: 10 },
    { name: "Cost Optimization", type: "cost_optimization", priority: 8, weight: 5 },
  ];

  for (const rule of rules) {
    await prisma.assignmentRule.create({
      data: { name: rule.name, type: rule.type as any, priority: rule.priority, weight: rule.weight, enabled: true },
    });
  }

  const counts = {
    cleaners: await prisma.cleaner.count(),
    clients: await prisma.client.count(),
    orders: await prisma.order.count(),
    notifications: await prisma.notification.count(),
    rules: await prisma.assignmentRule.count(),
  };

  console.log(`\n✅ Seed complete!`);
  console.log(`   Cleaners:      ${counts.cleaners}`);
  console.log(`   Clients:       ${counts.clients}`);
  console.log(`   Orders:        ${counts.orders}`);
  console.log(`   Notifications: ${counts.notifications}`);
  console.log(`   Rules:         ${counts.rules}`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
