import type { Mode } from "@/lib/types";

const SYSTEM_PROMPT = `You are an expert startup analyst and venture strategist specializing in AI-era opportunities. You identify high-potential startup ideas by analyzing market gaps, emerging technology capabilities, and underserved verticals.

CRITICAL: Only propose ideas with durable competitive moats. Every idea MUST have a clear answer to: "Why can't a big tech company with massive distribution just replicate this in 6 months?" Strong moats include: proprietary data flywheels, deep domain expertise, regulatory barriers, high switching costs, network effects, or compounding data advantages. If an idea is just a thin wrapper on a foundation model, discard it.`;

export function getGeneratePrompt(
  mode: Mode,
  input: string,
  searchContext: string,
  docsContext: string
): { system: string; user: string } {
  const contextBlock = [
    searchContext ? `## Current Market Intelligence\n${searchContext}` : "",
    docsContext ? `## Additional Research Context\n${docsContext}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  switch (mode) {
    case "domain":
      return {
        system: SYSTEM_PROMPT,
        user: `Generate 5-8 AI-powered startup ideas in the "${input}" domain.

${contextBlock}

For each idea, provide:
- name: A concise, memorable name
- oneLiner: A single sentence pitch
- description: 2-3 sentences explaining the concept, target customer, and value proposition

Respond with JSON: { "ideas": [{ "name": string, "oneLiner": string, "description": string }] }`,
      };

    case "trend":
      return {
        system: SYSTEM_PROMPT,
        user: `Analyze current AI trends, recent funding patterns, and emerging technology capabilities to identify 5-8 startup opportunities in whitespace areas that most people are missing.

${contextBlock}

${input ? `Focus areas or constraints: ${input}` : ""}

Look for:
- Underserved verticals where AI adoption is lagging
- New capabilities enabled by recent model improvements
- Regulatory or market shifts creating new needs
- Gaps between what big tech builds and what specific industries need

For each idea, provide:
- name: A concise, memorable name
- oneLiner: A single sentence pitch
- description: 2-3 sentences explaining the concept, target customer, and value proposition

Respond with JSON: { "ideas": [{ "name": string, "oneLiner": string, "description": string }] }`,
      };

    case "refine":
      return {
        system: SYSTEM_PROMPT,
        user: `A founder has this rough startup idea: "${input}"

${contextBlock}

Your job is to:
1. Strengthen and refine the core concept
2. Identify the sharpest possible wedge / beachhead
3. Generate 3-5 variations or pivots of this idea that could be even stronger

For each variation (including the refined original), provide:
- name: A concise, memorable name
- oneLiner: A single sentence pitch
- description: 2-3 sentences explaining the concept, target customer, and value proposition

Respond with JSON: { "ideas": [{ "name": string, "oneLiner": string, "description": string }] }`,
      };
  }
}
