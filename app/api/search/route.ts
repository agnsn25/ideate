import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    // TODO: Implement Serper/Tavily web search
    return NextResponse.json({
      results: [],
      message: `Search not yet implemented. Query: ${query}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
