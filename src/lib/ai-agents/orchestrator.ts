import Anthropic from '@anthropic-ai/sdk';
import { 
  UserContext,
  ProcessedContext,
  AIReport,
  OrchestratorConfig,
  OrchestratorResult,
  UserProfile,
  DiagnosticOutput,
  ActionPlannerOutput,
  StorytellerOutput
} from './types';
import { DiagnosticAgent } from './diagnosticAgent';
import { ActionPlannerAgent } from './actionPlannerAgent';
import { StorytellerAgent } from './storytellerAgent';

export class AIOrchestrator {
  private anthropic: Anthropic;
  private config: OrchestratorConfig;
  private diagnosticAgent: DiagnosticAgent;
  private actionPlannerAgent: ActionPlannerAgent;
  private storytellerAgent: StorytellerAgent;

  constructor(anthropicApiKey: string, config?: Partial<OrchestratorConfig>) {
    this.anthropic = new Anthropic({ apiKey: anthropicApiKey });
    
    this.config = {
      maxExecutionTime: config?.maxExecutionTime || 0, // No timeout
      enableCache: config?.enableCache ?? true,
      fallbackToLegacy: config?.fallbackToLegacy ?? true
    };

    // Initialize agents
    this.diagnosticAgent = new DiagnosticAgent(this.anthropic);
    this.actionPlannerAgent = new ActionPlannerAgent(this.anthropic);
    this.storytellerAgent = new StorytellerAgent(this.anthropic);
  }

