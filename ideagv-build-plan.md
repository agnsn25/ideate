# Ideate AI — AI Startup Idea Generator + Validator

## Build Plan for Claude Code

---

## 1. What You're Building

A local Next.js app that generates, refines, and rigorously validates AI-era startup ideas using a **dual-LLM debate pattern** (Claude Sonnet 4.6 + Gemini 3 Pro). It combines live web search, your own context docs, and structured LLM reasoning to produce investment-grade idea assessments.

### Three Modes
1. **Domain Explorer** — You provide a theme/vertical (e.g., "healthcare compliance"), it generates 5-10 ideas within it
2. **Trend Scanner** — Autonomous mode. Searches current AI news, funding rounds, emerging tech, regulatory shifts, then proposes ideas from whitespace it finds
3. **Idea Refiner** — You pitch a rough idea, it pressure-tests and evolves it

---

## 2. Architecture

```
ideate-ai/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout, dark theme, nav
│   ├── page.tsx                  # Landing / mode selector
│   ├── generate/
│   │   └── page.tsx              # Idea generation UI (all 3 modes)
│   ├── results/
│   │   └── page.tsx              # Tabulated results view
│   ├── idea/[id]/
│   │   └── page.tsx              # Drill-down per idea
│   └── api/
│       ├── generate/route.ts     # Idea generation endpoint
│       ├── validate/route.ts     # Validation pipeline endpoint
│       ├── search/route.ts       # Web search proxy (Serper/Tavily)
│       └── context/route.ts      # RAG over your context docs
├── lib/
│   ├── llm/
│   │   ├── claude.ts             # Claude Sonnet 4.6 client
│   │   ├── gemini.ts             # Gemini 3 Pro client
│   │   └── consensus.ts          # Dual-LLM debate + merge logic
│   ├── prompts/
│   │   ├── generate.ts           # Generation prompt templates (per mode)
│   │   ├── validate.ts           # Validation prompt templates
│   │   ├── moat-analysis.ts      # Moat/defensibility scoring
│   │   └── trajectory.ts         # Growth trajectory prompts
│   ├── search/
│   │   ├── web-search.ts         # Serper or Tavily API wrapper
│   │   └── context-loader.ts     # Load + chunk your context docs
│   ├── scoring/
│   │   └── rubric.ts             # Scoring rubric definitions
│   └── types.ts                  # TypeScript interfaces
├── context-docs/                 # YOUR curated docs go here
│   └── README.md                 # Instructions on what to add
├── data/
│   └── ideas.json                # Persisted results (local JSON)
├── .env.local                    # API keys
└── CLAUDE.md                     # Claude Code project instructions
```

---

## 3. The Pipeline (Core Logic)

### Stage 1: Idea Generation

```
Input (mode-dependent)
  → Web Search (current AI trends, funding, gaps)
  → Context Docs (your research, reports)
  → LLM #1 (Claude): Generate 5-10 raw ideas
  → LLM #2 (Gemini): Independently generate 5-10 raw ideas
  → Merge + Deduplicate → Ranked shortlist of ~8 ideas
```

### Stage 2: Validation (per idea)

Each idea runs through a structured validation:

```
For each idea:
  ├─ Market Sizing
  │   ├─ Claude: estimates TAM/SAM/SOM with reasoning
  │   ├─ Gemini: estimates TAM/SAM/SOM with reasoning
  │   └─ Web Search: verify with real market data
  │
  ├─ Competitive Landscape
  │   ├─ Web Search: find competitors (startups + incumbents)
  │   ├─ Claude: categorize by threat level, stage, approach
  │   └─ Gemini: second opinion on competitive dynamics
  │
  ├─ Moat Analysis (scored 1-10 on each dimension)
  │   ├─ Data network effects
  │   ├─ Regulatory complexity (barrier = good)
  │   ├─ Domain expertise depth
  │   ├─ Switching costs
  │   ├─ "Won't build" filter (too niche/messy for Big Tech)
  │   └─ Time-to-value advantage
  │
  ├─ Feasibility Check
  │   ├─ Resource intensity (capital, team, infra)
  │   ├─ Technical feasibility NOW vs 3-6 months
  │   ├─ Go-to-market clarity
  │   └─ Revenue model strength
  │
  ├─ Trajectory Vision
  │   ├─ Phase 1: MVP / wedge (0-6 months)
  │   ├─ Phase 2: Expand (6-18 months)
  │   ├─ Phase 3: Platform/moat lock-in (18-36 months)
  │   └─ Phase 4: Endgame vision (3-5 years)
  │
  └─ Dual-LLM Consensus Score
      ├─ Claude overall score (0-100)
      ├─ Gemini overall score (0-100)
      ├─ Agreement level (high/medium/low)
      └─ Key disagreements flagged
```

