# Ideate AI — Future Work

## Deferred Features
- PDF context doc parsing (mentioned in build plan but deferred to keep scope tight)
- Export ideas to markdown format
- Re-run validation on a single idea (re-validate with fresh search data)
- Moat radar/spider chart using Recharts (visual, deferred to Phase 6)
- Context doc upload from the UI (currently requires dropping files into context-docs/)
- Comparison view: side-by-side comparison of 2-3 ideas
- History tracking: see how ideas evolve across validation runs
- Custom scoring weights: let users adjust dimension weights

## Pipeline Stability Improvements (implement IF crashes re-occur)

The pipeline currently runs 102 LLM calls (5 ideas x 5 dimensions x 2 rounds x 2 models + generation). As of 2026-03-06, it's working but has historically crashed mid-run. If the issue returns, implement these three changes in order:

### A: Conditional Round 2 — skip debate when models agree
- In `lib/llm/consensus.ts`, `dualValidate()`: after Round 1, check score gap. If < 15 points, skip Round 2 (the debate/revision round) and return R1 results directly.
- Saves ~30-50% of LLM calls with zero quality loss — debate only adds value on genuine disagreement.

### B: Per-call timeouts + per-idea error isolation — DONE (2026-03-07)
- 60s timeout on Claude calls, 90s on Gemini (slower model). 15s on Tavily.
- Per-idea 2min timeout + try/catch in route.ts — failed ideas are skipped, partial results returned.
- JSON parse failures now caught gracefully instead of crashing.

### C: Streaming/SSE responses
- Rewrite `app/api/generate/route.ts` to use Server-Sent Events (ReadableStream + TextEncoder).
- Events: `stage` (real pipeline progress), `idea` (each validated idea as it completes), `error` (per-idea non-fatal), `done` (summary).
- Rewrite `app/generate/page.tsx` to consume SSE stream — show ideas appearing live, replace fake timer-based progress with real events.
- Partial results survive mid-pipeline failures.

### D (contingency): Gemini Flash fallback
- If latency is the bottleneck, try `gemini-3-flash-preview` (8x cheaper, designed for low-latency high-volume). Quality gap may be negligible for structured rubric-based evaluation.
- Hybrid option: Flash for R1, Pro for R2 debate only.

### E: Re-parallelize dimensions — DONE (2026-03-07)
- 5 validation dimensions now run in parallel via Promise.all per idea.
- Ideas capped at 3 (down from 5) to keep total concurrent calls manageable.

## Search Provider Diversification

Currently using Tavily (free plan) as the sole web search provider. If we hit the monthly API limit, explore adding fallback/alternative providers:

- **Perplexity API** — returns synthesized answers with citations, could replace raw search for market sizing queries where we want a distilled answer rather than 10 raw snippets
- **Serper API** — Google SERP scraping, cheap and fast, good fallback for broad queries
- **Exa** — semantic/neural search, strong for finding similar companies and research papers
- **SerpAPI** — another Google SERP option with structured data extraction

Implementation approach: abstract `searchWeb()` behind a provider interface so we can swap or round-robin between providers based on quota. The `trustedOnly` domain filtering and `days` recency params would need to be mapped to each provider's equivalent.

Priority: low (only matters when we hit Tavily free tier limits). Revisit if monthly usage consistently exceeds the cap.

## Gemini Model Migration Note
- Migrated to `gemini-3.1-pro-preview` on 2026-03-07 (previous `gemini-3-pro-preview` was discontinuing).
- Gemini timeout set to 90s (vs 60s for Claude) since Pro models are slower.
- Consider `gemini-3-flash-preview` for speed if latency becomes an issue again (see D above).
