import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [cleaners, orders] = await Promise.all([
      prisma.cleaner.findMany({
        where: { status: "active" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          availability: true,
          specializations: true,
          rating: true,
          homeLatitude: true,
          homeLongitude: true,
          homeAddress: true,
          zone: true,
          hoursWorkedThisWeek: true,
        },
      }),
      prisma.order.findMany({
        where: {
          status: { in: ["pending", "assigned", "confirmed", "in_progress"] },
        },
        select: {
          id: true,
          orderNumber: true,
          clientName: true,
          address: true,
          city: true,
          latitude: true,
          longitude: true,
          type: true,
          status: true,
          priority: true,
          scheduledDate: true,
          scheduledStartTime: true,
          scheduledEndTime: true,
          assignedCleanerName: true,
          assignedCleanerId: true,
        },
        orderBy: { scheduledDate: "asc" },
      }),
    ]);

    return NextResponse.json({ cleaners, orders });
  } catch (error) {
    console.error("GET /api/map error:", error);
    return NextResponse.json({ cleaners: [], orders: [] });
  }
}
