# Ideate AI — Architecture Diagram

```
                              ┌──────────────────────────────┐
                              │         BROWSER (UI)         │
                              │                              │
                              │  ┌────────┐ ┌──────────────┐│
                              │  │Landing │ │  Generate     ││
                              │  │  Page  │ │  Page         ││
                              │  └────────┘ └──────┬───────┘│
                              │                    │        │
                              │  ┌────────────┐ ┌──┴───────┐│
                              │  │  Results   │ │  Idea    ││
                              │  │  Table     │ │  Detail  ││
                              │  └────────────┘ └──────────┘│
                              └─────────────┬────────────────┘
                                            │ HTTP
                              ┌─────────────▼────────────────┐
                              │     NEXT.JS API ROUTES       │
                              │                              │
                              │  /api/generate   POST        │
                              │  /api/validate   POST        │
                              │  /api/search     POST        │
                              │  /api/context    GET         │
                              └──┬───────┬───────┬───────────┘
                                 │       │       │
                    ┌────────────▼─┐  ┌──▼────┐  ├──────────────┐
                    │   LLM Layer  │  │Search │  │Context Loader│
                    │              │  │Layer  │  │              │
                    │ ┌──────────┐ │  │       │  │ context-docs/│
                    │ │ Claude   │ │  │Tavily │  │  *.md, *.txt │
                    │ │ Client   │ │  │  API  │  │              │
                    │ └──────────┘ │  └───────┘  └──────────────┘
                    │ ┌──────────┐ │
                    │ │ Gemini   │ │
                    │ │ Client   │ │
                    │ └──────────┘ │
                    │ ┌──────────┐ │
                    │ │Consensus │ │
                    │ │ Engine   │ │
                    │ └──────────┘ │
                    └──────────────┘

                    ┌──────────────┐
                    │   PROMPTS    │
                    │              │
                    │ generate.ts  │
                    │ validate.ts  │
                    │ moat.ts      │
                    │ trajectory.ts│
                    └──────────────┘

                    ┌──────────────┐
                    │  PERSISTENCE │
                    │              │
                    │ data/        │
                    │  ideas.json  │
                    └──────────────┘
```

## Data Flow: Generation Pipeline

```
User Input (mode + text)
    │
    ├─── Web Search (Tavily) ──► search context
    ├─── Context Docs ──────────► docs context
    │
    ├─── Claude: generate ideas ──┐
    ├─── Gemini: generate ideas ──┤
    │                             │
    │                    Merge + Dedup
    │                             │
    │                     ~8 raw ideas
    │                             │
    ▼                             ▼
    For each idea:
    │
    ├── Market Sizing ─────── dual-LLM + search
    ├── Competitive Landscape  dual-LLM + search
    ├── Moat Analysis ──────── dual-LLM
    ├── Feasibility ─────────── dual-LLM
    ├── Trajectory ──────────── dual-LLM
    │
    └── Consensus Score ────── average + agreement
    │
    ▼
    Save to data/ideas.json
    Render in UI
```
