export function getTrajectoryPrompt(ideaName: string, ideaDescription: string) {
  return {
    system: `You are a startup growth strategist. You design phased growth plans from MVP wedge through platform endgame.`,
    user: `Design a growth trajectory for this startup idea:

**${ideaName}**
${ideaDescription}

Map out 4 phases:
- Phase 1 (0-6 months): MVP / wedge — the simplest version that delivers value
- Phase 2 (6-18 months): Expand — broaden the offering, grow the customer base
- Phase 3 (18-36 months): Platform / moat lock-in — build defensibility
- Phase 4 (3-5 years): Endgame vision — the big picture

Respond with JSON:
{
  "score": <0-100 trajectory clarity and ambition score>,
  "reasoning": "<your analysis>",
  "data": {
    "phase1": { "label": "<short label>", "description": "<1-2 sentences>", "milestones": ["<milestone 1>", "<milestone 2>", "<milestone 3>"] },
    "phase2": { "label": "<short label>", "description": "<1-2 sentences>", "milestones": ["<milestone 1>", "<milestone 2>", "<milestone 3>"] },
    "phase3": { "label": "<short label>", "description": "<1-2 sentences>", "milestones": ["<milestone 1>", "<milestone 2>", "<milestone 3>"] },
    "phase4": { "label": "<short label>", "description": "<1-2 sentences>", "milestones": ["<milestone 1>", "<milestone 2>", "<milestone 3>"] }
  }
}`,
  };
}
