interface ReportData {
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

interface UserData {
  company: string;
  jobTitle: string;
  score: number;
  responses: Record<string, string | string[]>;
  email: string;
}

export class AdvancedReportGenerator {
  private userData: UserData;
  
  constructor(userData: UserData) {
    this.userData = userData;
  }

  // Calculate actual metrics based on responses
  private calculateMetrics() {
    const weeklyHours = parseInt(this.userData.responses['weekly-hours-wasted']?.toString() || '20');
    const process = this.userData.responses['time-consuming-process']?.toString() || '';
    const errorImpact = this.userData.responses['process-error-cost']?.toString() || '';
    const teamSize = parseInt(this.userData.responses['team-impact-size']?.toString() || '5');
    const urgency = this.userData.responses['implementation-urgency']?.toString() || '';
    
    // Dynamic automation rates based on process type
    let automationRate = 0.75; // base rate
    if (process.includes('data-entry')) automationRate = 0.9;
    else if (process.includes('reporting')) automationRate = 0.85;
    else if (process.includes('customer-support')) automationRate = 0.7;
    else if (process.includes('document')) automationRate = 0.8;
    
    // Dynamic hourly value based on role and company size
    let hourlyRate = 180; // base rate
    if (this.userData.jobTitle.toLowerCase().includes('diretor')) hourlyRate = 300;
    else if (this.userData.jobTitle.toLowerCase().includes('gerente')) hourlyRate = 220;
    else if (this.userData.jobTitle.toLowerCase().includes('coordenador')) hourlyRate = 180;
    else if (this.userData.jobTitle.toLowerCase().includes('analista')) hourlyRate = 150;
    
    // Team size multiplier for impact
    const teamMultiplier = Math.min(teamSize / 5, 3); // cap at 3x
    
    // Error cost multiplier
    let errorMultiplier = 1.2;
    if (errorImpact.includes('critical')) errorMultiplier = 2.5;
    else if (errorImpact.includes('high')) errorMultiplier = 1.8;
    else if (errorImpact.includes('medium')) errorMultiplier = 1.4;
    
    const hoursSaved = Math.round(weeklyHours * automationRate);
    const baseMonthlySavings = hoursSaved * 4 * hourlyRate;
    
    // Apply multipliers for realistic premium calculations
    const monthlySavings = Math.round(baseMonthlySavings * teamMultiplier * errorMultiplier);
    const annualSavings = monthlySavings * 12;
    
    // Calculate ROI based on budget
    const budget = this.userData.responses['monthly-budget-available']?.toString() || '';
    let monthlyBudget = 2000; // default
    if (budget.includes('500/mês')) monthlyBudget = 500;
    else if (budget.includes('2.000/mês')) monthlyBudget = 1500;
    else if (budget.includes('5.000/mês')) monthlyBudget = 3500;
    else if (budget.includes('10.000/mês')) monthlyBudget = 8000;
    
    const roi = Math.round(((monthlySavings - monthlyBudget) / monthlyBudget) * 100);
    
    // Dynamic range calculations
    const savingsRange = {
      min: Math.round(monthlySavings * 0.7),
      max: Math.round(monthlySavings * 1.3)
    };
    
    return {
      weeklyHours,
      hoursSaved,
      monthlySavings,
      savingsRange,
      annualSavings,
      monthlyBudget,
      roi,
      teamMultiplier,
      automationRate,
      hourlyRate,
      daysToBreakeven: Math.ceil((monthlyBudget / monthlySavings) * 30)
    };
  }

  // Get specific tool recommendations based on process and budget
  private getToolRecommendations() {
    const process = this.userData.responses['time-consuming-process']?.toString() || '';
    const budget = this.userData.responses['monthly-budget-available']?.toString() || '';
    const techStack = this.userData.responses['current-tech-stack'] || [];
    
    const tools: { [key: string]: string[] } = {
      'reporting-analytics': [
        'Power BI com conectores AI (R$ 52/user)',
        'ChatGPT API para análise de dados (R$ 0.002/request)',
        'Zapier para automação de coleta (R$ 89/mês)',
        'Python scripts com pandas + AI (gratuito + API costs)'
      ],
      'customer-support': [
        'Intercom AI Resolution Bot (R$ 314/mês)',
        'ChatGPT para templates de resposta (R$ 100/mês)',
        'Zendesk Answer Bot (R$ 199/agente)',
        'Custom chatbot com Claude API (R$ 0.003/request)'
      ],
      'document-management': [
        'DocuSign com AI extraction (R$ 167/mês)',
        'Claude para análise de contratos (R$ 0.003/request)',
        'Adobe Acrobat AI Assistant (R$ 119/mês)',
        'Custom OCR + AI pipeline (R$ 500 setup + usage)'
      ],
      'data-entry': [
        'UiPath (R$ 1,890/bot)',
        'Automation Anywhere (R$ 2,250/bot)',
        'Make.com (R$ 45/mês)',
        'Custom RPA com Python (R$ 2,000 desenvolvimento)'
      ]
    };
    
    // Filter by budget
    let recommendedTools = tools[process] || tools['reporting-analytics'];
    
    if (budget.includes('500/mês')) {
      recommendedTools = recommendedTools.filter(tool => 
        tool.includes('gratuito') || 
        tool.includes('API') || 
        parseInt(tool.match(/R\$ (\d+)/)?.[1] || '9999') < 200
      );
    }
    
    return recommendedTools.slice(0, 3);
  }

