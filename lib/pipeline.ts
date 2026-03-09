import { v4 as uuidv4 } from "uuid";
import { callClaudeJSON } from "./llm/claude";
import { callGeminiJSON } from "./llm/gemini";
import { dualValidate, type DualValidateResult } from "./llm/consensus";
import { getGeneratePrompt } from "./prompts/generate";
import { getMarketPrompt, getCompetitorPrompt, getFeasibilityPrompt } from "./prompts/validate";
import { getMoatPrompt } from "./prompts/moat-analysis";
import { getTrajectoryPrompt } from "./prompts/trajectory";
import { searchWeb, formatSearchResults } from "./search/web-search";
import { loadContextDocs, formatContextChunks } from "./search/context-loader";
import { computeWeightedScore } from "./scoring/rubric";
import { saveIdea } from "./storage";
import type {
  Mode,
  Idea,
  RawIdeaOutput,
  Market,
  Competitor,
  Moat,
  Feasibility,
  Trajectory,
  LLMEvaluation,
} from "./types";

// --- Stage 1: Idea Generation ---

interface GenerationResult {
  ideas: RawIdeaOutput[];
  searchQueries: string[];
  contextDocsUsed: string[];
}

function getSearchQueries(mode: Mode, input: string): string[] {
  switch (mode) {
    case "domain":
      return [
        `${input} AI startups 2025 2026`,
        `${input} market size TAM`,
        `${input} technology trends funding`,
      ];
    case "trend":
      return [
        "AI startups funding 2026 trends",
        "emerging AI technology opportunities",
        "underserved AI verticals whitespace",
      ];
    case "refine":
      return [
        `${input} competitors startups`,
        `${input} market opportunity`,
      ];
  }
}

export async function generateIdeas(
  mode: Mode,
  input: string
): Promise<GenerationResult> {
  // 1. Web search for context
  const searchQueries = getSearchQueries(mode, input);
  const searchResults = await Promise.all(searchQueries.map((q) => searchWeb(q)));
  const searchContext = formatSearchResults(searchResults.flat());

  // 2. Load context docs
  const contextChunks = loadContextDocs();
  const docsContext = formatContextChunks(contextChunks);
  const contextDocsUsed = [...new Set(contextChunks.map((c) => c.source))];

  // 3. Generate ideas from both models in parallel
  const prompt = getGeneratePrompt(mode, input, searchContext, docsContext);

  const [claudeResult, geminiResult] = await Promise.allSettled([
    callClaudeJSON<{ ideas: RawIdeaOutput[] }>(prompt.system, prompt.user),
    callGeminiJSON<{ ideas: RawIdeaOutput[] }>(prompt.system, prompt.user),
  ]);

  const claudeIdeas = claudeResult.status === "fulfilled" ? claudeResult.value.ideas : [];
  const geminiIdeas = geminiResult.status === "fulfilled" ? geminiResult.value.ideas : [];

  if (claudeResult.status === "rejected") console.warn("Claude generation failed:", claudeResult.reason?.message);
  if (geminiResult.status === "rejected") console.warn("Gemini generation failed:", geminiResult.reason?.message);

  if (claudeIdeas.length === 0 && geminiIdeas.length === 0) {
    throw new Error("Both LLMs failed to generate ideas");
  }

  // 4. Merge + deduplicate
  const merged = mergeIdeas(claudeIdeas, geminiIdeas);

  return {
    ideas: merged,
    searchQueries,
    contextDocsUsed,
  };
}

function mergeIdeas(
  claudeIdeas: RawIdeaOutput[],
  geminiIdeas: RawIdeaOutput[]
): RawIdeaOutput[] {
  const all = [...claudeIdeas, ...geminiIdeas];
  const seen = new Set<string>();
  const deduped: RawIdeaOutput[] = [];

  for (const idea of all) {
    // Simple dedup by normalized name
    const key = idea.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(idea);
    }
  }

  // Cap at 3 ideas to keep validation pipeline manageable
  return deduped.slice(0, 3);
}

// --- Stage 2: Validation Pipeline ---

