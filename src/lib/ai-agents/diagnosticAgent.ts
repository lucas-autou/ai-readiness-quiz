import Anthropic from '@anthropic-ai/sdk';
import { 
  Agent, 
  UserContext, 
  DiagnosticOutput,
  PainPoint,
  UserProfile 
} from './types';

export class DiagnosticAgent implements Agent<UserContext, DiagnosticOutput> {
  name = 'DiagnosticAgent';
  private anthropic: Anthropic;

  constructor(anthropic: Anthropic) {
    this.anthropic = anthropic;
  }

  async process(context: UserContext): Promise<DiagnosticOutput> {
    console.log('🔍 DiagnosticAgent Starting Analysis...');
    console.log('🔍 Company:', context.company);
    console.log('🔍 Job Title:', context.jobTitle);
    console.log('🔍 Score:', context.score + '/100');
    console.log('🔍 Language:', context.language);
    
    const profile = this.analyzeUserProfile(context);
    console.log('🔍 User Profile Generated:');
    console.log('   - Readiness Level:', profile.readinessLevel);
    console.log('   - Manager Role:', profile.isManagerRole);
    console.log('   - Authority Level:', profile.authorityLevel);
    console.log('   - Primary Challenge:', profile.primaryChallenge);
    console.log('   - Team Size:', profile.teamSize);
    console.log('   - Industry:', profile.industry);
    console.log('   - Urgency Level:', profile.urgencyLevel);
    console.log('   - Has Operational Context:', !!profile.operationalContext);
    if (profile.operationalContext) {
      console.log('   - Operational Context Preview:', profile.operationalContext.substring(0, 150) + '...');
    }
    
    const prompt = this.buildPrompt(context, profile);
    console.log('🔍 Prompt Length:', prompt.length);
    
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const response = message.content[0].type === 'text' ? message.content[0].text : '';
      console.log('🔍 DiagnosticAgent Raw Response Length:', response.length);
      console.log('🔍 DiagnosticAgent Raw Response:');
      console.log('='.repeat(80));
      console.log(response);
      console.log('='.repeat(80));
      
      const result = this.parseResponse(response, context, profile);
      
      console.log('🔍 DiagnosticAgent Parsed Results:');
      console.log('   - Pain Points Count:', result.painPoints.length);
      result.painPoints.forEach((point, index) => {
        console.log(`   - Pain Point ${index + 1}:`, point.description);
        console.log(`     Impact: ${point.quantifiedLoss}, Urgency: ${point.urgencyScore}`);
      });
      console.log('   - Quantified Impact:', result.quantifiedImpact);
      console.log('   - Urgency Message:', result.urgencyMessage);
      console.log('   - Primary Opportunity:', result.primaryOpportunity);
      
      return result;
    } catch (error) {
      console.error('🔍 DiagnosticAgent error:', error);
      return this.generateFallback(context, profile);
    }
  }

  private analyzeUserProfile(context: UserContext): UserProfile {
    const { responses, jobTitle, score } = context;
    
    return {
      readinessLevel: this.getReadinessLevel(score),
      isManagerRole: this.isManager(jobTitle),
      authorityLevel: this.getAuthorityLevel(responses['approval-process']),
      primaryChallenge: String(responses['department-challenge'] || ''),
      teamSize: String(responses['department-size'] || ''),
      industry: String(responses['industry-sector'] || ''),
      urgencyLevel: this.getUrgencyLevel(responses['implementation-timeline']),
      operationalContext: responses['operational-challenges'] as string
    };
  }

  private buildPrompt(context: UserContext, profile: UserProfile): string {
    const isPortuguese = context.language === 'pt';
    
    // Dynamic calculations based on role and context
    const weeklyHours = parseInt(String(context.responses['weekly-hours-wasted'] || '30'));
    const teamSize = parseInt(String(context.responses['team-impact-size'] || '15'));
    const processType = String(context.responses['time-consuming-process'] || 'reporting-analytics');
    const errorImpact = String(context.responses['process-error-cost'] || 'high-impact');
    const budget = String(context.responses['monthly-budget-available'] || 'R$ 5.000/mês');
    
    // Dynamic hourly value based on role (PREMIUM CALCULATIONS)
    let hourlyRate = 180;
    const role = context.jobTitle.toLowerCase();
    if (role.includes('diretor') || role.includes('director') || role.includes('c-level')) hourlyRate = 300;
    else if (role.includes('gerente') || role.includes('manager') || role.includes('head')) hourlyRate = 220;
    else if (role.includes('coordenador') || role.includes('supervisor')) hourlyRate = 180;
    else if (role.includes('analista') || role.includes('analyst')) hourlyRate = 150;
    
    // Automation potential (be BOLD!)
    let automationRate = 0.75;
    if (processType.includes('data-entry')) automationRate = 0.9;
    else if (processType.includes('reporting')) automationRate = 0.85;
    else if (processType.includes('customer-support')) automationRate = 0.8;
    else if (processType.includes('document')) automationRate = 0.8;
    
    // Team multiplier for impact
    const teamMultiplier = Math.min(teamSize / 10, 2.5);
    
    // Error cost multiplier (SIGNIFICANT IMPACT!)
    let errorMultiplier = 1.3;
    if (errorImpact.includes('critical')) errorMultiplier = 2.8;
    else if (errorImpact.includes('high')) errorMultiplier = 2.0;
    else if (errorImpact.includes('medium')) errorMultiplier = 1.5;
    
    // Calculate IMPRESSIVE numbers
    const hoursSaved = Math.round(weeklyHours * automationRate);
    const baseMonthlySavings = hoursSaved * 4 * hourlyRate;
    const totalMonthlySavings = Math.round(baseMonthlySavings * teamMultiplier * errorMultiplier);
    const annualSavings = totalMonthlySavings * 12;
    
    // ROI calculation
    let monthlyBudget = 3000;
    if (budget.includes('500')) monthlyBudget = 500;
    else if (budget.includes('2.000')) monthlyBudget = 1500;
    else if (budget.includes('5.000')) monthlyBudget = 3500;
    else if (budget.includes('10.000')) monthlyBudget = 8000;
    
    const roi = Math.round(((totalMonthlySavings - monthlyBudget) / monthlyBudget) * 100);
    const paybackDays = Math.ceil((monthlyBudget / totalMonthlySavings) * 30);
    
    return `You are a PREMIUM business efficiency expert. Your analysis must be IMPRESSIVE and SPECIFIC for a ${context.jobTitle} at ${context.company}.

${isPortuguese ? 'RESPONDA EM PORTUGUÊS BRASILEIRO.' : 'RESPOND IN ENGLISH.'}

PERFIL ANALISADO:
- Cargo: ${context.jobTitle} (valor/hora: R$ ${hourlyRate})
- Horas perdidas: ${weeklyHours}h/semana
- Tamanho da equipe: ${teamSize} pessoas
- Processo crítico: ${processType}
- Impacto de erros: ${errorImpact}
- Orçamento disponível: ${budget}

NÚMEROS CALCULADOS (USE ESTES VALORES):
- Horas economizáveis: ${hoursSaved}h/semana (${Math.round(automationRate * 100)}% automação)
- Economia mensal: R$ ${totalMonthlySavings.toLocaleString('pt-BR')} (com multiplicadores: equipe ${teamMultiplier.toFixed(1)}x, erro ${errorMultiplier}x)
- Economia anual: R$ ${annualSavings.toLocaleString('pt-BR')}
- ROI projetado: ${roi}%
- Payback: ${paybackDays} dias

${profile.operationalContext ? `
CONTEXTO OPERACIONAL: "${profile.operationalContext}"
` : ''}

${context.responses['specific-process-description'] ? `
PROCESSO ESPECÍFICO DESCRITO: "${context.responses['specific-process-description']}"
` : ''}

FORMATE EXATAMENTE:

PAIN_POINTS:
${processType} consome ${weeklyHours}h/semana da equipe | Impacto: R$ ${Math.round(totalMonthlySavings * 0.4).toLocaleString('pt-BR')}/mês de custo | Urgency: 9
Erros em ${processType} com impacto ${errorImpact} | Impacto: R$ ${Math.round(totalMonthlySavings * 0.3).toLocaleString('pt-BR')}/mês retrabalho | Urgency: 8
Falta de integração entre sistemas causa ${Math.round(weeklyHours * 0.25)}h/semana duplicação | Impacto: R$ ${Math.round(totalMonthlySavings * 0.2).toLocaleString('pt-BR')}/mês | Urgency: 7

QUANTIFIED_IMPACT:
Tempo: ${weeklyHours} horas/semana desperdiçadas
Custo: R$ ${totalMonthlySavings.toLocaleString('pt-BR')}/mês de ineficiência
Potencial: ${Math.round(automationRate * 100)}% automação possível = ${hoursSaved}h/semana economizadas

URGENCY_MESSAGE:
Com ROI de ${roi}% e payback em ${paybackDays} dias, implementação imediata gerará R$ ${totalMonthlySavings.toLocaleString('pt-BR')}/mês. Concorrentes já estão automatizando - janela de oportunidade é limitada.

PRIMARY_OPPORTUNITY:
Automatizar ${processType} com IA gerará economia de R$ ${totalMonthlySavings.toLocaleString('pt-BR')}/mês e posicionará ${context.jobTitle} como líder em inovação na ${context.company}.

Use EXATAMENTE estes números calculados. Seja OUSADO mas REALISTA para impressionar um ${context.jobTitle}.`;
  }

  private parseResponse(response: string, context: UserContext, profile: UserProfile): DiagnosticOutput {
    try {
      const sections = this.extractSections(response);
      
      return {
        painPoints: this.parsePainPoints(sections.painPoints),
        quantifiedImpact: this.parseQuantifiedImpact(sections.quantifiedImpact),
        urgencyMessage: sections.urgencyMessage,
        primaryOpportunity: sections.primaryOpportunity
      };
    } catch (error) {
      console.error('Error parsing diagnostic response:', error);
      return this.generateFallback(context, profile);
    }
  }

  private extractSections(response: string): Record<string, string> {
    const sections: Record<string, string> = {};
    
    // Extract pain points
    const painPointsMatch = response.match(/PAIN_POINTS:([\s\S]*?)(?=QUANTIFIED_IMPACT:|$)/);
    sections.painPoints = painPointsMatch ? painPointsMatch[1].trim() : '';
    
    // Extract quantified impact
    const quantifiedMatch = response.match(/QUANTIFIED_IMPACT:([\s\S]*?)(?=URGENCY_MESSAGE:|$)/);
    sections.quantifiedImpact = quantifiedMatch ? quantifiedMatch[1].trim() : '';
    
    // Extract urgency message
    const urgencyMatch = response.match(/URGENCY_MESSAGE:([\s\S]*?)(?=PRIMARY_OPPORTUNITY:|$)/);
    sections.urgencyMessage = urgencyMatch ? urgencyMatch[1].trim() : '';
    
    // Extract primary opportunity
    const opportunityMatch = response.match(/PRIMARY_OPPORTUNITY:([\s\S]*?)$/);
    sections.primaryOpportunity = opportunityMatch ? opportunityMatch[1].trim() : '';
    
    return sections;
  }

  private parsePainPoints(painPointsText: string): PainPoint[] {
    const lines = painPointsText.split('\n').filter(line => line.trim());
    const painPoints: PainPoint[] = [];
    
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 3) {
        painPoints.push({
          description: parts[0],
          impact: parts[1],
          quantifiedLoss: parts[1],
          urgencyScore: parseInt(parts[2]) || 7
        });
      }
    }
    
    return painPoints.length > 0 ? painPoints : this.getDefaultPainPoints();
  }

  private parseQuantifiedImpact(impactText: string): string {
    // Return the full text as a single string for compatibility
    return impactText.trim() || 'Tempo: 10-15 horas/semana\nCusto: R$ 5-10k/mês\nEficiência: 30-40% abaixo do potencial';
  }

  private generateFallback(context: UserContext, _profile: UserProfile): DiagnosticOutput {
    const isPortuguese = context.language === 'pt';
    
    return {
      painPoints: [
        {
          description: isPortuguese ? 
            'Processos manuais repetitivos consomem tempo valioso da equipe' :
            'Repetitive manual processes consume valuable team time',
          impact: isPortuguese ? 'Perda de foco em atividades estratégicas' : 'Loss of focus on strategic activities',
          quantifiedLoss: '12-15 hours/week',
          urgencyScore: 8
        },
        {
          description: isPortuguese ?
            'Falta de automação gera erros e retrabalho constante' :
            'Lack of automation generates errors and constant rework',
          impact: isPortuguese ? 'Redução de produtividade e moral da equipe' : 'Reduced productivity and team morale',
          quantifiedLoss: 'R$ 8k/month',
          urgencyScore: 7
        },
        {
          description: isPortuguese ?
            'Análise de dados demorada impede decisões ágeis' :
            'Slow data analysis prevents agile decisions',
          impact: isPortuguese ? 'Perda de oportunidades de mercado' : 'Loss of market opportunities',
          quantifiedLoss: '25% efficiency loss',
          urgencyScore: 9
        }
      ],
      quantifiedImpact: isPortuguese ?
        'Tempo: 15-20 horas/semana desperdiçadas\nCusto: R$ 10-15k/mês de ineficiência\nEficiência: 35% abaixo do potencial' :
        'Time: 15-20 hours/week wasted\nCost: $10-15k/month inefficiency\nEfficiency: 35% below potential',
      urgencyMessage: isPortuguese ?
        `Enquanto você lê isso, competidores estão implementando IA. Cada semana de atraso representa R$ 2-3k em eficiência perdida. Em 3 meses, isso soma R$ 30k+ que poderia ser investido em crescimento.` :
        `While you read this, competitors are implementing AI. Each week of delay represents $2-3k in lost efficiency. In 3 months, that adds up to $30k+ that could be invested in growth.`,
      primaryOpportunity: isPortuguese ?
        'Automação imediata de processos documentais e análise de dados' :
        'Immediate automation of document processes and data analysis'
    };
  }

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

  private getDefaultPainPoints(): PainPoint[] {
    return [
      {
        description: 'Manual repetitive tasks',
        impact: 'Team productivity loss',
        quantifiedLoss: '10 hours/week',
        urgencyScore: 7
      }
    ];
  }
}