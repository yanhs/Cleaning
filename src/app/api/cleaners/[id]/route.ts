import { NextResponse } from "next/server";
import { cleanerStore } from "@/lib/services/db-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cleaner = await cleanerStore.getById(id);
  if (!cleaner) {
    return NextResponse.json({ error: "Cleaner not found" }, { status: 404 });
  }
  return NextResponse.json({ cleaner });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await cleanerStore.update(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Cleaner not found" }, { status: 404 });
    }

    return NextResponse.json({ cleaner: updated });
  } catch (error) {
    console.error("PUT /api/cleaners/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update cleaner" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await cleanerStore.delete(id);
    if (!success) {
      return NextResponse.json({ error: "Cleaner not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/cleaners/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete cleaner" },
      { status: 500 }
    );
  }
}
