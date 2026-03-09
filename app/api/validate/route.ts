import { NextRequest, NextResponse } from "next/server";
import { validateIdea } from "@/lib/pipeline";
import type { RawIdeaOutput } from "@/lib/types";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, oneLiner, description, mode } = body;

    if (!name || !oneLiner || !description) {
      return NextResponse.json(
        { error: "name, oneLiner, and description are required" },
        { status: 400 }
      );
    }

    const rawIdea: RawIdeaOutput = { name, oneLiner, description };
    const idea = await validateIdea(rawIdea, mode || "refine", [], []);

    return NextResponse.json({ idea });
  } catch (error) {
    console.error("Validation pipeline error:", error);
    return NextResponse.json(
      {
        error: "Validation pipeline failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