### Stage 3: Output

Results stored in `data/ideas.json` and rendered in the UI.

---

## 4. Key Data Models

```typescript
interface Idea {
  id: string;
  name: string;
  oneLiner: string;
  description: string;
  mode: 'domain' | 'trend' | 'refine';
  generatedBy: 'claude' | 'gemini' | 'both';

  // Validation Results
  market: {
    tam: { value: string; confidence: 'high' | 'medium' | 'low'; sources: string[] };
    sam: { value: string; confidence: string; sources: string[] };
    som: { value: string; confidence: string; sources: string[] };
    growthRate: string;
    category: 'b2b' | 'b2c' | 'b2b2c' | 'marketplace';
  };

  competitors: {
    name: string;
    stage: 'startup' | 'scaleup' | 'bigtech' | 'incumbent';
    threat: 'high' | 'medium' | 'low';
    differentiation: string;
    funding?: string;
    url?: string;
  }[];

  moat: {
    dataNetworkEffects: number;     // 1-10
    regulatoryBarrier: number;
    domainExpertise: number;
    switchingCosts: number;
    wontBuildFilter: number;        // How unlikely big tech builds this
    timeToValue: number;
    overall: number;
    reasoning: string;
  };

  feasibility: {
    resourceIntensity: 'low' | 'medium' | 'high';
    techReadiness: 'ready_now' | 'ready_3mo' | 'ready_6mo' | 'speculative';
    estimatedMvpCost: string;
    teamSize: string;
    gtmClarity: number;            // 1-10
    revenueModel: string;
  };

  trajectory: {
    phase1: { label: string; description: string; milestones: string[] };
    phase2: { label: string; description: string; milestones: string[] };
    phase3: { label: string; description: string; milestones: string[] };
    phase4: { label: string; description: string; milestones: string[] };
  };

  scores: {
    claude: number;                 // 0-100
    gemini: number;                 // 0-100
    consensus: number;              // averaged
    agreement: 'high' | 'medium' | 'low';
    disagreements: string[];
  };

  metadata: {
    createdAt: string;
    searchQueries: string[];
    contextDocsUsed: string[];
  };
}
```

---

## 5. Dual-LLM Debate Pattern

This is the core differentiator. Instead of trusting one model:

```typescript
// lib/llm/consensus.ts

async function dualValidate(idea: string, dimension: string) {
  // 1. Both models evaluate independently
  const [claudeResult, geminiResult] = await Promise.all([
    claudeEvaluate(idea, dimension),
    geminiEvaluate(idea, dimension),
  ]);

  // 2. Feed each model the other's reasoning
  const claudeRevised = await claudeEvaluate(idea, dimension, {
    counterpoint: geminiResult.reasoning
  });
  const geminiRevised = await geminiEvaluate(idea, dimension, {
    counterpoint: claudeResult.reasoning
  });

  // 3. Compute consensus
  return {
    claudeScore: claudeRevised.score,
    geminiScore: geminiRevised.score,
    consensus: (claudeRevised.score + geminiRevised.score) / 2,
    agreement: Math.abs(claudeRevised.score - geminiRevised.score) < 15
      ? 'high' : Math.abs(claudeRevised.score - geminiRevised.score) < 30
      ? 'medium' : 'low',
    disagreements: extractDisagreements(claudeRevised, geminiRevised),
  };
}
```

This gives you:
- **Reduced hallucination** — claims validated by 2 different model families
- **Richer analysis** — models catch each other's blind spots
- **Confidence signal** — high agreement = higher conviction

---

## 6. UI Views

### A. Results Table View (`/results`)
| Rank | Idea | TAM | Moat | Feasibility | Consensus | Agreement |
|------|------|-----|------|-------------|-----------|-----------|
| 1 | ... | $12B | 8.2 | Low resource | 87 | High ✅ |
| 2 | ... | $5B | 6.5 | Medium | 72 | Medium ⚠️ |

- Sortable by any column
- Color-coded scores (green/yellow/red)
- Click any row → drill-down

### B. Idea Drill-Down (`/idea/[id]`)
Sections:
1. **Overview** — name, one-liner, description, generated-by badge
2. **Market** — TAM/SAM/SOM cards with source links, B2B/B2C badge
3. **Competitors** — table with threat-level badges, expandable details
4. **Moat Radar** — spider/radar chart of 6 moat dimensions
5. **Feasibility** — resource cards, tech readiness timeline
6. **Trajectory** — horizontal timeline visualization (4 phases)
7. **LLM Consensus** — side-by-side Claude vs Gemini scores, disagreement highlights
8. **Raw Reasoning** — expandable sections showing each model's full analysis

