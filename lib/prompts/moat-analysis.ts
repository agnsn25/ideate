export function getMoatPrompt(ideaName: string, ideaDescription: string) {
  return {
    system: `You are a strategy consultant specializing in competitive moats and defensibility for AI-era startups. You evaluate ideas across multiple moat dimensions.`,
    user: `Evaluate the defensibility and moat potential of this startup idea:

**${ideaName}**
${ideaDescription}

Score each dimension from 1-10:
- **Data Network Effects**: Does the product get better with more users/data? Can this create a compounding advantage?
- **Regulatory Barrier**: Is the space complex enough that regulation acts as a barrier to entry? (Higher = better for the startup)
- **Domain Expertise**: How deep is the domain knowledge required? Can a generalist AI company replicate this easily?
- **Switching Costs**: Once a customer adopts, how hard is it to switch? Are there integrations, workflows, or data lock-in?
- **Won't Build Filter**: How unlikely is it that Big Tech (Google, Microsoft, Amazon) would build this? (Higher = safer from incumbents)
- **Time to Value**: How quickly can an early mover build a meaningful advantage before competitors catch up?

Respond with JSON:
{
  "score": <0-100 overall moat score>,
  "reasoning": "<your analysis of the overall defensibility>",
  "data": {
    "dataNetworkEffects": <1-10>,
    "regulatoryBarrier": <1-10>,
    "domainExpertise": <1-10>,
    "switchingCosts": <1-10>,
    "wontBuildFilter": <1-10>,
    "timeToValue": <1-10>,
    "overall": <1-10 weighted average>,
    "reasoning": "<detailed moat reasoning>"
  }
}`,
  };
}
