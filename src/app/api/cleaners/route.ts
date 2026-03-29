import { NextResponse } from "next/server";
import { cleanerStore } from "@/lib/services/db-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { firstName, lastName, email, phone } = body;
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const cleaner = await cleanerStore.create(body);
    return NextResponse.json({ cleaner }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cleaners error:", error);
    return NextResponse.json(
      { error: "Failed to create cleaner" },
      { status: 500 }
    );
  }
}
