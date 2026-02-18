import { NextResponse } from "next/server";
import { orderStore } from "@/lib/services/db-service";
import { autoAssignOrder } from "@/lib/services/assignment-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      clientId,
      type,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      scheduledDate,
      scheduledStartTime,
      scheduledEndTime,
      estimatedDuration,
      squareFootage,
      specialInstructions,
      priority = "normal",
      recurrence = "one_time",
      assignedCleanerId,
      autoAssign = false,
    } = body;

    if (!clientId || !type || !scheduledDate || !scheduledStartTime || !scheduledEndTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create order
    const order = await orderStore.create({
      clientId,
      type,
      address: {
        address: address || "",
        city: city || "",
        state: state || "",
        zipCode: zipCode || "",
        latitude: latitude || 0,
        longitude: longitude || 0,
      },
      scheduledDate: new Date(scheduledDate),
      scheduledStartTime,
      scheduledEndTime,
      estimatedDuration: estimatedDuration || 120,
      squareFootage,
      specialInstructions,
      priority,
      recurrence,
      items: body.items || [{ service: type, quantity: 1, unitPrice: body.subtotal || 100 }],
      assignedCleanerId: autoAssign ? undefined : assignedCleanerId,
    });

    // If autoAssign requested, run the engine
    if (autoAssign && !assignedCleanerId) {
      const result = await autoAssignOrder(order.id);
      if (result.success) {
        return NextResponse.json({
          order: { ...order, ...result.order },
          assignment: result.candidate,
        }, { status: 201 });
      }
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
