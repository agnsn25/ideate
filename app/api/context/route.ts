import { NextResponse } from "next/server";

export async function GET() {
  try {
    // TODO: Load and chunk context docs from context-docs/
    return NextResponse.json({
      chunks: [],
      message: "Context loading not yet implemented",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load context" },
      { status: 500 }
    );
  }
}
