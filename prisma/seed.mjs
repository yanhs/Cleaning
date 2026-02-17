import "dotenv/config";
import pg from "pg";
import { faker } from "@faker-js/faker";

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

faker.seed(42);

const ZONES = ["Downtown","North Side","South Side","East End","West End","Suburbs North","Suburbs South","Midtown","Uptown","Waterfront"];
const SPECS = ["residential","commercial","deep_clean","move_in_out","post_construction","carpet","window","sanitization"];
const NYC = { lat: 40.7128, lon: -73.996 };
const rLat = () => NYC.lat + faker.number.float({ min: -0.06, max: 0.06 });
const rLon = () => NYC.lon + faker.number.float({ min: -0.06, max: 0.06 });
const esc = (s) => s?.replace(/'/g, "''") ?? "";

async function main() {
  await client.connect();
  console.log("🧹 Seeding CleanSlate database...");

  // Clear tables
  await client.query("DELETE FROM assignment_logs");
  await client.query("DELETE FROM notifications");
  await client.query("DELETE FROM orders");
  await client.query("DELETE FROM clients");
  await client.query("DELETE FROM cleaners");
  await client.query("DELETE FROM assignment_rules");

  // ─── Cleaners ──────────────────────────────────────────────────────
  console.log("  Creating 30 cleaners...");
  const cleanerIds = [];
  const cleanerData = [];

  for (let i = 0; i < 30; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const hourlyRate = faker.number.int({ min: 20, max: 55 });
    const availability = faker.helpers.weightedArrayElement([
      { value: "available", weight: 5 },
      { value: "on_job", weight: 3 },
      { value: "unavailable", weight: 1 },
      { value: "day_off", weight: 1 },
    ]);
    const status = faker.helpers.weightedArrayElement([
      { value: "active", weight: 8 },
      { value: "inactive", weight: 1 },
      { value: "suspended", weight: 1 },
    ]);
    const specializations = faker.helpers.arrayElements(SPECS, { min: 1, max: 4 });
    const certifications = faker.helpers.arrayElements(
      ["OSHA Certified", "Green Cleaning", "ISSA Member", "EPA Certified", "First Aid"],
      { min: 0, max: 3 }
    );
    const bgStatus = faker.helpers.weightedArrayElement([
      { value: "cleared", weight: 9 },
      { value: "pending", weight: 1 },
    ]);
    const preferredDays = faker.helpers.arrayElements([0,1,2,3,4,5,6], { min: 4, max: 6 });
    const noGoZones = faker.helpers.arrayElements(["10001","10002","10003","10004","10005"], { min: 0, max: 2 });
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const currentLat = availability === "on_job" ? rLat() : null;
    const currentLon = availability === "on_job" ? rLon() : null;

    const res = await client.query(`
      INSERT INTO cleaners (
        id, "firstName", "lastName", email, phone, avatar, status, availability,
        specializations, rating, "totalReviews", "yearsExperience", certifications,
        "backgroundCheckDate", "backgroundCheckStatus",
        "homeLatitude", "homeLongitude", "homeAddress", "homeCity", "homeState", "homeZipCode",
        "serviceRadius", "currentLatitude", "currentLongitude", zone,
        "hoursWorkedThisWeek", "hoursWorkedThisMonth", "hourlyRate", "overtimeRate",
        "completedOrders", "cancellationRate",
        "preferredDays", "preferredStartTime", "preferredEndTime", "maxHoursPerWeek", "noGoZones",
        notes, "lastOrderDate", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6::\"Status\", $7::\"CleanerAvailability\",
        $8::\"CleaningSpecialization\"[], $9, $10, $11, $12,
        $13, $14::\"BackgroundCheckStatus\",
        $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24,
        $25, $26, $27, $28,
        $29, $30,
        $31, $32, $33, $34, $35,
        $36, $37, $38, NOW()
      ) RETURNING id, "firstName", "lastName"
    `, [
      firstName, lastName, email, faker.phone.number({ style: "national" }),
      `https://api.dicebear.com/9.x/avataaars/svg?seed=${firstName}${lastName}`,
      status, availability,
      specializations,
      parseFloat(faker.number.float({ min: 3.2, max: 5.0, fractionDigits: 1 }).toFixed(1)),
      faker.number.int({ min: 5, max: 250 }),
      faker.number.int({ min: 1, max: 15 }),
      certifications,
      faker.date.past({ years: 1 }),
      bgStatus,
      rLat(), rLon(),
      faker.location.streetAddress(), "New York", "NY", faker.location.zipCode("100##"),
      faker.number.int({ min: 5, max: 20 }),
      currentLat, currentLon,
      faker.helpers.arrayElement(ZONES),
      faker.number.int({ min: 0, max: 42 }),
      faker.number.int({ min: 20, max: 180 }),
      hourlyRate, Math.round(hourlyRate * 1.5),
      faker.number.int({ min: 15, max: 500 }),
      parseFloat(faker.number.float({ min: 0, max: 12, fractionDigits: 1 }).toFixed(1)),
      preferredDays,
      faker.helpers.arrayElement(["07:00","08:00","09:00"]),
      faker.helpers.arrayElement(["17:00","18:00","19:00"]),
      faker.helpers.arrayElement([30, 35, 40, 45]),
      noGoZones,
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || "",
      faker.date.recent({ days: 14 }),
      faker.date.past({ years: 2 }),
    ]);

    const row = res.rows[0];
    cleanerIds.push(row.id);
    cleanerData.push({ id: row.id, firstName: row.firstName, lastName: row.lastName });
  }

  // ─── Clients ──────────────────────────────────────────────────────
  console.log("  Creating 50 clients...");
  const clientIds = [];
  const clientData = [];

  for (let i = 0; i < 50; i++) {
    const isCommercial = faker.datatype.boolean(0.3);
    const name = isCommercial
      ? faker.company.name()
      : `${faker.person.firstName()} ${faker.person.lastName()}`;
    const cType = isCommercial ? "commercial" : "residential";
    const lat = rLat();
    const lon = rLon();
    const address = faker.location.streetAddress();
    const phone = faker.phone.number({ style: "national" });

    const res = await client.query(`
      INSERT INTO clients (
        id, name, type, "contactPerson", email, phone,
        latitude, longitude, address, city, state, "zipCode",
        "preferredCleanerId", notes, "totalOrders", "averageOrderValue",
        "lastServiceDate", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2::"ClientType", $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        NULL, $12, $13, $14,
        $15, $16, NOW()
      ) RETURNING id, name, phone, latitude, longitude, address, city, state, "zipCode"
    `, [
      name, cType, faker.person.fullName(),
      faker.internet.email().toLowerCase(), phone,
      lat, lon, address, "New York", "NY", faker.location.zipCode("100##"),
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }) || "",
      faker.number.int({ min: 1, max: 50 }),
      faker.number.int({ min: 80, max: 500 }),
      faker.date.recent({ days: 60 }),
      faker.date.past({ years: 2 }),
    ]);

    const row = res.rows[0];
    clientIds.push(row.id);
    clientData.push(row);
  }

  // ─── Orders ──────────────────────────────────────────────────────
  console.log("  Creating 150 orders...");
  const orderIds = [];

  for (let i = 0; i < 150; i++) {
    const cIdx = faker.number.int({ min: 0, max: clientIds.length - 1 });
    const clIdx = faker.number.int({ min: 0, max: cleanerIds.length - 1 });
    const clientId = clientIds[cIdx];
    const cd = clientData[cIdx];
    const cleanerId = cleanerIds[clIdx];
    const cl = cleanerData[clIdx];
    const type = faker.helpers.arrayElement(SPECS);

    let scheduledDate, status, priority;

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
      scheduledDate = faker.date.soon({ days: 30, refDate: new Date(Date.now() + 3*86400000) });
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
    const assignedCleanerId = status !== "pending" ? cleanerId : null;
    const assignedCleanerName = status !== "pending" ? `${cl.firstName} ${cl.lastName}` : null;

    const actualStart = (status === "completed" || status === "in_progress")
      ? `${startHour.toString().padStart(2,"0")}:${faker.helpers.arrayElement(["00","05","10"])}`
      : null;
    const actualEnd = status === "completed"
      ? `${endHour.toString().padStart(2,"0")}:${faker.helpers.arrayElement(["00","10","15"])}`
      : null;

    const recurrence = faker.helpers.weightedArrayElement([
      { value: "one_time", weight: 6 },
      { value: "weekly", weight: 2 },
      { value: "biweekly", weight: 1 },
      { value: "monthly", weight: 1 },
    ]);

    const cancellationReason = status === "cancelled"
      ? faker.helpers.arrayElement(["Client cancelled","Schedule conflict","Weather","Cleaner unavailable"])
      : null;
    const cancellationTime = status === "cancelled" ? faker.date.recent({ days: 7 }) : null;

    const paymentStatus = status === "completed" ? "paid"
      : status === "cancelled" ? faker.helpers.arrayElement(["refunded", "unpaid"])
      : "unpaid";

    const clientRating = status === "completed"
      ? (faker.helpers.maybe(() => faker.number.int({ min: 3, max: 5 }), { probability: 0.6 }) ?? null)
      : null;
    const clientFeedback = status === "completed"
      ? (faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) ?? null)
      : null;
    const cleanerNotes = status === "completed"
      ? (faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }) ?? null)
      : null;

    const items = JSON.stringify([{ service: type, quantity: faker.number.int({ min: 1, max: 5 }), unitPrice: subtotal }]);

    const res = await client.query(`
      INSERT INTO orders (
        id, "orderNumber", "clientId", "clientName", "clientPhone",
        latitude, longitude, address, city, state, "zipCode",
        type, items, "specialInstructions", "estimatedDuration", "squareFootage",
        "scheduledDate", "scheduledStartTime", "scheduledEndTime",
        "actualStartTime", "actualEndTime", recurrence,
        "assignedCleanerId", "assignedCleanerName", "previousCleanerIds", "autoAssigned",
        status, priority, "cancellationReason", "cancellationTime",
        subtotal, tax, discount, total, "paymentStatus",
        "clientRating", "clientFeedback", "cleanerNotes",
        "beforePhotos", "afterPhotos",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4,
        $5, $6, $7, $8, $9, $10,
        $11::"CleaningSpecialization", $12::jsonb, $13, $14, $15,
        $16, $17, $18,
        $19, $20, $21::"RecurrencePattern",
        $22, $23, $24, $25,
        $26::"OrderStatus", $27::"OrderPriority", $28, $29,
        $30, $31, $32, $33, $34::"PaymentStatus",
        $35, $36, $37,
        $38, $39,
        $40, NOW()
      ) RETURNING id
    `, [
      `CLN-${scheduledDate.getFullYear()}-${orderNum}`,
      clientId, cd.name, cd.phone,
      cd.latitude, cd.longitude, cd.address, cd.city, cd.state, cd.zipCode,
      type, items,
      faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.25 }),
      duration,
      faker.helpers.maybe(() => faker.number.int({ min: 500, max: 5000 }), { probability: 0.5 }),
      scheduledDate,
      `${startHour.toString().padStart(2,"0")}:00`,
      `${endHour.toString().padStart(2,"0")}:00`,
      actualStart, actualEnd, recurrence,
      assignedCleanerId, assignedCleanerName, [], faker.datatype.boolean(0.4),
      status, priority, cancellationReason, cancellationTime,
      subtotal, tax, discount, subtotal + tax - discount, paymentStatus,
      clientRating, clientFeedback, cleanerNotes,
      [], [],
      new Date(scheduledDate.getTime() - faker.number.int({ min: 1, max: 14 }) * 86400000),
    ]);

    orderIds.push(res.rows[0].id);
  }

  // ─── Notifications ──────────────────────────────────────────────
  console.log("  Creating 30 notifications...");
  const notifTypes = ["order_assigned","order_cancelled","order_completed","cleaner_cancelled","replacement_found","shift_reminder","rating_received","system_alert"];

  for (let i = 0; i < 30; i++) {
    const type = faker.helpers.arrayElement(notifTypes);
    const orderId = faker.helpers.arrayElement(orderIds);
    const cleanerId = faker.helpers.arrayElement(cleanerIds);

    // Fetch order/cleaner info for message
    const orderRes = await client.query(`SELECT "orderNumber", address, type, "clientName" FROM orders WHERE id = $1`, [orderId]);
    const cleanerRes = await client.query(`SELECT "firstName", "lastName" FROM cleaners WHERE id = $1`, [cleanerId]);
    const o = orderRes.rows[0];
    const c = cleanerRes.rows[0];

    const titles = {
      order_assigned: `Order ${o?.orderNumber} assigned to ${c?.firstName}`,
      order_cancelled: `Order ${o?.orderNumber} was cancelled`,
      order_completed: `Order ${o?.orderNumber} completed`,
      cleaner_cancelled: `${c?.firstName} ${c?.lastName} cancelled shift`,
      replacement_found: `Replacement found for ${o?.orderNumber}`,
      shift_reminder: `Shift reminder: ${o?.orderNumber} starts soon`,
      rating_received: `New ${faker.number.int({ min: 4, max: 5 })}-star rating`,
      system_alert: "System maintenance scheduled",
    };

    const messages = {
      order_assigned: `${c?.firstName} assigned to clean at ${o?.address}.`,
      order_cancelled: `Client cancelled order ${o?.orderNumber}.`,
      order_completed: `${c?.firstName} completed ${o?.type} cleaning.`,
      cleaner_cancelled: `${c?.firstName} unavailable. Auto-replacement initiated.`,
      replacement_found: `Replacement assigned to ${o?.orderNumber}.`,
      shift_reminder: `${o?.orderNumber} begins in 1 hour at ${o?.address}.`,
      rating_received: `Rating received for ${o?.orderNumber}.`,
      system_alert: "Maintenance tonight 2:00-4:00 AM EST.",
    };

    await client.query(`
      INSERT INTO notifications (
        id, type, title, message, read, channels,
        "relatedOrderId", "relatedCleanerId", "actionUrl",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1::"NotificationType", $2, $3, $4, $5::"NotificationChannel"[],
        $6, $7, $8,
        $9, NOW()
      )
    `, [
      type, titles[type] || "Notification", messages[type] || "",
      faker.datatype.boolean(0.5), ["in_app"],
      orderId, cleanerId, `/dashboard/orders/${orderId}`,
      faker.date.recent({ days: 7 }),
    ]);
  }

  // ─── Assignment Rules ──────────────────────────────────────────
  console.log("  Creating assignment rules...");
  const rules = [
    { name: "Proximity", type: "proximity", p: 1, w: 30 },
    { name: "Availability", type: "availability", p: 2, w: 25 },
    { name: "Specialization Match", type: "specialization", p: 3, w: 20 },
    { name: "Rating Score", type: "rating", p: 4, w: 15 },
    { name: "Overtime Prevention", type: "overtime_prevention", p: 5, w: 10 },
    { name: "Client Preference", type: "client_preference", p: 6, w: 15 },
    { name: "Workload Balance", type: "workload_balance", p: 7, w: 10 },
    { name: "Cost Optimization", type: "cost_optimization", p: 8, w: 5 },
  ];

  for (const r of rules) {
    await client.query(`
      INSERT INTO assignment_rules (id, name, type, priority, weight, enabled, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2::"AssignmentRuleType", $3, $4, true, NOW(), NOW())
    `, [r.name, r.type, r.p, r.w]);
  }

  // ─── Summary ──────────────────────────────────────────────────
  const counts = await Promise.all([
    client.query("SELECT COUNT(*) FROM cleaners"),
    client.query("SELECT COUNT(*) FROM clients"),
    client.query("SELECT COUNT(*) FROM orders"),
    client.query("SELECT COUNT(*) FROM notifications"),
    client.query("SELECT COUNT(*) FROM assignment_rules"),
  ]);

  console.log(`\n✅ Seed complete!`);
  console.log(`   Cleaners:      ${counts[0].rows[0].count}`);
  console.log(`   Clients:       ${counts[1].rows[0].count}`);
  console.log(`   Orders:        ${counts[2].rows[0].count}`);
  console.log(`   Notifications: ${counts[3].rows[0].count}`);
  console.log(`   Rules:         ${counts[4].rows[0].count}`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await client.end(); });