export async function validateIdea(
  rawIdea: RawIdeaOutput,
  mode: Mode,
  searchQueries: string[],
  contextDocsUsed: string[]
): Promise<Idea> {
  const id = uuidv4();
  const ideaDesc = `${rawIdea.oneLiner}\n\n${rawIdea.description}`;

  // Run market + competitor searches against trusted sources only
  const [marketSearchResults, competitorSearchResults] = await Promise.all([
    searchWeb(`${rawIdea.name} market size TAM`, { trustedOnly: true }),
    searchWeb(`${rawIdea.name} competitors startups funding`, { trustedOnly: true }),
  ]);

  const marketSearchContext = formatSearchResults(marketSearchResults);
  const competitorSearchContext = formatSearchResults(competitorSearchResults);

  // Run all 5 validation dimensions via dual-LLM in parallel
  // Each dualValidate = 4 LLM calls, but dimensions are independent
  const marketPrompt = getMarketPrompt(rawIdea.name, ideaDesc, marketSearchContext);
  const competitorPrompt = getCompetitorPrompt(rawIdea.name, ideaDesc, competitorSearchContext);
  const moatPrompt = getMoatPrompt(rawIdea.name, ideaDesc);
  const feasibilityPrompt = getFeasibilityPrompt(rawIdea.name, ideaDesc);
  const trajectoryPrompt = getTrajectoryPrompt(rawIdea.name, ideaDesc);

  const [marketResult, competitorResult, moatResult, feasibilityResult, trajectoryResult] =
    await Promise.all([
      dualValidate(marketPrompt.system, marketPrompt.user),
      dualValidate(competitorPrompt.system, competitorPrompt.user),
      dualValidate(moatPrompt.system, moatPrompt.user),
      dualValidate(feasibilityPrompt.system, feasibilityPrompt.user),
      dualValidate(trajectoryPrompt.system, trajectoryPrompt.user),
    ]);

  // Assemble the validated idea
  const market = extractMarket(marketResult);
  const competitors = extractCompetitors(competitorResult);
  const moat = extractMoat(moatResult);
  const feasibility = extractFeasibility(feasibilityResult);
  const trajectory = extractTrajectory(trajectoryResult);

  // Compute overall consensus from dimension scores
  const claudeOverall = computeWeightedScore({
    market: marketResult.claudeScore,
    competition: competitorResult.claudeScore,
    moat: moatResult.claudeScore,
    feasibility: feasibilityResult.claudeScore,
    trajectory: trajectoryResult.claudeScore,
  });

  const geminiOverall = computeWeightedScore({
    market: marketResult.geminiScore,
    competition: competitorResult.geminiScore,
    moat: moatResult.geminiScore,
    feasibility: feasibilityResult.geminiScore,
    trajectory: trajectoryResult.geminiScore,
  });

  // Aggregate disagreements from all dimensions
  const allDisagreements = [
    ...marketResult.disagreements.map((d) => `[Market] ${d}`),
    ...competitorResult.disagreements.map((d) => `[Competition] ${d}`),
    ...moatResult.disagreements.map((d) => `[Moat] ${d}`),
    ...feasibilityResult.disagreements.map((d) => `[Feasibility] ${d}`),
    ...trajectoryResult.disagreements.map((d) => `[Trajectory] ${d}`),
  ];

  const consensus = Math.round((claudeOverall + geminiOverall) / 2);
  const diff = Math.abs(claudeOverall - geminiOverall);
  const agreement = diff < 15 ? "high" : diff < 30 ? "medium" : "low";

  const idea: Idea = {
    id,
    name: rawIdea.name,
    oneLiner: rawIdea.oneLiner,
    description: rawIdea.description,
    mode,
    generatedBy: "both",
    market,
    competitors,
    moat,
    feasibility,
    trajectory,
    scores: {
      claude: claudeOverall,
      gemini: geminiOverall,
      consensus,
      agreement,
      disagreements: allDisagreements,
    },
    metadata: {
      createdAt: new Date().toISOString(),
      searchQueries,
      contextDocsUsed,
    },
  };

  // Persist
  saveIdea(idea);

  return idea;
}

// --- Data Extractors ---
// These merge Claude and Gemini data, preferring Claude's data as primary
// but using Gemini's if Claude's is missing/invalid

