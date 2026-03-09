import { callClaudeJSON } from "./claude";
import { callGeminiJSON } from "./gemini";
import type { LLMEvaluation, ConsensusResult, Agreement } from "@/lib/types";

function computeAgreement(score1: number, score2: number): Agreement {
  const diff = Math.abs(score1 - score2);
  if (diff < 15) return "high";
  if (diff < 30) return "medium";
  return "low";
}

function extractDisagreements(
  claude: LLMEvaluation,
  gemini: LLMEvaluation
): string[] {
  const disagreements: string[] = [];

  const scoreDiff = Math.abs(claude.score - gemini.score);
  if (scoreDiff >= 15) {
    const higher = claude.score > gemini.score ? "Claude" : "Gemini";
    const lower = claude.score > gemini.score ? "Gemini" : "Claude";
    disagreements.push(
      `${higher} scored ${scoreDiff} points higher than ${lower}`
    );
  }

  // Compare key reasoning differences
  if (claude.reasoning && gemini.reasoning) {
    if (
      (claude.score >= 70 && gemini.score < 50) ||
      (gemini.score >= 70 && claude.score < 50)
    ) {
      disagreements.push(
        `Fundamental disagreement: one model is bullish while the other is bearish`
      );
    }
  }

  return disagreements;
}

export interface DualValidateResult extends ConsensusResult {
  claudeData: Record<string, unknown>;
  geminiData: Record<string, unknown>;
  claudeReasoning: string;
  geminiReasoning: string;
}

function singleModelResult(eval_: LLMEvaluation, model: "claude" | "gemini"): DualValidateResult {
  return {
    claudeScore: model === "claude" ? eval_.score : 0,
    geminiScore: model === "gemini" ? eval_.score : 0,
    consensus: eval_.score,
    agreement: "high" as Agreement,
    disagreements: [`Only ${model === "claude" ? "Claude" : "Gemini"} was available for this evaluation`],
    claudeData: model === "claude" ? eval_.data : {},
    geminiData: model === "gemini" ? eval_.data : {},
    claudeReasoning: model === "claude" ? eval_.reasoning : "",
    geminiReasoning: model === "gemini" ? eval_.reasoning : "",
  };
}

export async function dualValidate(
  systemPrompt: string,
  userPrompt: string,
  counterPointPrefix?: string
): Promise<DualValidateResult> {
  // Round 1: Independent evaluation
  const [claudeR1Result, geminiR1Result] = await Promise.allSettled([
    callClaudeJSON<LLMEvaluation>(systemPrompt, userPrompt),
    callGeminiJSON<LLMEvaluation>(systemPrompt, userPrompt),
  ]);

  const claudeR1 = claudeR1Result.status === "fulfilled" ? claudeR1Result.value : null;
  const geminiR1 = geminiR1Result.status === "fulfilled" ? geminiR1Result.value : null;

  if (claudeR1Result.status === "rejected") console.warn("Claude R1 failed:", claudeR1Result.reason?.message);
  if (geminiR1Result.status === "rejected") console.warn("Gemini R1 failed:", geminiR1Result.reason?.message);

  // If both failed, throw
  if (!claudeR1 && !geminiR1) {
    throw new Error("Both LLMs failed during validation");
  }

  // If only one succeeded, return single-model result (skip round 2)
  if (!claudeR1) return singleModelResult(geminiR1!, "gemini");
  if (!geminiR1) return singleModelResult(claudeR1, "claude");

  const cpPrefix = counterPointPrefix || "Another analyst provided this assessment";

  // Round 2: Cross-pollination — each sees the other's reasoning
  const [claudeR2Result, geminiR2Result] = await Promise.allSettled([
    callClaudeJSON<LLMEvaluation>(
      systemPrompt,
      `${userPrompt}\n\n${cpPrefix}: "${geminiR1.reasoning}"\n\nConsider this perspective, then provide your revised evaluation. You may adjust your score and reasoning.`
    ),
    callGeminiJSON<LLMEvaluation>(
      systemPrompt,
      `${userPrompt}\n\n${cpPrefix}: "${claudeR1.reasoning}"\n\nConsider this perspective, then provide your revised evaluation. You may adjust your score and reasoning.`
    ),
  ]);

  // Fall back to R1 if R2 fails
  const claudeR2 = claudeR2Result.status === "fulfilled" ? claudeR2Result.value : claudeR1;
  const geminiR2 = geminiR2Result.status === "fulfilled" ? geminiR2Result.value : geminiR1;

  return {
    claudeScore: claudeR2.score,
    geminiScore: geminiR2.score,
    consensus: Math.round((claudeR2.score + geminiR2.score) / 2),
    agreement: computeAgreement(claudeR2.score, geminiR2.score),
    disagreements: extractDisagreements(claudeR2, geminiR2),
    claudeData: claudeR2.data,
    geminiData: geminiR2.data,
    claudeReasoning: claudeR2.reasoning,
    geminiReasoning: geminiR2.reasoning,
  };
}

// Simpler version: single-round evaluation from both models (no debate), for speed
export async function dualEvaluate(
  systemPrompt: string,
  userPrompt: string
): Promise<DualValidateResult> {
  const [claudeSettled, geminiSettled] = await Promise.allSettled([
    callClaudeJSON<LLMEvaluation>(systemPrompt, userPrompt),
    callGeminiJSON<LLMEvaluation>(systemPrompt, userPrompt),
  ]);

  const claudeResult = claudeSettled.status === "fulfilled" ? claudeSettled.value : null;
  const geminiResult = geminiSettled.status === "fulfilled" ? geminiSettled.value : null;

  if (!claudeResult && !geminiResult) throw new Error("Both LLMs failed during evaluation");
  if (!claudeResult) return singleModelResult(geminiResult!, "gemini");
  if (!geminiResult) return singleModelResult(claudeResult, "claude");

  return {
    claudeScore: claudeResult.score,
    geminiScore: geminiResult.score,
    consensus: Math.round((claudeResult.score + geminiResult.score) / 2),
    agreement: computeAgreement(claudeResult.score, geminiResult.score),
    disagreements: extractDisagreements(claudeResult, geminiResult),
    claudeData: claudeResult.data,
    geminiData: geminiResult.data,
    claudeReasoning: claudeResult.reasoning,
    geminiReasoning: geminiResult.reasoning,
  };
}
