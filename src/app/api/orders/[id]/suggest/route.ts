import { NextResponse } from "next/server";
import { getAssignmentSuggestions } from "@/lib/services/assignment-engine";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const candidates = await getAssignmentSuggestions(id);

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error("GET /api/orders/[id]/suggest error:", error);
    return NextResponse.json(
      { error: "Failed to get suggestions" },
      { status: 500 }
    );
  }
}
