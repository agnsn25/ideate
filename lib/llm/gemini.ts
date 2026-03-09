import { GoogleGenerativeAI } from "@google/generative-ai";

const LLM_TIMEOUT_MS = 90_000; // 90s per call — Gemini Pro models are slower

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

export async function callGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-pro-preview",
    systemInstruction: systemPrompt,
  });

  const result = await withTimeout(
    model.generateContent(userPrompt),
    LLM_TIMEOUT_MS,
    "Gemini API call",
  );
  return result.response.text();
}

export async function callGeminiJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const response = await callGemini(
    systemPrompt + "\n\nYou MUST respond with valid JSON only. No markdown, no explanation, just JSON.",
    userPrompt
  );

  const cleaned = response.replace(/^```(?:json)?\s*\n?/m, "").replace(/\n?```\s*$/m, "");
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }
}
