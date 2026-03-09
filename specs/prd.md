# Ideate AI — Product Requirements Document

## Overview
Ideate AI is a local Next.js application that generates, refines, and validates AI-era startup ideas using a dual-LLM debate pattern (Claude Sonnet 4.6 + Gemini 2.5 Pro). It combines live web search, user-curated context docs, and structured LLM reasoning to produce investment-grade idea assessments.

## Target User
Solo founders, indie hackers, and small teams evaluating AI startup opportunities.

## Core Features

### F1: Three Generation Modes
- **Domain Explorer**: User provides a theme/vertical, system generates 5-10 ideas within it
- **Trend Scanner**: Autonomous mode — searches current AI news, funding, emerging tech, proposes ideas from whitespace
- **Idea Refiner**: User pitches a rough idea, system pressure-tests and evolves it

### F2: Dual-LLM Debate Engine
- Claude and Gemini evaluate independently
- Each sees the other's reasoning and revises
- Consensus score = average of revised scores
- Agreement level flagged (high/medium/low)
- Key disagreements highlighted

### F3: Structured Validation Pipeline
Each idea validated across 5 dimensions:
1. Market Sizing (TAM/SAM/SOM with sources)
2. Competitive Landscape (threats categorized by stage/level)
3. Moat Analysis (6 dimensions scored 1-10)
4. Feasibility Check (resources, tech readiness, GTM, revenue model)
5. Growth Trajectory (4-phase roadmap)

### F4: Results Dashboard
- Sortable table of all generated ideas
- Color-coded scores (green/amber/red)
- Click-through to detailed drill-down

### F5: Idea Drill-Down View
- Overview with badges
- Market cards with TAM/SAM/SOM
- Competitor table with threat levels
- Moat dimension bars
- Feasibility cards
- Trajectory timeline (4 phases)
- LLM consensus comparison
- Key disagreements

### F6: Web Search Integration
- Tavily API for real-time market intelligence
- Search results fed as context to LLM prompts

### F7: Context Documents
- User drops research docs (markdown, text) into context-docs/
- Loaded and chunked at runtime
- Fed to LLM prompts for enriched generation

## Non-Functional Requirements
- Local-only (no auth, no cloud DB)
- Flat file JSON storage (data/ideas.json)
- Dark theme, Bloomberg-terminal-meets-Notion aesthetic
- Streaming for long-running validations
- Graceful handling of missing API keys

## Out of Scope (v0.1)
- User accounts / auth
- Database (Postgres, etc.)
- Deployment / hosting
- PDF context doc parsing
- Export to markdown
- Re-run validation on single idea
