// Types and interfaces for the AI Multi-Agent System

export interface UserContext {
  email: string;
  company: string;
  jobTitle: string;
  score: number;
  responses: Record<string, string | string[]>;
  language: 'pt' | 'en';
}

export interface ProcessedContext extends UserContext {
  profile: UserProfile;
  painPoints: PainPoint[];
  opportunities: Opportunity[];
}

export interface UserProfile {
  readinessLevel: 'beginner' | 'curious' | 'explorer' | 'champion';
  isManagerRole: boolean;
  authorityLevel: 'high' | 'medium' | 'low';
  primaryChallenge: string;
  teamSize: string;
  industry: string;
  urgencyLevel: 'immediate' | 'short-term' | 'long-term';
  operationalContext?: string;
}

export interface PainPoint {
  description: string;
  impact: string;
  quantifiedLoss: string; // e.g., "10 hours/week" or "$5k/month"
  urgencyScore: number; // 1-10
}

export interface Opportunity {
  area: string;
  potentialGain: string;
  implementationEffort: 'low' | 'medium' | 'high';
  timeToValue: string; // e.g., "1 week", "1 month"
}

// Diagnostic Agent Output
export interface DiagnosticOutput {
  painPoints: PainPoint[];
  quantifiedImpact: string; // Changed to string for compatibility with StorytellerAgent
  urgencyMessage: string;
  primaryOpportunity: string;
}

// Action Planner Agent Output
export interface ActionPlannerOutput {
  quickWins: QuickWin[];
  monthlyRoadmap: MonthlyMilestone[];
  quarterlyVision: QuarterlyGoal;
  successMetrics: SuccessMetric[];
  implementationTips: string[];
}

export interface QuickWin {
  week: number;
  action: string;
  steps: ActionStep[];
  expectedOutcome: string;
  timeRequired: string;
  toolCategory: string;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

export interface ActionStep {
  order: number;
  description: string;
  duration: string;
  tip?: string;
}

export interface MonthlyMilestone {
  month: number;
  focus: string;
  keyActions: string[];
  expectedResults: string[];
  metricsToTrack: string[];
}

export interface QuarterlyGoal {
  vision: string;
  transformationLevel: string;
  competitiveAdvantage: string;
  careerImpact: string;
}

export interface SuccessMetric {
  timeframe: string;
  metric: string;
  target: string;
  howToMeasure: string;
}

// Storyteller Agent Output
export interface StorytellerOutput {
  transformationNarrative: TransformationStory;
  motivationalElements: MotivationalElement[];
  ctaPreparation: CtaPrep;
  reportData?: AIReport; // Optional JSON report data for direct output
}

export interface TransformationStory {
  currentState: string;
  journeySteps: string[];
  futureState: string;
  inspirationalNote: string;
}

export interface MotivationalElement {
  type: 'success-story' | 'peer-comparison' | 'opportunity-cost' | 'vision';
  message: string;
}

export interface CtaPrep {
  limitationsOfSolo: string;
  benefitsOfGuidance: string;
  urgencyCreator: string;
  naturalLeadIn: string;
}

// Final Report Structure (matching current frontend)
export interface AIReport {
  executive_summary: string;
  department_challenges: string[];
  career_impact: {
    personal_productivity: string;
    team_performance: string;
    leadership_recognition: string;
    professional_growth: string;
  };
  quick_wins: {
    month_1_actions: Array<{
      action: string;
      impact: string;
    }>;
    quarter_1_goals: Array<{
      goal: string;
      outcome: string;
    }>;
  };
  implementation_roadmap: Array<{
    phase: string;
    duration: string;
    description: string;
    career_benefit: string;
  }>;
}

// Agent Interface
export interface Agent<TInput, TOutput> {
  name: string;
  process(input: TInput): Promise<TOutput>;
}

// Orchestrator Types
export interface OrchestratorConfig {
  maxExecutionTime: number; // milliseconds
  enableCache: boolean;
  fallbackToLegacy: boolean;
}

export interface OrchestratorResult {
  success: boolean;
  report?: AIReport;
  executionTime: number;
  agentsUsed: string[];
  error?: string;
}