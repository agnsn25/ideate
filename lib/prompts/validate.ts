export function getMarketPrompt(ideaName: string, ideaDescription: string, searchContext: string) {
  return {
    system: `You are a market research analyst specializing in sizing emerging technology markets. You provide evidence-based TAM/SAM/SOM estimates with clear methodology.`,
    user: `Analyze the market opportunity for this startup idea:

**${ideaName}**
${ideaDescription}

${searchContext ? `## Market Intelligence\n${searchContext}` : ""}

Provide market sizing estimates with reasoning.

Respond with JSON:
{
  "score": <0-100 market attractiveness score>,
  "reasoning": "<your analysis>",
  "data": {
    "tam": { "value": "<e.g. $50B>", "confidence": "high|medium|low", "sources": ["<reasoning or source>"] },
    "sam": { "value": "<e.g. $8B>", "confidence": "high|medium|low", "sources": ["<reasoning>"] },
    "som": { "value": "<e.g. $500M>", "confidence": "high|medium|low", "sources": ["<reasoning>"] },
    "growthRate": "<e.g. 25% CAGR>",
    "category": "b2b|b2c|b2b2c|marketplace"
  }
}`,
  };
}

export function getCompetitorPrompt(ideaName: string, ideaDescription: string, searchContext: string) {
  return {
    system: `You are a competitive intelligence analyst. You identify and categorize competitors by threat level, stage, and approach.`,
    user: `Identify competitors for this startup idea:

**${ideaName}**
${ideaDescription}

${searchContext ? `## Competitive Intelligence\n${searchContext}` : ""}

Find both direct competitors and adjacent solutions. Categorize each by threat level.

Respond with JSON:
{
  "score": <0-100 competitive landscape favorability — higher means LESS competition>,
  "reasoning": "<your analysis>",
  "data": {
    "competitors": [
      {
        "name": "<company name>",
        "stage": "startup|scaleup|bigtech|incumbent",
        "threat": "high|medium|low",
        "differentiation": "<how this idea differs>",
        "funding": "<if known>",
        "url": "<if known>"
      }
    ]
  }
}`,
  };
}

export function getFeasibilityPrompt(ideaName: string, ideaDescription: string) {
  return {
    system: `You are a technical advisor who evaluates startup feasibility — resource requirements, technical readiness, go-to-market clarity, and revenue model viability.`,
    user: `Evaluate the feasibility of this startup idea:

**${ideaName}**
${ideaDescription}

Respond with JSON:
{
  "score": <0-100 feasibility score>,
  "reasoning": "<your analysis>",
  "data": {
    "resourceIntensity": "low|medium|high",
    "techReadiness": "ready_now|ready_3mo|ready_6mo|speculative",
    "estimatedMvpCost": "<e.g. $50K-100K>",
    "teamSize": "<e.g. 2-3 engineers + 1 domain expert>",
    "gtmClarity": <1-10>,
    "revenueModel": "<description of revenue model>"
  }
}`,
  };
}
