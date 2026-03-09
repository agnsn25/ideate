export type Mode = 'domain' | 'trend' | 'refine';
export type GeneratedBy = 'claude' | 'gemini' | 'both';
export type Confidence = 'high' | 'medium' | 'low';
export type Agreement = 'high' | 'medium' | 'low';
export type CompetitorStage = 'startup' | 'scaleup' | 'bigtech' | 'incumbent';
export type ThreatLevel = 'high' | 'medium' | 'low';
export type ResourceIntensity = 'low' | 'medium' | 'high';
export type TechReadiness = 'ready_now' | 'ready_3mo' | 'ready_6mo' | 'speculative';
export type MarketCategory = 'b2b' | 'b2c' | 'b2b2c' | 'marketplace';

export interface MarketEstimate {
  value: string;
  confidence: Confidence;
  sources: string[];
}

export interface Market {
  tam: MarketEstimate;
  sam: MarketEstimate;
  som: MarketEstimate;
  growthRate: string;
  category: MarketCategory;
}

export interface Competitor {
  name: string;
  stage: CompetitorStage;
  threat: ThreatLevel;
  differentiation: string;
  funding?: string;
  url?: string;
}

export interface Moat {
  dataNetworkEffects: number;
  regulatoryBarrier: number;
  domainExpertise: number;
  switchingCosts: number;
  wontBuildFilter: number;
  timeToValue: number;
  overall: number;
  reasoning: string;
}

export interface Feasibility {
  resourceIntensity: ResourceIntensity;
  techReadiness: TechReadiness;
  estimatedMvpCost: string;
  teamSize: string;
  gtmClarity: number;
  revenueModel: string;
}

export interface TrajectoryPhase {
  label: string;
  description: string;
  milestones: string[];
}

export interface Trajectory {
  phase1: TrajectoryPhase;
  phase2: TrajectoryPhase;
  phase3: TrajectoryPhase;
  phase4: TrajectoryPhase;
}

export interface Scores {
  claude: number;
  gemini: number;
  consensus: number;
  agreement: Agreement;
  disagreements: string[];
}

export interface IdeaMetadata {
  createdAt: string;
  searchQueries: string[];
  contextDocsUsed: string[];
}

export interface Idea {
  id: string;
  name: string;
  oneLiner: string;
  description: string;
  mode: Mode;
  generatedBy: GeneratedBy;
  market: Market;
  competitors: Competitor[];
  moat: Moat;
  feasibility: Feasibility;
  trajectory: Trajectory;
  scores: Scores;
  metadata: IdeaMetadata;
}

// API request/response types

export interface GenerateRequest {
  mode: Mode;
  input: string; // domain, trend context, or rough idea
  contextDocs?: string[];
}

export interface GenerateResponse {
  ideas: Idea[];
  searchQueriesUsed: string[];
}

export interface ValidateRequest {
  idea: Idea;
}

export interface ValidateResponse {
  idea: Idea; // fully validated
}

// Raw LLM output types (before consensus merge)

export interface RawIdeaOutput {
  name: string;
  oneLiner: string;
  description: string;
}

export interface RawMarketOutput {
  tam: MarketEstimate;
  sam: MarketEstimate;
  som: MarketEstimate;
  growthRate: string;
  category: MarketCategory;
}

export interface RawMoatOutput {
  dataNetworkEffects: number;
  regulatoryBarrier: number;
  domainExpertise: number;
  switchingCosts: number;
  wontBuildFilter: number;
  timeToValue: number;
  overall: number;
  reasoning: string;
}

export interface RawFeasibilityOutput {
  resourceIntensity: ResourceIntensity;
  techReadiness: TechReadiness;
  estimatedMvpCost: string;
  teamSize: string;
  gtmClarity: number;
  revenueModel: string;
}

export interface RawTrajectoryOutput {
  phase1: TrajectoryPhase;
  phase2: TrajectoryPhase;
  phase3: TrajectoryPhase;
  phase4: TrajectoryPhase;
}

export interface LLMEvaluation {
  score: number;
  reasoning: string;
  data: Record<string, unknown>;
}

export interface ConsensusResult {
  claudeScore: number;
  geminiScore: number;
  consensus: number;
  agreement: Agreement;
  disagreements: string[];
}

// Search types

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface ContextChunk {
  content: string;
  source: string;
  relevance?: number;
}