  async generateReport(context: UserContext): Promise<OrchestratorResult> {
    const startTime = Date.now();
    const agentsUsed: string[] = [];

    try {
      console.log('🎯 Starting AI Orchestrator for:', context.company);

      // Step 1: Create processed context with user profile
      const processedContext = this.createProcessedContext(context);
      
      // Step 2: Run Diagnostic Agent
      console.log('🔍 Running Diagnostic Agent...');
      agentsUsed.push('DiagnosticAgent');
      const diagnosticStart = Date.now();
      const diagnosticOutput = await this.diagnosticAgent.process(context);
      console.log(`✅ Diagnostic Agent completed in ${Date.now() - diagnosticStart}ms`);
      console.log('🔍 Diagnostic Output preview:', JSON.stringify(diagnosticOutput).substring(0, 300));

      // Step 3: Run Action Planner Agent
      console.log('📋 Running Action Planner Agent...');
      agentsUsed.push('ActionPlannerAgent');
      const actionPlannerStart = Date.now();
      const actionPlannerOutput = await this.actionPlannerAgent.process({
        context: processedContext,
        diagnosticOutput
      });
      console.log(`✅ Action Planner Agent completed in ${Date.now() - actionPlannerStart}ms`);
      console.log('🔍 Action Planner quick wins preview:', JSON.stringify(actionPlannerOutput.quickWins[0]).substring(0, 200));

      // Step 4: Run Storyteller Agent
      console.log('📖 Running Storyteller Agent...');
      agentsUsed.push('StorytellerAgent');
      const storytellerStart = Date.now();
      const storytellerOutput = await this.storytellerAgent.process({
        context: processedContext,
        diagnosticOutput,
        actionPlannerOutput
      });
      console.log(`✅ Storyteller Agent completed in ${Date.now() - storytellerStart}ms`);

      // Step 5: Compile final report
      console.log('📊 Compiling final report...');
      console.log('📊 Diagnostic Output Summary:');
      console.log('   - Primary Opportunity:', diagnosticOutput.primaryOpportunity);
      console.log('   - Pain Points Count:', diagnosticOutput.painPoints.length);
      console.log('   - Urgency Message:', diagnosticOutput.urgencyMessage);
      console.log('   - Quantified Impact:', diagnosticOutput.quantifiedImpact);
      
      console.log('📊 Action Planner Output Summary:');
      console.log('   - Quick Wins Count:', actionPlannerOutput.quickWins.length);
      console.log('   - Monthly Roadmap Length:', actionPlannerOutput.monthlyRoadmap.length);
      console.log('   - Success Metrics Count:', actionPlannerOutput.successMetrics.length);
      console.log('   - Quarterly Vision:', actionPlannerOutput.quarterlyVision.vision);
      
      console.log('📊 Storyteller Output Summary:');
      console.log('   - Current State:', storytellerOutput.transformationNarrative.currentState.substring(0, 100) + '...');
      console.log('   - Future State:', storytellerOutput.transformationNarrative.futureState.substring(0, 100) + '...');
      console.log('   - Journey Steps Count:', storytellerOutput.transformationNarrative.journeySteps.length);
      console.log('   - Motivational Elements Count:', storytellerOutput.motivationalElements.length);
      console.log('   - Has Direct Report Data:', !!storytellerOutput.reportData);
      
      // Check if StorytellerAgent returned direct JSON report data
      let report: AIReport;
      if (storytellerOutput.reportData) {
        console.log('🎯 Using direct JSON report from StorytellerAgent');
        report = storytellerOutput.reportData;
      } else {
        console.log('🔧 Compiling report from agent outputs');
        report = this.compileReport(
          processedContext,
          diagnosticOutput,
          actionPlannerOutput,
          storytellerOutput
        );
      }
      
      console.log('📊 Final Compiled Report Structure:');
      console.log('   - Executive Summary Length:', report.executive_summary.length);
      console.log('   - Department Challenges Count:', report.department_challenges.length);
      console.log('   - Career Impact Keys:', Object.keys(report.career_impact));
      console.log('   - Quick Wins Month 1 Actions:', report.quick_wins.month_1_actions.length);
      console.log('   - Quick Wins Quarter 1 Goals:', report.quick_wins.quarter_1_goals.length);
      console.log('   - Implementation Roadmap Phases:', report.implementation_roadmap.length);
      
      console.log('📊 Final Report Preview:');
      console.log('Executive Summary:', report.executive_summary.substring(0, 200) + '...');
      console.log('First Department Challenge:', report.department_challenges[0] || 'None');
      console.log('Personal Productivity Impact:', report.career_impact.personal_productivity.substring(0, 150) + '...');

      const executionTime = Date.now() - startTime;
      console.log(`✅ Report generated successfully in ${executionTime}ms`);

      return {
        success: true,
        report,
        executionTime,
        agentsUsed
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Orchestrator error:', error);
      
      return {
        success: false,
        executionTime,
        agentsUsed,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private createProcessedContext(context: UserContext): ProcessedContext {
    const profile: UserProfile = {
      readinessLevel: this.getReadinessLevel(context.score),
      isManagerRole: this.isManager(context.jobTitle),
      authorityLevel: this.getAuthorityLevel(context.responses['approval-process']),
      primaryChallenge: String(context.responses['department-challenge'] || ''),
      teamSize: String(context.responses['department-size'] || ''),
      industry: String(context.responses['industry-sector'] || ''),
      urgencyLevel: this.getUrgencyLevel(context.responses['implementation-timeline']),
      operationalContext: context.responses['operational-challenges'] as string
    };

    return {
      ...context,
      profile,
      painPoints: [],
      opportunities: []
    };
  }


  private compileReport(
    context: ProcessedContext,
    diagnostic: DiagnosticOutput,
    actionPlanner: ActionPlannerOutput,
    storyteller: StorytellerOutput
  ): AIReport {
    const isPortuguese = context.language === 'pt';
    
    // Build executive summary combining all insights
    const executiveSummary = this.buildExecutiveSummary(
      context,
      diagnostic,
      actionPlanner,
      storyteller,
      isPortuguese
    );

    // Format department challenges from diagnostic
    const departmentChallenges = diagnostic.painPoints.map(p => 
      `${p.description} - ${p.quantifiedLoss}`
    );

    // Build career impact section with storyteller elements
    const careerImpact = this.buildCareerImpact(
      context,
      actionPlanner,
      storyteller,
      isPortuguese
    );

    // Format quick wins from action planner
    const quickWins = this.formatQuickWins(actionPlanner, isPortuguese);

    // Build implementation roadmap
    const implementationRoadmap = this.buildRoadmap(
      context,
      actionPlanner,
      isPortuguese
    );

    return {
      executive_summary: executiveSummary,
      department_challenges: departmentChallenges,
      career_impact: careerImpact,
      quick_wins: quickWins,
      implementation_roadmap: implementationRoadmap
    };
  }

  private buildExecutiveSummary(
    context: ProcessedContext,
    diagnostic: DiagnosticOutput,
    actionPlanner: ActionPlannerOutput,
    storyteller: StorytellerOutput,
    isPortuguese: boolean
  ): string {
    const transformationStory = storyteller.transformationNarrative;
    const urgency = diagnostic.urgencyMessage;
    const vision = actionPlanner.quarterlyVision.vision;

    if (isPortuguese) {
      return `${transformationStory.currentState} ${urgency} Implementando o plano de ação desenvolvido, começando com ${actionPlanner.quickWins[0]?.action || 'automações simples'}, você pode economizar ${diagnostic.quantifiedImpact.timeWasted} por semana já no primeiro mês. ${vision} ${transformationStory.inspirationalNote}`;
    } else {
      return `${transformationStory.currentState} ${urgency} By implementing the developed action plan, starting with ${actionPlanner.quickWins[0]?.action || 'simple automations'}, you can save ${diagnostic.quantifiedImpact.timeWasted} per week in the first month. ${vision} ${transformationStory.inspirationalNote}`;
    }
  }

  private buildCareerImpact(
    context: ProcessedContext,
    actionPlanner: ActionPlannerOutput,
    storyteller: StorytellerOutput,
    isPortuguese: boolean
  ): AIReport['career_impact'] {
    const motivationalElements = storyteller.motivationalElements;
    const successStory = motivationalElements.find(e => e.type === 'success-story');
    const vision = motivationalElements.find(e => e.type === 'vision');

    return {
      personal_productivity: isPortuguese ?
        `Implementando as ações do primeiro mês, você ganhará ${actionPlanner.successMetrics[0]?.target || '8-12 horas'} por semana, permitindo foco em iniciativas estratégicas que demonstram liderança visionária.` :
        `By implementing first month actions, you'll gain ${actionPlanner.successMetrics[0]?.target || '8-12 hours'} per week, allowing focus on strategic initiatives that demonstrate visionary leadership.`,
      
      team_performance: isPortuguese ?
        `Sua equipe de ${context.profile.teamSize} experimentará ${actionPlanner.monthlyRoadmap[0]?.expectedResults[0] || 'aumento de 30% na produtividade'}, estabelecendo você como líder transformador.` :
        `Your team of ${context.profile.teamSize} will experience ${actionPlanner.monthlyRoadmap[0]?.expectedResults[0] || '30% productivity increase'}, establishing you as a transformational leader.`,
      
      leadership_recognition: successStory?.message || (isPortuguese ?
        'Liderando a implementação de IA, você se posicionará como referência em inovação, abrindo portas para promoções e projetos estratégicos.' :
        'Leading AI implementation, you\'ll position yourself as an innovation reference, opening doors for promotions and strategic projects.'),
      
      professional_growth: vision?.message || (isPortuguese ?
        'Desenvolver expertise prática em IA aumentará seu valor de mercado em 40-60%, posicionando você para oportunidades de liderança sênior.' :
        'Developing practical AI expertise will increase your market value by 40-60%, positioning you for senior leadership opportunities.')
    };
  }

  private formatQuickWins(actionPlanner: ActionPlannerOutput, isPortuguese: boolean): AIReport['quick_wins'] {
    const month1Actions = actionPlanner.quickWins
      .filter(qw => qw.week <= 4)
      .map(qw => ({
        action: qw.action,
        impact: qw.expectedOutcome
      }));

    const quarter1Goals = actionPlanner.monthlyRoadmap
      .slice(0, 3)
      .map(milestone => ({
        goal: milestone.focus,
        outcome: milestone.expectedResults[0] || (isPortuguese ? 
          'Resultados mensuráveis e reconhecimento' : 
          'Measurable results and recognition')
      }));

    return {
      month_1_actions: month1Actions.slice(0, 2),
      quarter_1_goals: quarter1Goals.slice(0, 2)
    };
  }

  private buildRoadmap(
    context: ProcessedContext,
    actionPlanner: ActionPlannerOutput,
    isPortuguese: boolean
  ): AIReport['implementation_roadmap'] {
    const roadmap = [];
    
    // Phase 1
    roadmap.push({
      phase: isPortuguese ? 'Fase 1: Quick Wins e Fundação' : 'Phase 1: Quick Wins and Foundation',
      duration: '4-6 weeks',
      description: actionPlanner.monthlyRoadmap[0]?.keyActions.join('. ') || 
        (isPortuguese ? 'Mapear processos, implementar primeiras automações' : 'Map processes, implement first automations'),
      career_benefit: isPortuguese ?
        'Demonstração imediata de resultados e liderança em inovação' :
        'Immediate demonstration of results and innovation leadership'
    });

    // Phase 2
    roadmap.push({
      phase: isPortuguese ? 'Fase 2: Expansão e Otimização' : 'Phase 2: Expansion and Optimization',
      duration: '8-12 weeks',
      description: actionPlanner.monthlyRoadmap[1]?.keyActions.join('. ') ||
        (isPortuguese ? 'Expandir automações, treinar equipe, medir ROI' : 'Expand automations, train team, measure ROI'),
      career_benefit: isPortuguese ?
        'Consolidação como especialista em transformação digital' :
        'Consolidation as digital transformation specialist'
    });

    // Phase 3
    roadmap.push({
      phase: isPortuguese ? 'Fase 3: Liderança e Escala' : 'Phase 3: Leadership and Scale',
      duration: '3-6 months',
      description: actionPlanner.quarterlyVision.transformationLevel ||
        (isPortuguese ? 'Liderar iniciativas cross-funcionais de IA' : 'Lead cross-functional AI initiatives'),
      career_benefit: actionPlanner.quarterlyVision.careerImpact ||
        (isPortuguese ? 'Posicionamento para promoção executiva' : 'Positioning for executive promotion')
    });

    return roadmap;
  }

  // Helper methods
  private getReadinessLevel(score: number): UserProfile['readinessLevel'] {
    if (score >= 80) return 'champion';
    if (score >= 60) return 'explorer';
    if (score >= 40) return 'curious';
    return 'beginner';
  }

  private isManager(jobTitle: string): boolean {
    const managerKeywords = ['manager', 'director', 'lead', 'head', 'chief', 'supervisor', 'gerente', 'diretor', 'líder', 'chefe'];
    return managerKeywords.some(keyword => jobTitle.toLowerCase().includes(keyword));
  }

  private getAuthorityLevel(approvalProcess: string | string[] | undefined): UserProfile['authorityLevel'] {
    const process = Array.isArray(approvalProcess) ? approvalProcess[0] : approvalProcess || '';
    if (process.includes('directly') || process.includes('diretamente')) return 'high';
    if (process.includes('manager') || process.includes('gerente')) return 'medium';
    return 'low';
  }

  private getUrgencyLevel(timeline: string | string[] | undefined): UserProfile['urgencyLevel'] {
    const timelineStr = Array.isArray(timeline) ? timeline[0] : timeline || '';
    if (timelineStr.includes('immediate') || timelineStr.includes('imediata')) return 'immediate';
    if (timelineStr.includes('quarter') || timelineStr.includes('trimestre')) return 'short-term';
    return 'long-term';
  }
}