import Anthropic from '@anthropic-ai/sdk';
import { 
  Agent,
  ProcessedContext,
  DiagnosticOutput,
  ActionPlannerOutput,
  QuickWin,
  MonthlyMilestone,
  QuarterlyGoal,
  SuccessMetric,
  ActionStep
} from './types';

interface ActionPlannerInput {
  context: ProcessedContext;
  diagnosticOutput: DiagnosticOutput;
}

export class ActionPlannerAgent implements Agent<ActionPlannerInput, ActionPlannerOutput> {
  name = 'ActionPlannerAgent';
  private anthropic: Anthropic;

  constructor(anthropic: Anthropic) {
    this.anthropic = anthropic;
  }

  async process(input: ActionPlannerInput): Promise<ActionPlannerOutput> {
    const { context, diagnosticOutput } = input;
    
    console.log('📋 ActionPlannerAgent Starting Planning...');
    console.log('📋 Company:', context.company);
    console.log('📋 Job Title:', context.jobTitle);
    console.log('📋 Industry:', context.profile.industry);
    console.log('📋 Team Size:', context.profile.teamSize);
    console.log('📋 Authority Level:', context.profile.authorityLevel);
    console.log('📋 Readiness Level:', context.profile.readinessLevel);
    console.log('📋 Primary Opportunity from Diagnostic:', diagnosticOutput.primaryOpportunity);
    console.log('📋 Pain Points Count:', diagnosticOutput.painPoints.length);
    diagnosticOutput.painPoints.forEach((point, index) => {
      console.log(`📋 Pain Point ${index + 1}: ${point.description} (${point.quantifiedLoss})`);
    });
    
    if (context.profile.operationalContext) {
      console.log('📋 Has Operational Context: YES');
      console.log('📋 Operational Context Preview:', context.profile.operationalContext.substring(0, 200) + '...');
    } else {
      console.log('📋 Has Operational Context: NO');
    }
    
    const prompt = this.buildPrompt(context, diagnosticOutput);
    console.log('📋 Prompt Length:', prompt.length);
    
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const response = message.content[0].type === 'text' ? message.content[0].text : '';
      console.log('📋 ActionPlannerAgent Raw Response Length:', response.length);
      console.log('📋 ActionPlannerAgent Raw Response:');
      console.log('='.repeat(80));
      console.log(response);
      console.log('='.repeat(80));
      
      const result = this.parseResponse(response, context);
      
      console.log('📋 ActionPlannerAgent Parsed Results:');
      console.log('   - Quick Wins Count:', result.quickWins.length);
      result.quickWins.forEach((win, index) => {
        console.log(`   - Quick Win ${index + 1} (Week ${win.week}): ${win.action}`);
        console.log(`     Steps: ${win.steps.length}, Outcome: ${win.expectedOutcome}`);
      });
      console.log('   - Monthly Roadmap Length:', result.monthlyRoadmap.length);
      result.monthlyRoadmap.forEach((month, index) => {
        console.log(`   - Month ${index + 1}: ${month.focus}`);
        console.log(`     Key Actions: ${month.keyActions.length}, Expected Results: ${month.expectedResults.length}`);
      });
      console.log('   - Success Metrics Count:', result.successMetrics.length);
      console.log('   - Quarterly Vision:', result.quarterlyVision.vision);
      
      return result;
    } catch (error) {
      console.error('📋 ActionPlannerAgent error:', error);
      return this.generateFallback(context, diagnosticOutput);
    }
  }

  private buildPrompt(context: ProcessedContext, diagnostic: DiagnosticOutput): string {
    const isPortuguese = context.language === 'pt';
    const operationalContext = context.profile.operationalContext;
    
    return `You are an expert AI implementation strategist creating ACTIONABLE, SPECIFIC plans.

${isPortuguese ? 'IMPORTANT: Respond entirely in Brazilian Portuguese.' : 'Respond in English.'}

USER CONTEXT:
- Company: ${context.company}
- Role: ${context.jobTitle}
- Industry: ${context.profile.industry}
- Team Size: ${context.profile.teamSize}
- Authority: ${context.profile.authorityLevel}
- Readiness: ${context.profile.readinessLevel}

DIAGNOSED PAIN POINTS:
${diagnostic.painPoints.map(p => `- ${p.description}: ${p.quantifiedLoss}`).join('\n')}

PRIMARY OPPORTUNITY: ${diagnostic.primaryOpportunity}

${operationalContext ? `
CRITICAL - User's Specific Process Description:
"${operationalContext}"

YOUR ACTIONS MUST DIRECTLY ADDRESS THESE SPECIFIC PROCESSES!
` : ''}

Create an ACTIONABLE plan following these principles:
1. Start EXTREMELY simple (first action: max 2 hours)
2. Build momentum with quick, visible wins
3. Each action must have CLEAR steps and measurable outcomes
4. Focus on the SPECIFIC processes the user described
5. NO specific tool names - use categories like "automation tool" or "AI assistant"
6. Make the user feel "I can start this TODAY"

STRUCTURE YOUR RESPONSE EXACTLY AS FOLLOWS:

=== QUICK WINS (WEEKS 1-4) ===

WEEK 1-2:
Action: [Specific action addressing their pain point]
Steps:
1. [15-30 min step]
2. [30-60 min step]
3. [30-60 min step]
Time: [Total time]
Outcome: [Specific, measurable result]
Category: [Tool category needed]
Difficulty: Easy

WEEK 3-4:
[Same structure]

=== MONTHLY ROADMAP ===

MONTH 1:
Focus: [Theme]
Key Actions:
- [Action 1]
- [Action 2]
- [Action 3]
Results:
- [Measurable result 1]
- [Measurable result 2]
Metrics:
- [What to track]

MONTH 2:
[Same structure]

MONTH 3:
[Same structure]

=== QUARTERLY VISION ===
Vision: [Where they'll be in 3 months]
Transformation: [From X to Y]
Competitive Edge: [What advantage they'll have]
Career Impact: [How this positions them]

=== SUCCESS METRICS ===
Week 2: [Early indicator]
Month 1: [First milestone]
Month 2: [Growth indicator]
Quarter 1: [Major achievement]

=== IMPLEMENTATION TIPS ===
1. [Practical tip for getting started]
2. [Common mistake to avoid]
3. [How to maintain momentum]
4. [When to seek help]

Remember: Make it feel ACHIEVABLE and EXCITING. The user should think "I can do this!"`;
  }

  private parseResponse(response: string, context: ProcessedContext): ActionPlannerOutput {
    try {
      // Parse the structured response
      const quickWins = this.parseQuickWins(response);
      const monthlyRoadmap = this.parseMonthlyRoadmap(response);
      const quarterlyVision = this.parseQuarterlyVision(response);
      const successMetrics = this.parseSuccessMetrics(response);
      const implementationTips = this.parseImplementationTips(response);

      return {
        quickWins,
        monthlyRoadmap,
        quarterlyVision,
        successMetrics,
        implementationTips
      };
    } catch (error) {
      console.error('Error parsing action planner response:', error);
      return this.generateFallback(context, null);
    }
  }

  private parseQuickWins(response: string): QuickWin[] {
    const quickWins: QuickWin[] = [];
    const quickWinsSection = response.match(/=== QUICK WINS[\s\S]*?(?==== MONTHLY ROADMAP|$)/);
    
    if (quickWinsSection) {
      const weekMatches = quickWinsSection[0].matchAll(/WEEK (\d+-?\d*):([\s\S]*?)(?=WEEK \d+:|=== MONTHLY ROADMAP|$)/g);
      
      for (const match of weekMatches) {
        const weekRange = match[1];
        const content = match[2];
        
        const actionMatch = content.match(/Action:\s*(.+)/);
        const stepsMatch = content.match(/Steps:([\s\S]*?)(?=Time:|$)/);
        const timeMatch = content.match(/Time:\s*(.+)/);
        const outcomeMatch = content.match(/Outcome:\s*(.+)/);
        const categoryMatch = content.match(/Category:\s*(.+)/);
        const difficultyMatch = content.match(/Difficulty:\s*(.+)/i);
        
        if (actionMatch) {
          const steps = this.parseSteps(stepsMatch ? stepsMatch[1] : '');
          
          quickWins.push({
            week: parseInt(weekRange.split('-')[0]),
            action: actionMatch[1].trim(),
            steps,
            expectedOutcome: outcomeMatch ? outcomeMatch[1].trim() : '',
            timeRequired: timeMatch ? timeMatch[1].trim() : '2-3 hours',
            toolCategory: categoryMatch ? categoryMatch[1].trim() : 'General automation',
            difficultyLevel: this.parseDifficulty(difficultyMatch ? difficultyMatch[1].trim() : 'easy')
          });
        }
      }
    }
    
    return quickWins.length > 0 ? quickWins : this.getDefaultQuickWins(response.includes('Portuguese'));
  }

  private parseSteps(stepsText: string): ActionStep[] {
    const steps: ActionStep[] = [];
    const stepLines = stepsText.split('\n').filter(line => line.trim());
    
    stepLines.forEach((line, index) => {
      const stepMatch = line.match(/^\d+\.\s*(.+?)(?:\s*\((.+?)\))?$/);
      if (stepMatch) {
        steps.push({
          order: index + 1,
          description: stepMatch[1].trim(),
          duration: stepMatch[2] || '30 min'
        });
      }
    });
    
    return steps;
  }

  private parseMonthlyRoadmap(response: string): MonthlyMilestone[] {
    const milestones: MonthlyMilestone[] = [];
    const roadmapSection = response.match(/=== MONTHLY ROADMAP([\s\S]*?)(?==== QUARTERLY VISION|$)/);
    
    if (roadmapSection) {
      const monthMatches = roadmapSection[0].matchAll(/MONTH (\d+):([\s\S]*?)(?=MONTH \d+:|=== QUARTERLY VISION|$)/g);
      
      for (const match of monthMatches) {
        const month = parseInt(match[1]);
        const content = match[2];
        
        const focusMatch = content.match(/Focus:\s*(.+)/);
        const actionsMatch = content.match(/Key Actions:([\s\S]*?)(?=Results:|$)/);
        const resultsMatch = content.match(/Results:([\s\S]*?)(?=Metrics:|$)/);
        const metricsMatch = content.match(/Metrics:([\s\S]*?)(?=MONTH|===|$)/);
        
        milestones.push({
          month,
          focus: focusMatch ? focusMatch[1].trim() : '',
          keyActions: this.parseListItems(actionsMatch ? actionsMatch[1] : ''),
          expectedResults: this.parseListItems(resultsMatch ? resultsMatch[1] : ''),
          metricsToTrack: this.parseListItems(metricsMatch ? metricsMatch[1] : '')
        });
      }
    }
    
    return milestones.length > 0 ? milestones : this.getDefaultMilestones(response.includes('Portuguese'));
  }

  private parseQuarterlyVision(response: string): QuarterlyGoal {
    const visionSection = response.match(/=== QUARTERLY VISION([\s\S]*?)(?==== SUCCESS METRICS|$)/);
    
    if (visionSection) {
      const visionMatch = visionSection[0].match(/Vision:\s*(.+)/);
      const transformationMatch = visionSection[0].match(/Transformation:\s*(.+)/);
      const edgeMatch = visionSection[0].match(/Competitive Edge:\s*(.+)/);
      const careerMatch = visionSection[0].match(/Career Impact:\s*(.+)/);
      
      return {
        vision: visionMatch ? visionMatch[1].trim() : '',
        transformationLevel: transformationMatch ? transformationMatch[1].trim() : '',
        competitiveAdvantage: edgeMatch ? edgeMatch[1].trim() : '',
        careerImpact: careerMatch ? careerMatch[1].trim() : ''
      };
    }
    
    return this.getDefaultQuarterlyGoal(response.includes('Portuguese'));
  }

  private parseSuccessMetrics(response: string): SuccessMetric[] {
    const metrics: SuccessMetric[] = [];
    const metricsSection = response.match(/=== SUCCESS METRICS([\s\S]*?)(?==== IMPLEMENTATION TIPS|$)/);
    
    if (metricsSection) {
      const lines = metricsSection[0].split('\n').filter(line => line.includes(':'));
      
      lines.forEach(line => {
        const match = line.match(/(.+?):\s*(.+)/);
        if (match) {
          metrics.push({
            timeframe: match[1].trim(),
            metric: match[2].trim(),
            target: match[2].trim(), // Simplified for now
            howToMeasure: 'Track weekly progress'
          });
        }
      });
    }
    
    return metrics.length > 0 ? metrics : this.getDefaultMetrics(response.includes('Portuguese'));
  }

  private parseImplementationTips(response: string): string[] {
    const tipsSection = response.match(/=== IMPLEMENTATION TIPS([\s\S]*?)$/);
    
    if (tipsSection) {
      return this.parseListItems(tipsSection[0]);
    }
    
    return this.getDefaultTips(response.includes('Portuguese'));
  }

  private parseListItems(text: string): string[] {
    const items: string[] = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const match = line.match(/^[-•]\s*(.+)|^\d+\.\s*(.+)/);
      if (match) {
        items.push((match[1] || match[2]).trim());
      }
    });
    
    return items;
  }

  private parseDifficulty(text: string): 'easy' | 'medium' | 'hard' {
    const lower = text.toLowerCase();
    if (lower.includes('easy') || lower.includes('fácil')) return 'easy';
    if (lower.includes('hard') || lower.includes('difícil')) return 'hard';
    return 'medium';
  }

  private generateFallback(context: ProcessedContext, _diagnostic: DiagnosticOutput | null): ActionPlannerOutput {
    const isPortuguese = context.language === 'pt';
    
    return {
      quickWins: this.getDefaultQuickWins(isPortuguese),
      monthlyRoadmap: this.getDefaultMilestones(isPortuguese),
      quarterlyVision: this.getDefaultQuarterlyGoal(isPortuguese),
      successMetrics: this.getDefaultMetrics(isPortuguese),
      implementationTips: this.getDefaultTips(isPortuguese)
    };
  }

  private getDefaultQuickWins(isPortuguese: boolean): QuickWin[] {
    return [
      {
        week: 1,
        action: isPortuguese ? 
          'Mapear e documentar seu processo mais demorado' :
          'Map and document your most time-consuming process',
        steps: [
          {
            order: 1,
            description: isPortuguese ? 'Escolher o processo que mais consome tempo' : 'Choose the most time-consuming process',
            duration: '30 min'
          },
          {
            order: 2,
            description: isPortuguese ? 'Documentar cada etapa do processo' : 'Document each step of the process',
            duration: '1 hour'
          },
          {
            order: 3,
            description: isPortuguese ? 'Identificar gargalos e oportunidades' : 'Identify bottlenecks and opportunities',
            duration: '30 min'
          }
        ],
        expectedOutcome: isPortuguese ? 
          'Visibilidade completa do processo e 3-5 oportunidades de automação identificadas' :
          'Complete process visibility and 3-5 automation opportunities identified',
        timeRequired: '2 hours',
        toolCategory: isPortuguese ? 'Documentação e análise' : 'Documentation and analysis',
        difficultyLevel: 'easy'
      },
      {
        week: 3,
        action: isPortuguese ?
          'Implementar primeira automação simples' :
          'Implement first simple automation',
        steps: [
          {
            order: 1,
            description: isPortuguese ? 'Escolher tarefa mais repetitiva' : 'Choose most repetitive task',
            duration: '30 min'
          },
          {
            order: 2,
            description: isPortuguese ? 'Configurar automação básica' : 'Configure basic automation',
            duration: '1.5 hours'
          },
          {
            order: 3,
            description: isPortuguese ? 'Testar e ajustar' : 'Test and adjust',
            duration: '1 hour'
          }
        ],
        expectedOutcome: isPortuguese ?
          'Economia de 3-5 horas por semana, processo 70% mais rápido' :
          'Save 3-5 hours per week, process 70% faster',
        timeRequired: '3 hours',
        toolCategory: isPortuguese ? 'Ferramenta de automação' : 'Automation tool',
        difficultyLevel: 'medium'
      }
    ];
  }

  private getDefaultMilestones(isPortuguese: boolean): MonthlyMilestone[] {
    return [
      {
        month: 1,
        focus: isPortuguese ? 'Fundação e Quick Wins' : 'Foundation and Quick Wins',
        keyActions: [
          isPortuguese ? 'Mapear 3 processos principais' : 'Map 3 main processes',
          isPortuguese ? 'Implementar 2 automações simples' : 'Implement 2 simple automations',
          isPortuguese ? 'Medir resultados iniciais' : 'Measure initial results'
        ],
        expectedResults: [
          isPortuguese ? '20% redução em tarefas manuais' : '20% reduction in manual tasks',
          isPortuguese ? '8-10 horas economizadas por semana' : '8-10 hours saved per week'
        ],
        metricsToTrack: [
          isPortuguese ? 'Tempo por processo' : 'Time per process',
          isPortuguese ? 'Taxa de erro' : 'Error rate'
        ]
      }
    ];
  }

  private getDefaultQuarterlyGoal(isPortuguese: boolean): QuarterlyGoal {
    return {
      vision: isPortuguese ?
        'Líder reconhecido em eficiência e inovação no departamento' :
        'Recognized leader in efficiency and innovation in the department',
      transformationLevel: isPortuguese ?
        'De executor sobrecarregado para estrategista eficiente' :
        'From overloaded executor to efficient strategist',
      competitiveAdvantage: isPortuguese ?
        'Departamento 40% mais produtivo que média do setor' :
        'Department 40% more productive than industry average',
      careerImpact: isPortuguese ?
        'Posicionado para promoção ou liderança de projetos estratégicos' :
        'Positioned for promotion or strategic project leadership'
    };
  }

  private getDefaultMetrics(isPortuguese: boolean): SuccessMetric[] {
    return [
      {
        timeframe: isPortuguese ? 'Semana 2' : 'Week 2',
        metric: isPortuguese ? 'Primeiro processo automatizado' : 'First process automated',
        target: isPortuguese ? '50% redução de tempo' : '50% time reduction',
        howToMeasure: isPortuguese ? 'Comparar tempo antes/depois' : 'Compare time before/after'
      }
    ];
  }

  private getDefaultTips(isPortuguese: boolean): string[] {
    return isPortuguese ? [
      'Comece pequeno - primeira ação deve levar no máximo 2 horas',
      'Documente tudo - crie evidências do seu progresso',
      'Compartilhe vitórias - torne seu sucesso visível',
      'Peça ajuda quando travar - não perca momentum'
    ] : [
      'Start small - first action should take maximum 2 hours',
      'Document everything - create evidence of your progress',
      'Share wins - make your success visible',
      'Ask for help when stuck - don\'t lose momentum'
    ];
  }
}