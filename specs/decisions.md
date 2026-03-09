# Ideate AI — Decision Log

## 2026-03-06: Initial Architecture Decisions

### Dual-LLM Choice: Claude Sonnet 4.6 + Gemini 2.5 Pro
**Why these two**: Different training data, different model families, different biases. Using models from two separate companies (Anthropic + Google) maximizes the chance of catching each other's blind spots. Both support structured JSON output reliably.
**Alternative considered**: Using two Claude models (Opus + Sonnet) — rejected because same training data would reduce the diversity benefit.

### Flat-file JSON over Database
**Why**: This is a local tool, not a SaaS product. No auth, no multi-user. JSON file in `data/ideas.json` is simpler, zero-setup, git-trackable, and sufficient for hundreds of ideas.
**Alternative considered**: SQLite — would add unnecessary complexity for the data volume expected.

### Tavily over Serper for Web Search
**Why**: Tavily is purpose-built for AI/RAG pipelines — returns pre-extracted clean content instead of raw snippets. 1,000/month recurring free tier vs Serper's 2,500 one-time. Better LLM reasoning with fewer tokens.
**Alternative considered**: Serper — more free searches but raw snippets require extra processing.

### Next.js App Router
**Why**: Modern React patterns, server components for API routes, built-in streaming support. The app is simple enough that App Router complexity is manageable.

### Gemini model: gemini-3-pro-preview
**Why**: Latest available Gemini model. Previously used gemini-2.5-pro which hit free tier quota limits.

### Sequential validation over parallel
**Why**: Original implementation parallelized all 5 validation dimensions per idea (5 x dualValidate = 10 concurrent LLM calls buffering JSON responses). This caused Node.js memory pressure and server crashes. Switched to sequential dimension evaluation — slower but stable.
**Tradeoff**: ~5x slower per idea, but the server stays alive.
**Future**: Revisit with a concurrency limiter (p-limit) if stability improvements are needed. Full plan in `specs/future-work.md`.