function extractMarket(result: DualValidateResult): Market {
  const data = (result.claudeData || result.geminiData) as Record<string, unknown>;
  return {
    tam: extractMarketEstimate(data, "tam"),
    sam: extractMarketEstimate(data, "sam"),
    som: extractMarketEstimate(data, "som"),
    growthRate: String(data?.growthRate || "Unknown"),
    category: validateEnum(
      String(data?.category || "b2b"),
      ["b2b", "b2c", "b2b2c", "marketplace"],
      "b2b"
    ) as Market["category"],
  };
}

function extractMarketEstimate(
  data: Record<string, unknown>,
  key: string
): Market["tam"] {
  const est = data?.[key] as Record<string, unknown> | undefined;
  return {
    value: String(est?.value || "Unknown"),
    confidence: validateEnum(
      String(est?.confidence || "low"),
      ["high", "medium", "low"],
      "low"
    ) as "high" | "medium" | "low",
    sources: Array.isArray(est?.sources)
      ? (est.sources as string[])
      : [],
  };
}

function extractCompetitors(result: DualValidateResult): Competitor[] {
  const data = (result.claudeData || result.geminiData) as Record<string, unknown>;
  const comps = (data?.competitors || []) as Record<string, unknown>[];

  return comps.slice(0, 8).map((c) => ({
    name: String(c.name || "Unknown"),
    stage: validateEnum(
      String(c.stage || "startup"),
      ["startup", "scaleup", "bigtech", "incumbent"],
      "startup"
    ) as Competitor["stage"],
    threat: validateEnum(
      String(c.threat || "medium"),
      ["high", "medium", "low"],
      "medium"
    ) as Competitor["threat"],
    differentiation: String(c.differentiation || ""),
    funding: c.funding ? String(c.funding) : undefined,
    url: c.url ? String(c.url) : undefined,
  }));
}

function extractMoat(result: DualValidateResult): Moat {
  const data = (result.claudeData || result.geminiData) as Record<string, unknown>;
  return {
    dataNetworkEffects: clampScore(Number(data?.dataNetworkEffects || 5)),
    regulatoryBarrier: clampScore(Number(data?.regulatoryBarrier || 5)),
    domainExpertise: clampScore(Number(data?.domainExpertise || 5)),
    switchingCosts: clampScore(Number(data?.switchingCosts || 5)),
    wontBuildFilter: clampScore(Number(data?.wontBuildFilter || 5)),
    timeToValue: clampScore(Number(data?.timeToValue || 5)),
    overall: clampScore(Number(data?.overall || 5)),
    reasoning: String(data?.reasoning || result.claudeReasoning || ""),
  };
}

function extractFeasibility(result: DualValidateResult): Feasibility {
  const data = (result.claudeData || result.geminiData) as Record<string, unknown>;
  return {
    resourceIntensity: validateEnum(
      String(data?.resourceIntensity || "medium"),
      ["low", "medium", "high"],
      "medium"
    ) as Feasibility["resourceIntensity"],
    techReadiness: validateEnum(
      String(data?.techReadiness || "ready_now"),
      ["ready_now", "ready_3mo", "ready_6mo", "speculative"],
      "ready_now"
    ) as Feasibility["techReadiness"],
    estimatedMvpCost: String(data?.estimatedMvpCost || "Unknown"),
    teamSize: String(data?.teamSize || "Unknown"),
    gtmClarity: clampScore(Number(data?.gtmClarity || 5)),
    revenueModel: String(data?.revenueModel || "Unknown"),
  };
}

function extractTrajectory(result: DualValidateResult): Trajectory {
  const data = (result.claudeData || result.geminiData) as Record<string, unknown>;

  const extractPhase = (key: string): Trajectory["phase1"] => {
    const phase = data?.[key] as Record<string, unknown> | undefined;
    return {
      label: String(phase?.label || "TBD"),
      description: String(phase?.description || ""),
      milestones: Array.isArray(phase?.milestones)
        ? (phase.milestones as string[])
        : [],
    };
  };

  return {
    phase1: extractPhase("phase1"),
    phase2: extractPhase("phase2"),
    phase3: extractPhase("phase3"),
    phase4: extractPhase("phase4"),
  };
}

// --- Utilities ---

function clampScore(n: number): number {
  if (isNaN(n)) return 5;
  return Math.max(1, Math.min(10, Math.round(n)));
}

function validateEnum<T extends string>(
  value: string,
  allowed: T[],
  fallback: T
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}