  // Generate hyper-specific executive summary
  private generateExecutiveSummary(): string {
    const metrics = this.calculateMetrics();
    const process = this.processTypeToPortuguese(this.userData.responses['time-consuming-process']?.toString() || '');
    const urgency = this.userData.responses['implementation-urgency']?.toString() || '';
    const successMetric = this.userData.responses['success-metric']?.toString() || '';
    
    let timeline = '90 dias';
    if (urgency.includes('30 dias')) timeline = '30 dias';
    else if (urgency.includes('6 meses')) timeline = '6 meses';
    
    let mainGoal = `economia de R$ ${metrics.savingsRange.min.toLocaleString('pt-BR')} a R$ ${metrics.savingsRange.max.toLocaleString('pt-BR')}/mês`;
    if (successMetric.includes('time-reduction')) mainGoal = `redução de ${metrics.hoursSaved}h semanais em ${process}`;
    else if (successMetric.includes('error-elimination')) mainGoal = 'eliminação de erros críticos';
    else if (successMetric.includes('roi-achievement')) mainGoal = `ROI de ${metrics.roi}% em ${timeline}`;
    
    return `Com base na análise detalhada, ${this.userData.company} pode alcançar ${mainGoal} automatizando ${process}. ` +
           `Com ${metrics.weeklyHours} horas semanais gastas neste processo e orçamento de R$ ${metrics.monthlyBudget.toLocaleString('pt-BR')}/mês, ` +
           `recomendamos implementação em ${timeline} gerando economia anual estimada entre R$ ${(metrics.savingsRange.min * 12).toLocaleString('pt-BR')} e R$ ${(metrics.savingsRange.max * 12).toLocaleString('pt-BR')}. ` +
           `Score ${this.userData.score}/100 indica ${this.getReadinessLevel()} para começar imediatamente com quick wins.`;
  }

  // Generate specific challenges based on actual data
  private generateChallenges(): string[] {
    const process = this.userData.responses['time-consuming-process']?.toString() || '';
    const hours = this.userData.responses['weekly-hours-wasted']?.toString() || '20';
    const errorImpact = this.userData.responses['process-error-cost']?.toString() || '';
    const teamSize = this.userData.responses['team-impact-size']?.toString() || '';
    const techStack = Array.isArray(this.userData.responses['current-tech-stack']) 
      ? this.userData.responses['current-tech-stack'] 
      : [];
    const concern = this.userData.responses['biggest-ai-concern']?.toString() || '';
    
    const challenges = [
      `Processo de ${this.processTypeToPortuguese(process)} consome ${hours} horas/semana da equipe de ${teamSize}`,
      `Impacto de ${this.errorImpactToPortuguese(errorImpact)} quando erros ocorrem, gerando retrabalho e custos adicionais`,
      `Falta de integração entre ${techStack.length > 0 ? this.techStackToPortuguese(techStack).join(', ') : 'sistemas atuais'} causa duplicação de esforços`,
      `Preocupação com ${this.concernToPortuguese(concern)} precisa ser endereçada antes da implementação`,
      `Pressão para mostrar resultados em ${this.userData.responses['implementation-urgency']?.toString().split(' - ')[0] || '90 dias'} exige abordagem focada`
    ];
    
    // Add specific challenge from user description if provided
    const userDescription = this.userData.responses['specific-process-description']?.toString();
    if (userDescription && userDescription.length > 50) {
      const specificChallenge = this.extractSpecificChallenge(userDescription);
      if (specificChallenge) {
        challenges.splice(2, 0, specificChallenge);
      }
    }
    
    return challenges.slice(0, 5);
  }

