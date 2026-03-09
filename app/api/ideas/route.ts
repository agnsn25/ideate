import { NextResponse } from "next/server";
import { loadIdeas } from "@/lib/storage";

export async function GET() {
  try {
    const ideas = loadIdeas();
    return NextResponse.json(ideas);
  } catch (error) {
    console.error("Failed to load ideas:", error);
    return NextResponse.json([], { status: 200 });
  }
}
