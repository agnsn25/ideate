import { NextRequest, NextResponse } from "next/server";
import { generateIdeas, validateIdea } from "@/lib/pipeline";
import type { GenerateRequest } from "@/lib/types";

export const maxDuration = 300; // 5 min timeout for long pipelines

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { mode, input } = body;

    if (!mode || (!input && mode !== "trend")) {
      return NextResponse.json(
        { error: "Mode is required. Input is required for domain and refine modes." },
        { status: 400 }
      );
    }

    // Stage 1: Generate raw ideas from both LLMs
    const { ideas: rawIdeas, searchQueries, contextDocsUsed } =
      await generateIdeas(mode, input || "");

    if (rawIdeas.length === 0) {
      return NextResponse.json(
        { error: "No ideas were generated. Try a different input." },
        { status: 422 }
      );
    }

    // Stage 2: Validate each idea sequentially (dimensions parallelized within each)
    // Per-idea timeout prevents one stuck idea from killing the whole run
    const IDEA_TIMEOUT_MS = 120_000; // 2 min per idea
    const validatedIdeas = [];
    for (const raw of rawIdeas) {
      try {
        const result = await Promise.race([
          validateIdea(raw, mode, searchQueries, contextDocsUsed),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Validation timed out for "${raw.name}"`)), IDEA_TIMEOUT_MS)
          ),
        ]);
        validatedIdeas.push(result);
      } catch (err) {
        console.warn(`Skipping idea "${raw.name}":`, err instanceof Error ? err.message : err);
      }
    }

    if (validatedIdeas.length === 0) {
      return NextResponse.json(
        { error: "All ideas failed validation. Try again or simplify your input." },
        { status: 422 }
      );
    }

    // Sort by consensus score descending
    validatedIdeas.sort((a, b) => b.scores.consensus - a.scores.consensus);

    return NextResponse.json({
      ideas: validatedIdeas,
      searchQueriesUsed: searchQueries,
    });
  } catch (error) {
    console.error("Generation pipeline error:", error);
    return NextResponse.json(
      {
        error: "Generation pipeline failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