  // Generate career impact with real metrics
  private generateCareerImpact() {
    const metrics = this.calculateMetrics();
    const successMetric = this.userData.responses['success-metric']?.toString() || '';
    const teamSize = this.userData.responses['team-impact-size']?.toString() || '';
    
    return {
      personal_productivity: `Economia de ${metrics.hoursSaved} horas semanais (${Math.round(metrics.hoursSaved/40*100)}% do tempo) para focar em estratégia. Eliminação de tarefas repetitivas liberando ${Math.round(metrics.hoursSaved * 52)} horas anuais para desenvolvimento profissional.`,
      
      team_performance: `${teamSize} serão impactados positivamente, com produtividade aumentando ${Math.round(metrics.hoursSaved/parseInt(this.userData.responses['weekly-hours-wasted']?.toString() || '20')*100)}%. Redução de ${this.userData.responses['process-error-cost']?.toString().includes('high') ? '95%' : '80%'} nos erros operacionais.`,
      
      leadership_recognition: `Entrega de ${this.getMainSuccessMetric(successMetric, metrics)} posicionará você como líder em inovação. Case de sucesso para apresentar em reuniões executivas e conferências do setor.`,
      
      professional_growth: `Expertise em IA aplicada a ${this.userData.responses['industry-sector']} aumenta valor de mercado em 25-40%. Habilidades em ${this.getToolRecommendations().slice(0, 2).join(' e ')} são altamente demandadas.`
    };
  }

  // Generate actionable quick wins
  private generateQuickWins() {
    const tools = this.getToolRecommendations();
    const metrics = this.calculateMetrics();
    const process = this.userData.responses['time-consuming-process']?.toString() || '';
    const specificProcess = this.userData.responses['specific-process-description']?.toString() || '';
    
    return {
      month_1_actions: [
        {
          action: `Implementar ${tools[0]} para automatizar ${this.getSpecificSubprocess(process, specificProcess)}`,
          impact: `Redução imediata de ${Math.round(metrics.hoursSaved * 0.3)} horas/semana e ROI positivo em ${metrics.daysToBreakeven} dias`
        },
        {
          action: `Configurar integração entre ${tools[1]} e ${this.getMostRelevantTechStack()}`,
          impact: `Eliminação de ${this.getErrorReductionPercent()} dos erros e economia estimada de R$ ${Math.round(metrics.savingsRange.min * 0.4).toLocaleString('pt-BR')} a R$ ${Math.round(metrics.savingsRange.max * 0.4).toLocaleString('pt-BR')}/mês`
        }
      ],
      quarter_1_goals: [
        {
          goal: `Escalar automação de ${this.processTypeToPortuguese(process)} para toda equipe de ${this.userData.responses['team-impact-size']}`,
          outcome: `${this.getMainSuccessMetric(this.userData.responses['success-metric']?.toString() || '', metrics)} conforme prometido à liderança`
        },
        {
          goal: `Criar centro de excelência em IA para ${this.userData.responses['industry-sector']} com documentação e treinamentos`,
          outcome: `Posicionamento como referência interna e redução de 70% no tempo de onboarding de novas automações`
        }
      ]
    };
  }

  // Generate detailed roadmap
  private generateRoadmap() {
    const urgency = this.userData.responses['implementation-urgency']?.toString() || '';
    const metrics = this.calculateMetrics();
    const tools = this.getToolRecommendations();
    
    let phase1Duration = '4-6 semanas';
    let phase2Duration = '8-12 semanas';
    let phase3Duration = '3-6 meses';
    
    if (urgency.includes('30 dias')) {
      phase1Duration = '2-3 semanas';
      phase2Duration = '4-6 semanas';
      phase3Duration = '2-3 meses';
    }
    
    return [
      {
        phase: 'Implementação Rápida',
        duration: phase1Duration,
        description: `• Deploy de ${tools[0]} para ${this.userData.responses['time-consuming-process']}\n• Integração com ${this.getMostRelevantTechStack()}\n• Treinamento inicial da equipe piloto\n• Métricas baseline estabelecidas`,
        career_benefit: `Resultados visíveis em ${urgency.includes('30 dias') ? '2 semanas' : '4 semanas'} para reportar à diretoria`
      },
      {
        phase: 'Otimização e Escala',
        duration: phase2Duration,
        description: `• Expansão para ${this.userData.responses['team-impact-size']}\n• Implementação de ${tools[1]} e ${tools[2] || 'ferramentas complementares'}\n• Automação de processos adjacentes\n• Dashboard de ROI em tempo real`,
        career_benefit: `Case documentado com ${metrics.roi}% ROI para visibilidade organizacional`
      },
      {
        phase: 'Liderança em IA',
        duration: phase3Duration,
        description: `• Centro de excelência estabelecido\n• Expansão para outros departamentos\n• Programa de mentoria em IA\n• Participação em eventos do setor`,
        career_benefit: `Reconhecimento como principal especialista em IA da ${this.userData.company}`
      }
    ];
  }

