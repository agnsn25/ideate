import { NextRequest, NextResponse } from "next/server";
import { getIdea } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idea = getIdea(id);

    if (!idea) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(idea);
  } catch (error) {
    console.error("Failed to load idea:", error);
    return NextResponse.json(
      { error: "Failed to load idea" },
      { status: 500 }
    );
  }
}
