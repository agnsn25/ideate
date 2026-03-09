# Ideate AI — Core Thesis

## Problem
Evaluating startup ideas is a messy, subjective process. Founders either rely on gut instinct, bounce ideas off friends who are too polite to be honest, or spend weeks doing manual market research before discovering a fatal flaw.

AI can help with ideation, but single-model outputs are unreliable — they hallucinate market sizes, miss competitors, and tend toward sycophantic validation rather than honest pressure-testing.

## Insight
Two different LLM families (Claude and Gemini) have different training data, different biases, and different blind spots. When they agree, you can have higher confidence. When they disagree, the disagreement itself is informative — it highlights genuine uncertainty or debate-worthy points.

This "dual-LLM debate" pattern is analogous to having two independent analysts review the same investment thesis. Neither is perfect alone, but together they produce more robust assessments than either could alone.

## Solution
A structured pipeline that:
1. Generates ideas using both models independently
2. Validates each idea across 5 dimensions using both models
3. Cross-pollinates reasoning (each model sees the other's analysis)
4. Produces a consensus score with agreement level and flagged disagreements

## Why Now
- LLM costs have dropped enough to make multi-model pipelines practical for local tools
- Structured output capabilities in both Claude and Gemini make JSON-based pipelines reliable
- Web search APIs (Tavily) enable real-time market intelligence grounding
- The AI startup space is exploding — founders need better tools to filter signal from noise
