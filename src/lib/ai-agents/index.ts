// Main entry point for the AI Multi-Agent System
export { AIOrchestrator } from './orchestrator';
export { DiagnosticAgent } from './diagnosticAgent';
export { ActionPlannerAgent } from './actionPlannerAgent';
export { StorytellerAgent } from './storytellerAgent';
export * from './types';

// Convenience function for generating reports
import { AIOrchestrator } from './orchestrator';
import type { UserContext, OrchestratorResult } from './types';

export async function generateAIReportWithAgents(
  userContext: UserContext,
  anthropicApiKey: string
): Promise<OrchestratorResult> {
  const orchestrator = new AIOrchestrator(anthropicApiKey, {
    maxExecutionTime: 0, // No timeout
    enableCache: true,
    fallbackToLegacy: true
  });

  return orchestrator.generateReport(userContext);
}