export interface ScoreBreakdown {
  market: number;
  competition: number;
  moat: number;
  feasibility: number;
  trajectory: number;
}

export const WEIGHTS: ScoreBreakdown = {
  market: 0.25,
  competition: 0.15,
  moat: 0.25,
  feasibility: 0.20,
  trajectory: 0.15,
};

// Moat scores are 1-100 from LLMs. Below this threshold = hard penalty.
const MOAT_KILL_THRESHOLD = 50;
const MOAT_KILL_PENALTY = 0.5; // multiply final score by this

export function computeWeightedScore(scores: ScoreBreakdown): number {
  const raw = Math.round(
    scores.market * WEIGHTS.market +
    scores.competition * WEIGHTS.competition +
    scores.moat * WEIGHTS.moat +
    scores.feasibility * WEIGHTS.feasibility +
    scores.trajectory * WEIGHTS.trajectory
  );

  // Hard filter: ideas with weak moats get crushed in ranking
  if (scores.moat < MOAT_KILL_THRESHOLD) {
    return Math.round(raw * MOAT_KILL_PENALTY);
  }

  return raw;
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return "Exceptional";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Promising";
  if (score >= 40) return "Moderate";
  return "Weak";
}

export function getScoreColor(score: number): string {
  if (score >= 75) return "accent-green";
  if (score >= 50) return "accent-amber";
  return "accent-red";
}
