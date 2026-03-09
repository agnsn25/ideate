# Ideate AI

AI startup idea generator and validator powered by a dual-LLM debate engine (Claude + Gemini). Two models evaluate every idea independently, then cross-examine each other's reasoning to produce consensus scores you can actually trust.

## Why two LLMs?

Single-model outputs are unreliable — they hallucinate market sizes, miss competitors, and tend toward sycophantic validation. By running Claude and Gemini independently and then having them critique each other, disagreements surface genuine uncertainty and agreements carry higher confidence. Think of it as two independent analysts reviewing the same investment thesis.

## What it does

- **Generate ideas** across three modes: Domain Explorer (themed), Trend Scanner (autonomous), and Idea Refiner (pressure-test your pitch)
- **Validate each idea** across 5 structured dimensions: Market Sizing, Competitive Landscape, Moat Analysis, Feasibility, and Growth Trajectory
- **Dual-LLM consensus** — both models score independently, see each other's reasoning, then revise. Consensus score = average of revised scores, with agreement level and key disagreements highlighted
- **Live web search** via Tavily API for real-time market intelligence
- **Context docs** — drop your own research into `context-docs/` to enrich generation

## Tech stack

- Next.js (App Router), TypeScript, Tailwind CSS
- Anthropic SDK (Claude Sonnet 4.6) + Google Generative AI SDK (Gemini 3 Pro)
- Tavily API for web search
- Recharts for data visualization
- Flat-file JSON storage (no database needed)

## Getting started

### Prerequisites

You'll need API keys for:
- [Anthropic](https://console.anthropic.com/) (Claude)
- [Google AI Studio](https://aistudio.google.com/) (Gemini)
- [Tavily](https://tavily.com/) (web search)

### Setup

```bash
# Clone the repo
git clone https://github.com/agnsn25/ideate.git
cd ideate

# Install dependencies
npm install

# Add your API keys to .env.local
cp .env.example .env.local
# Then edit .env.local with your keys:
#   ANTHROPIC_API_KEY=sk-ant-...
#   GOOGLE_AI_API_KEY=...
#   TAVILY_API_KEY=tvly-...

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start generating ideas.

## Project structure

```
app/                  → Next.js pages and API routes
  api/generate/       → Idea generation endpoint
  api/validate/       → Validation pipeline endpoint
  api/ideas/          → CRUD for saved ideas
  generate/           → Generation UI
  results/            → Results dashboard
  idea/[id]/          → Idea drill-down view

lib/
  llm/                → Claude, Gemini, and consensus engine
  prompts/            → Prompt templates for each pipeline stage
  scoring/            → Weighted scoring rubric
  search/             → Tavily web search + context doc loader
  pipeline.ts         → Main orchestrator
  storage.ts          → Flat-file JSON persistence
  types.ts            → Shared TypeScript types

context-docs/         → Drop research docs here for enriched generation
data/ideas.json       → Local idea storage
specs/                → Design docs (PRD, thesis, architecture, roadmap)
```

## How the validation pipeline works

1. **Market sizing** — TAM/SAM/SOM estimates with sources
2. **Competitive landscape** — threats categorized by stage and level
3. **Moat analysis** — 6 dimensions scored 1–10
4. **Feasibility check** — resources, tech readiness, GTM, revenue model
5. **Growth trajectory** — 4-phase roadmap

Each dimension runs through the dual-LLM debate: independent evaluation → cross-examination → revised consensus.

## License

MIT