### C. Generation View (`/generate`)
- Mode selector (3 cards)
- Input area (domain text, or rough idea, or "go autonomous")
- Optional: upload context docs
- Progress indicator showing pipeline stages
- Live streaming of partial results

---

## 7. Claude Code Session Plan

Here's the exact sequence of prompts to feed Claude Code:

### Session 1: Scaffold + Core Types
```
Initialize a Next.js 14 app with TypeScript, Tailwind, and App Router.
Set up the file structure from the architecture doc.
Create all TypeScript interfaces in lib/types.ts.
Set up .env.local template with ANTHROPIC_API_KEY, GEMINI_API_KEY,
SEARCH_API_KEY placeholders. Create the CLAUDE.md with project context.
```

### Session 2: LLM Clients + Debate Engine
```
Build lib/llm/claude.ts and lib/llm/gemini.ts as API wrappers.
Build lib/llm/consensus.ts implementing the dual-LLM debate pattern.
Build all prompt templates in lib/prompts/ — generate.ts, validate.ts,
moat-analysis.ts, trajectory.ts. Make prompts structured to return JSON.
Test with a hardcoded idea.
```

### Session 3: Search + Context Pipeline
```
Build lib/search/web-search.ts using Serper (or Tavily) API.
Build lib/search/context-loader.ts to read markdown/PDF files from
context-docs/ directory, chunk them, and make them available as
context for prompts. Wire into the validation pipeline.
```

### Session 4: API Routes
```
Build all API routes: /api/generate, /api/validate, /api/search,
/api/context. The generate route should support all 3 modes.
The validate route should orchestrate the full pipeline for one idea.
Add streaming support for long-running validations.
```

### Session 5: UI — Results Table + Generation View
```
Build the results table page with sorting, filtering, color-coded
scores. Build the generation page with mode selector and input forms.
Wire to API routes. Use a dark theme with sharp accent colors.
```

### Session 6: UI — Drill-Down View
```
Build the idea detail page with all sections: overview, market,
competitors table, moat radar chart (use recharts), feasibility,
trajectory timeline, LLM consensus comparison, raw reasoning.
Make it visually dense but scannable.
```

### Session 7: Polish + Edge Cases
```
Add error handling, loading states, retry logic for API failures.
Add ability to re-run validation on a single idea.
Add export to markdown. Test end-to-end with real API keys.
```

---

## 8. API Keys You'll Need

| Service | Purpose | Get it at |
|---------|---------|-----------|
| Anthropic | Claude Sonnet 4.6 | console.anthropic.com |
| Google AI | Gemini 3 Pro | aistudio.google.com |
| Serper | Web search API | serper.dev (2500 free searches) |
| *Alt: Tavily* | *Web search API* | *tavily.com (1000 free)* |

---

## 9. CLAUDE.md (for Claude Code context)

```markdown
# Ideate AI — Project Context

## What this is
AI startup idea generator + validator using dual-LLM consensus
(Claude Sonnet 4.6 + Gemini 3 Pro) with web search and context docs.

## Tech stack
- Next.js 14, TypeScript, Tailwind CSS, App Router
- Recharts for data viz
- Anthropic SDK + Google Generative AI SDK
- Serper API for web search

## Key patterns
- Dual-LLM debate: both models evaluate independently, then
  see each other's reasoning and revise. Consensus score = average.
- All LLM calls return structured JSON (prompted explicitly).
- Validation pipeline runs in stages: market → competitors →
  moat → feasibility → trajectory → consensus.
- Results persisted to data/ideas.json (local, no DB needed).

## Design direction
- Dark theme, editorial/data-dense aesthetic
- Think Bloomberg terminal meets Notion
- Sharp accent colors for scores (green/amber/red)
- Monospace for data, sans-serif for prose

## Important constraints
- No database — flat file JSON storage
- No auth — local tool
- Streaming for long validations
- All prompts in lib/prompts/ as template functions
- Context docs loaded from context-docs/ directory at runtime
```

---

## 10. What to Put in context-docs/

Seed it with:
- AI industry reports (State of AI, a16z market maps)
- Your own notes on gaps you've observed at Deposco / in supply chain
- Recent funding round summaries (from Crunchbase exports, newsletters)
- Any "anti-portfolio" lists or "ideas I wish existed" notes
- Regulatory landscape summaries for verticals you care about

The more opinionated your context docs, the better the outputs.
