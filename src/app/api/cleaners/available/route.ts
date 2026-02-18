import { NextRequest, NextResponse } from "next/server";
import { cleanerStore } from "@/lib/services/db-service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");

    let cleaners = await cleanerStore.getAvailable();

    // Filter by specialization if provided
    if (type) {
      cleaners = cleaners.filter((c) =>
        c.specializations.includes(type as (typeof c.specializations)[number])
      );
    }

    // Return simplified cleaner data for the select dropdown
    const result = cleaners.map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      rating: c.rating,
      specializations: c.specializations,
      hourlyRate: c.hourlyRate,
      hoursWorkedThisWeek: c.hoursWorkedThisWeek,
      zone: c.zone,
    }));

    return NextResponse.json({ cleaners: result });
  } catch (error) {
    console.error("GET /api/cleaners/available error:", error);
    return NextResponse.json(
      { error: "Failed to fetch available cleaners" },
      { status: 500 }
    );
  }
}
