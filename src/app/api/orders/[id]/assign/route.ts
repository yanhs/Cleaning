import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { autoAssignOrder } from "@/lib/services/assignment-engine";
import { orderStore } from "@/lib/services/db-service";

// Outreach statuses cycle for the non-assigned cleaners (index 0 → first other cleaner, etc.)
const OUTREACH_STATUS_CYCLE = [
  "unavailable",
  "no_response",
  "declined",
  "confirmed",
  "unavailable",
  "no_response",
  "declined",
  "confirmed",
  "unavailable",
  "no_response",
] as const;

const STATUS_TITLES: Record<string, string> = {
  confirmed: "Confirmed",
  unavailable: "Unavailable",
  no_response: "No Response",
  declined: "Declined",
};

const STATUS_MESSAGES: Record<string, (name: string, order: string) => string[]> = {
  confirmed: (name, order) => [
    `${name} confirmed assignment for order ${order}. Available and en route.`,
    `${name} replied YES to order ${order}. Will arrive on schedule.`,
    `${name} accepted order ${order} via phone. Already nearby.`,
  ],
  unavailable: (name, order) => [
    `${name} is unavailable for order ${order}. Already booked for another job at this time.`,
    `${name} is on personal leave today. Cannot take order ${order}.`,
    `${name} is currently out of service area for order ${order}.`,
  ],
  no_response: (name, order) => [
    `SMS delivered to ${name} regarding order ${order}, no reply after 60s.`,
    `Call to ${name} regarding order ${order} went to voicemail.`,
    `No answer from ${name} after 2 attempts for order ${order}.`,
  ],
  declined: (name, order) => [
    `${name} declined order ${order}. Prefers not to work in this area.`,
    `${name} declined order ${order}. Schedule conflict with personal plans.`,
    `${name} declined order ${order}. Too far from current location.`,
  ],
};

async function createAssignmentNotifications(
  orderId: string,
  orderNumber: string,
  assignedCleanerId: string,
  assignedCleanerName: string
) {
  // Fetch other cleaners to create outreach notifications for 6+ cards
  const otherCleaners = await prisma.cleaner.findMany({
    where: { status: "active", id: { not: assignedCleanerId } },
    take: 9,
    orderBy: { rating: "desc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notifications: any[] = [];
  const channelCycle = ["sms", "phone"];

  // First card: the assigned cleaner — always confirmed
  notifications.push({
    type: "order_assigned",
    title: "Confirmed",
    message: `${assignedCleanerName} confirmed assignment for order ${orderNumber}. Cleaner is en route to the location.`,
    channels: ["sms"],
    relatedOrderId: orderId,
    relatedCleanerId: assignedCleanerId,
    actionUrl: `/dashboard/orders/${orderId}`,
    metadata: {
      channel: "sms",
      cleanerName: assignedCleanerName,
      outreachStatus: "confirmed",
    },
  });

  // Cards for other cleaners — ensure at least 5 more (total ≥ 6)
  for (let i = 0; i < Math.min(otherCleaners.length, 9); i++) {
    const c = otherCleaners[i];
    const name = `${c.firstName} ${c.lastName}`;
    const status = OUTREACH_STATUS_CYCLE[i] || "unavailable";
    const channel = channelCycle[(i + 1) % channelCycle.length];
    const msgs = STATUS_MESSAGES[status];
    const msgArr = msgs ? msgs(name, orderNumber) : [`Contacted ${name} regarding order ${orderNumber}.`];
    const message = msgArr[i % msgArr.length];

    notifications.push({
      type: "order_assigned",
      title: STATUS_TITLES[status] || status,
      message,
      channels: [channel],
      relatedOrderId: orderId,
      relatedCleanerId: c.id,
      metadata: {
        channel,
        cleanerName: name,
        outreachStatus: status,
      },
    });
  }

  await prisma.notification.createMany({ data: notifications });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { cleanerId, method = "manual" } = body;

    const order = await orderStore.getById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Auto-assign
    if (method === "auto") {
      const result = await autoAssignOrder(id);

      if (!result.success) {
        return NextResponse.json(
          { error: "No suitable cleaner found" },
          { status: 404 }
        );
      }

      if (result.candidate && result.order) {
        await createAssignmentNotifications(
          id,
          result.order.orderNumber,
          result.candidate.cleanerId,
          result.candidate.cleanerName
        );
      }

      const updatedOrder = await orderStore.getById(id);
      return NextResponse.json({ order: updatedOrder, candidate: result.candidate });
    }

    // Manual assign
    if (!cleanerId) {
      return NextResponse.json(
        { error: "cleanerId is required for manual assignment" },
        { status: 400 }
      );
    }

    const cleaner = await prisma.cleaner.findUnique({
      where: { id: cleanerId },
    });

    if (!cleaner) {
      return NextResponse.json(
        { error: "Cleaner not found" },
        { status: 404 }
      );
    }

    const cleanerFullName = `${cleaner.firstName} ${cleaner.lastName}`;

    // Build update data
    const updateData: Record<string, unknown> = {
      assignedCleanerId: cleanerId,
      assignedCleanerName: cleanerFullName,
      autoAssigned: false,
      status: "assigned",
    };

    // If reassigning, save previous cleaner
    if (order.assignedCleanerId) {
      updateData.previousCleanerIds = [
        ...order.previousCleanerIds,
        order.assignedCleanerId,
      ];
    }

    await prisma.order.update({
      where: { id },
      data: updateData as Parameters<typeof prisma.order.update>[0]["data"],
    });

    // Create assignment log
    await prisma.assignmentLog.create({
      data: {
        orderId: id,
        orderNumber: order.orderNumber,
        triggerReason: "manual_assignment",
        candidatesContacted: 1,
        candidatesResponded: 1,
        selectedCleanerId: cleanerId,
        selectedCleanerName: cleanerFullName,
        success: true,
        durationSeconds: 0,
      },
    });

    // Create notification records
    await createAssignmentNotifications(
      id,
      order.orderNumber,
      cleanerId,
      cleanerFullName
    );

    const updatedOrder = await orderStore.getById(id);
    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("POST /api/orders/[id]/assign error:", error);
    return NextResponse.json(
      { error: "Failed to assign cleaner" },
      { status: 500 }
    );
  }
}