  // Helper methods
  private processTypeToPortuguese(process: string): string {
    const map: { [key: string]: string } = {
      'reporting-analytics': 'relatórios e análises',
      'customer-support': 'atendimento ao cliente',
      'document-management': 'gestão de documentos',
      'data-entry': 'entrada de dados'
    };
    return map[process] || process;
  }

  private errorImpactToPortuguese(impact: string): string {
    const map: { [key: string]: string } = {
      'low-impact': 'baixo impacto',
      'medium-impact': 'médio impacto', 
      'high-impact': 'alto impacto',
      'critical-impact': 'impacto crítico'
    };
    return map[impact] || impact;
  }

  private concernToPortuguese(concern: string): string {
    const map: { [key: string]: string } = {
      'data-security': 'segurança dos dados',
      'team-resistance': 'resistência da equipe',
      'implementation-failure': 'falha na implementação',
      'roi-concern': 'retorno sobre investimento'
    };
    return map[concern] || concern;
  }

  private techStackToPortuguese(stack: string[]): string[] {
    const map: { [key: string]: string } = {
      'spreadsheets': 'planilhas',
      'crm': 'CRM',
      'erp': 'ERP',
      'communication': 'comunicação',
      'analytics': 'BI/Analytics',
      'custom': 'sistemas próprios'
    };
    return stack.map(s => map[s] || s);
  }

  private getReadinessLevel(): string {
    if (this.userData.score >= 80) return 'excelente prontidão';
    if (this.userData.score >= 60) return 'boa maturidade';
    if (this.userData.score >= 40) return 'potencial moderado';
    return 'fase inicial de preparação';
  }

  private extractSpecificChallenge(description: string): string {
    // Extract key pain points from user description
    const keywords = ['demora', 'manual', 'erro', 'retrabalho', 'difícil', 'complexo'];
    const sentences = description.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if (keywords.some(kw => sentence.toLowerCase().includes(kw))) {
        return sentence.trim().substring(0, 100);
      }
    }
    
    return '';
  }

  private getSpecificSubprocess(process: string, description: string): string {
    if (description && description.length > 50) {
      // Extract specific action from description
      const match = description.match(/(?:extraio|copio|cruzo|formato|envio|faço|processo|analiso)\s+([^,\.]+)/i);
      if (match) {
        return match[0].toLowerCase();
      }
    }
    
    // Fallback to generic subprocess
    const subprocesses: { [key: string]: string } = {
      'reporting-analytics': 'consolidação de dados e geração de dashboards',
      'customer-support': 'respostas a tickets e follow-ups',
      'document-management': 'aprovações e controle de versões',
      'data-entry': 'transferência entre sistemas'
    };
    
    return subprocesses[process] || 'processos principais';
  }

  private getMostRelevantTechStack(): string {
    const stack = this.userData.responses['current-tech-stack'];
    if (Array.isArray(stack) && stack.length > 0) {
      const priorityTools = ['spreadsheets', 'crm', 'erp'];
      const relevant = stack.find(s => priorityTools.includes(s)) || stack[0];
      return this.techStackToPortuguese([relevant])[0];
    }
    return 'sistemas atuais';
  }

  private getErrorReductionPercent(): string {
    const errorImpact = this.userData.responses['process-error-cost']?.toString() || '';
    if (errorImpact.includes('critical')) return '98%';
    if (errorImpact.includes('high')) return '85%';
    if (errorImpact.includes('medium')) return '70%';
    return '50%';
  }

  private getMainSuccessMetric(metric: string, metrics: ReturnType<typeof this.calculateMetrics>): string {
    if (metric.includes('time-reduction')) return `redução de 50% no tempo (${metrics.hoursSaved}h/semana)`;
    if (metric.includes('cost-savings')) return `economia de R$ ${metrics.savingsRange.min.toLocaleString('pt-BR')} a R$ ${metrics.savingsRange.max.toLocaleString('pt-BR')}/mês`;
    if (metric.includes('error-elimination')) return 'zero erros críticos em processos-chave';
    if (metric.includes('roi-achievement')) return `ROI de ${metrics.roi}%`;
    return `economia estimada de R$ ${metrics.savingsRange.min.toLocaleString('pt-BR')} a R$ ${metrics.savingsRange.max.toLocaleString('pt-BR')}/mês`;
  }

  // Main generation method
  public generateReport(): ReportData {
    return {
      executive_summary: this.generateExecutiveSummary(),
      department_challenges: this.generateChallenges(),
      career_impact: this.generateCareerImpact(),
      quick_wins: this.generateQuickWins(),
      implementation_roadmap: this.generateRoadmap()
    };
  }
}