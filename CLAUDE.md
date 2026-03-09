# Ideate AI — Project Context

## What this is
AI startup idea generator + validator using dual-LLM consensus
(Claude Sonnet 4.6 + Gemini 3 Pro) with web search and context docs.

## Tech stack
- Next.js 14, TypeScript, Tailwind CSS, App Router
- Recharts for data viz
- Anthropic SDK + Google Generative AI SDK
- Tavily API for web search

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