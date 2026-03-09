# Ideate AI — Phased Implementation Plan

## Phase 1: Scaffold + Core Types (Session 1)
- [x] Initialize Next.js 14 app with TypeScript, Tailwind, App Router
- [x] Set up full file structure from architecture doc
- [x] Create all TypeScript interfaces in lib/types.ts
- [x] Set up .env.local template with API key placeholders
- [x] Create CLAUDE.md with project context
- [x] Create stub pages: landing, generate, results, idea detail
- [x] Create API route stubs: generate, validate, search, context
- [x] Create LLM client stubs: claude.ts, gemini.ts, consensus.ts
- [x] Create prompt templates: generate.ts, validate.ts, moat-analysis.ts, trajectory.ts
- [x] Create search utilities: web-search.ts, context-loader.ts
- [x] Create scoring rubric: rubric.ts
- [x] Create spec documents

## Phase 2: LLM Clients + Debate Engine (Session 2)
- [x] Implement Claude client with JSON output parsing
- [x] Implement Gemini client with JSON output parsing
- [x] Build dual-LLM debate/consensus engine (with data passthrough)
- [x] Wire prompt templates to return structured JSON
- [x] Build full pipeline orchestrator (lib/pipeline.ts)
- [x] Build storage layer (lib/storage.ts) for idea persistence
- [x] Wire API routes to real pipeline (/api/generate, /api/validate)
- [x] Add /api/ideas and /api/ideas/[id] for data loading
- [x] Wire UI pages to API endpoints (results, idea detail, generate)
- [x] Add pipeline progress indicator to generate page
- [ ] Test with a hardcoded idea end-to-end (needs API keys)

## Phase 3: Search + Context Pipeline (Session 3)
- [x] Implement Tavily web search API wrapper
- [x] Implement context doc loader (done in Session 1)
- [x] Wire search + context into validation pipeline (done in Session 2)
- [ ] Test search results flowing into prompts (needs API keys)

## Phase 4: API Routes (Session 4)
- [x] Build /api/generate — full generation pipeline (all 3 modes)
- [x] Build /api/validate — orchestrate full validation for one idea
- [x] Build /api/search — web search proxy
- [x] Build /api/context — context doc loading
- [ ] Add streaming support for long-running validations
- [x] Wire idea persistence to data/ideas.json

## Phase 5: UI — Results Table + Generation View (Session 5)
- [x] Build results table page with sorting, filtering, color-coded scores
- [x] Build generation page with mode selector and input forms
- [x] Wire to API routes
- [x] Dark theme with sharp accent colors

## Phase 6: UI — Drill-Down View (Session 6)
- [x] Build idea detail page: overview, market, competitors
- [ ] Moat radar chart (recharts)
- [x] Feasibility cards
- [x] Trajectory timeline visualization
- [x] LLM consensus comparison
- [ ] Raw reasoning expandable sections

## Phase 7: Polish + Edge Cases (Session 7)
- [x] Error handling and loading states (generate page)
- [ ] Retry logic for API failures
- [ ] Re-run validation on a single idea
- [ ] Export to markdown
- [ ] End-to-end testing with real API keys
