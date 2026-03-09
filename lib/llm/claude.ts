import Anthropic from "@anthropic-ai/sdk";

const LLM_TIMEOUT_MS = 60_000; // 60s per call

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

export async function callClaude(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await withTimeout(
    client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
    LLM_TIMEOUT_MS,
    "Claude API call",
  );

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}

export async function callClaudeJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const response = await callClaude(
    systemPrompt + "\n\nYou MUST respond with valid JSON only. No markdown, no explanation, just JSON.",
    userPrompt
  );

  // Strip markdown code fences if present
  const cleaned = response.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "");
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Claude returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }
}
