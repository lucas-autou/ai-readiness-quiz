// Sistema de fallback para gerar relatórios estáticos personalizados
// Garantia de que a tela de resultados sempre mostra conteúdo formatado

interface UserData {
  company: string;
  jobTitle: string;
  score: number;
  responses: Record<string, string | string[]>;
  language?: string;
}

interface UserProfile {
  isManagerRole: boolean;
  primaryChallenge: string;
  careerAmbition: string;
  teamSize: string;
  industry: string;
  urgency: string;
  readinessLevel: string;
  focusArea: string;
  authorityLevel: string;
}

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

// Análise inteligente das respostas do usuário
function analyzeUserProfile(userData: UserData): UserProfile {
  const { responses, jobTitle, score } = userData;
  
  // Determinar o perfil do usuário baseado nas respostas
  const challenge = (typeof responses['department-challenge'] === 'string' ? responses['department-challenge'] : '') || '';
  const careerPosition = (typeof responses['career-positioning'] === 'string' ? responses['career-positioning'] : '') || '';
  const departmentSize = (typeof responses['department-size'] === 'string' ? responses['department-size'] : '') || '';
  const industry = (typeof responses['industry-sector'] === 'string' ? responses['industry-sector'] : '') || '';
  const timeline = (typeof responses['implementation-timeline'] === 'string' ? responses['implementation-timeline'] : '') || '';
  
  return {
    isManagerRole: jobTitle.toLowerCase().includes('manager') || jobTitle.toLowerCase().includes('director') || jobTitle.toLowerCase().includes('lead') || jobTitle.toLowerCase().includes('ceo'),
    primaryChallenge: challenge,
    careerAmbition: careerPosition,
    teamSize: departmentSize,
    industry,
    urgency: timeline,
    readinessLevel: getReadinessLevel(score),
    focusArea: getFocusArea(challenge),
    authorityLevel: getAuthorityLevel(responses['approval-process'])
  };
}

function getReadinessLevel(score: number): 'beginner' | 'curious' | 'explorer' | 'champion' {
  if (score >= 80) return 'champion';
  if (score >= 60) return 'explorer';
  if (score >= 40) return 'curious';
  return 'beginner';
}

function getFocusArea(challenge: string): string {
  if (challenge.includes('roi-pressure')) return 'ROI e Resultados';
  if (challenge.includes('team-burden')) return 'Produtividade da Equipe';
  if (challenge.includes('budget-constraints')) return 'Otimização Orçamentária';
  if (challenge.includes('career-protection')) return 'Desenvolvimento de Carreira';
  return 'Eficiência Operacional';
}

function getAuthorityLevel(approvalProcess: string | string[] | undefined): 'high' | 'medium' | 'low' {
  const process = typeof approvalProcess === 'string' ? approvalProcess : '';
  if (process.includes('directly')) return 'high';
  if (process.includes('manager approval')) return 'medium';
  return 'low';
}

// Gerador de resumo executivo personalizado
function generateExecutiveSummary(userData: UserData, profile: UserProfile): string {
  const { company, jobTitle, score } = userData;
  const isPortuguese = userData.language === 'pt';
  
  if (isPortuguese) {
    const performanceDesc = score >= 80 ? 'excelente' : score >= 60 ? 'promissora' : score >= 40 ? 'sólida' : 'inicial';
    const opportunityDesc = score >= 80 ? 'liderar a transformação digital' : score >= 60 ? 'ser pioneiro em IA' : 'estabelecer expertise em IA';
    
    return `Como ${jobTitle} na ${company}, sua pontuação de ${score}/100 demonstra uma base ${performanceDesc} para ${opportunityDesc} em seu departamento. ${profile.focusArea} representa sua principal oportunidade de impacto, com potencial para aumentar a eficiência operacional em 25-40% nos próximos 6 meses. Esta é uma janela estratégica ideal para se posicionar como líder em inovação, implementar soluções que aceleram resultados da equipe, e estabelecer sua carreira como especialista em transformação digital. O momento é perfeito para tomar a iniciativa e se tornar a referência em IA dentro da organização.`;
  } else {
    const performanceDesc = score >= 80 ? 'excellent' : score >= 60 ? 'promising' : score >= 40 ? 'solid' : 'foundational';
    const opportunityDesc = score >= 80 ? 'lead digital transformation' : score >= 60 ? 'pioneer AI adoption' : 'establish AI expertise';
    
    return `As ${jobTitle} at ${company}, your score of ${score}/100 demonstrates a ${performanceDesc} foundation to ${opportunityDesc} in your department. ${profile.focusArea} represents your primary opportunity for impact, with potential to increase operational efficiency by 25-40% within the next 6 months. This is an ideal strategic window to position yourself as an innovation leader, implement solutions that accelerate team results, and establish your career as a digital transformation specialist.`;
  }
}

// Função para analisar contexto operacional de forma inteligente
function analyzeOperationalContext(operationalText: string, isPortuguese: boolean) {
  const text = operationalText.toLowerCase();
  
  // Detectar tipos de processos baseados em palavras-chave
  const processTypes = {
    documentation: ['documento', 'relatório', 'proposta', 'apresentação', 'email', 'document', 'report', 'proposal', 'presentation', 'writing'],
    dataEntry: ['planilha', 'dados', 'entrada', 'digitação', 'sistema', 'excel', 'spreadsheet', 'data', 'entry', 'input', 'typing'],
    coordination: ['reunião', 'coordenação', 'follow-up', 'acompanhamento', 'meeting', 'coordination', 'tracking', 'management'],
    analysis: ['análise', 'revisão', 'leitura', 'verificação', 'analysis', 'review', 'reading', 'verification', 'checking'],
    communication: ['comunicação', 'contato', 'resposta', 'atendimento', 'communication', 'contact', 'response', 'support']
  };
  
  // Detectar área de impacto
  for (const [type, keywords] of Object.entries(processTypes)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return { processType: type, originalContext: operationalText };
    }
  }
  
  return { processType: 'general', originalContext: operationalText };
}

// Gerador de desafios departamentais
function generateDepartmentChallenges(userData: UserData, profile: UserProfile): string[] {
  const isPortuguese = userData.language === 'pt';
  const { responses } = userData;
  
  const customChallenges: string[] = [];
  
  // Adicionar desafio específico baseado no contexto operacional do usuário (análise inteligente)
  if (responses['operational-challenges']) {
    const context = analyzeOperationalContext(responses['operational-challenges'] as string, isPortuguese);
    
    let contextualChallenge = '';
    if (context.processType === 'documentation') {
      contextualChallenge = isPortuguese ? 
        'Elaboração de documentos e propostas consome recursos significativos da equipe, limitando foco em atividades estratégicas' :
        'Document and proposal creation consumes significant team resources, limiting focus on strategic activities';
    } else if (context.processType === 'dataEntry') {
      contextualChallenge = isPortuguese ? 
        'Entrada manual de dados gera gargalos operacionais e riscos de inconsistências nos sistemas' :
        'Manual data entry creates operational bottlenecks and risks of system inconsistencies';
    } else if (context.processType === 'coordination') {
      contextualChallenge = isPortuguese ? 
        'Coordenação de processos e reuniões demanda tempo excessivo de liderança, reduzindo capacidade estratégica' :
        'Process and meeting coordination demands excessive leadership time, reducing strategic capacity';
    } else if (context.processType === 'analysis') {
      contextualChallenge = isPortuguese ? 
        'Análise manual de informações reduz agilidade na tomada de decisões e cria gargalos analíticos' :
        'Manual information analysis reduces decision-making agility and creates analytical bottlenecks';
    } else if (context.processType === 'communication') {
      contextualChallenge = isPortuguese ? 
        'Comunicações repetitivas consomem tempo produtivo e limitam foco em interações estratégicas' :
        'Repetitive communications consume productive time and limit focus on strategic interactions';
    } else {
      contextualChallenge = isPortuguese ? 
        'Processos operacionais manuais limitam escalabilidade e eficiência departamental' :
        'Manual operational processes limit departmental scalability and efficiency';
    }
    
    customChallenges.push(contextualChallenge);
  }
  
  // Desafios baseados no perfil e situação específica
  if (profile.primaryChallenge.includes('team-burden')) {
    const challenge = isPortuguese ?
      `Sobrecarga da equipe de ${profile.teamSize} está limitando capacidade de foco em iniciativas estratégicas de IA` :
      `Team overload with ${profile.teamSize} is limiting capacity to focus on strategic AI initiatives`;
    customChallenges.push(challenge);
  }
  
  if (profile.primaryChallenge.includes('roi-pressure')) {
    const challenge = isPortuguese ?
      `Pressão para demonstrar ROI tangível em ${profile.industry} sem comprometer operações atuais` :
      `Pressure to demonstrate tangible ROI in ${profile.industry} without compromising current operations`;
    customChallenges.push(challenge);
  }
  
  if (profile.authorityLevel === 'low') {
    const challenge = isPortuguese ?
      'Limitações de aprovação orçamentária dificultam implementação de soluções tecnológicas necessárias' :
      'Budget approval limitations hinder implementation of necessary technological solutions';
    customChallenges.push(challenge);
  }
  
  // Desafios baseados na urgência
  if (profile.urgency.includes('imediata') || profile.urgency.includes('immediate')) {
    const challenge = isPortuguese ?
      'Necessidade de resultados rápidos conflita com tempo necessário para implementação adequada de IA' :
      'Need for quick results conflicts with time required for proper AI implementation';
    customChallenges.push(challenge);
  }
  
  // Completar com desafios padrão se necessário
  const standardChallenges = isPortuguese ? [
    'Análise de dados é feita de forma reativa, perdendo oportunidades de insights proativos para decisões estratégicas',
    'Falta de automação resulta em erros humanos e retrabalho, impactando produtividade e moral da equipe',
    'Processos departamentais não escaláveis limitam crescimento e eficiência operacional',
    'Dificuldade em manter vantagem competitiva sem adoção de tecnologias emergentes',
    'Necessidade de demonstrar liderança em inovação para avançar na carreira e ganhar reconhecimento'
  ] : [
    'Data analysis is done reactively, missing opportunities for proactive insights for strategic decisions',
    'Lack of automation results in human errors and rework, impacting productivity and team morale',
    'Non-scalable departmental processes limit growth and operational efficiency',
    'Difficulty maintaining competitive advantage without adopting emerging technologies',
    'Need to demonstrate innovation leadership to advance career and gain recognition'
  ];
  
  // Adicionar desafios padrão até ter 5 total
  for (const challenge of standardChallenges) {
    if (customChallenges.length >= 5) break;
    customChallenges.push(challenge);
  }
  
  return customChallenges.slice(0, 5);
}

// Gerador de impacto na carreira
function generateCareerImpact(userData: UserData, profile: UserProfile) {
  const { company, jobTitle } = userData;
  const isPortuguese = userData.language === 'pt';
  
  // Personalizar baseado no nível de autoridade e ambição
  const timeGain = profile.authorityLevel === 'high' ? '12-15' : profile.authorityLevel === 'medium' ? '8-12' : '6-10';
  const productivityIncrease = profile.readinessLevel === 'champion' ? '40-50%' : profile.readinessLevel === 'explorer' ? '30-40%' : '25-35%';
  const marketValueIncrease = profile.isManagerRole ? '50-70%' : '40-60%';
  
  if (isPortuguese) {
    return {
      personal_productivity: `Como ${jobTitle} na ${company}, você ganhará ${timeGain} horas semanais através da automação inteligente de ${profile.focusArea.toLowerCase()}, permitindo dedicação a iniciativas estratégicas que demonstram liderança visionária. Com foco em ${profile.industry}, isso resultará em maior visibilidade junto à liderança e acesso a projetos de alto impacto.`,
      
      team_performance: `Sua equipe de ${profile.teamSize} experimentará aumento de ${productivityIncrease} na produtividade através de soluções de IA personalizadas para ${profile.focusArea.toLowerCase()}, melhorando significativamente a moral e estabelecendo você como o líder que transforma departamentos através da tecnologia. ${profile.primaryChallenge.includes('team-burden') ? 'Especialmente importante dado a atual sobrecarga da equipe.' : 'Isso criará um ambiente de trabalho mais engajado e resultados mensuráveis.'}`,
      
      leadership_recognition: `Liderar a implementação de IA em ${profile.industry} estabelecerá você como inovador na ${company}, criando oportunidades de mentoria, projetos cross-funcionais e reconhecimento da diretoria como especialista em transformação digital. ${profile.authorityLevel === 'high' ? 'Sua alta autonomia de decisão acelera esse reconhecimento.' : profile.authorityLevel === 'medium' ? 'Trabalhar com aprovações gerenciais demonstrará capacidade de influência ascendente.' : 'Mesmo com limitações orçamentárias, demonstrará capacidade de inovação dentro de restrições.'} Isso posicionará você para promoções e aumentos salariais.`,
      
      professional_growth: `Desenvolver expertise em IA específica para ${profile.industry} o tornará um profissional altamente valorizado, aumentando suas opções de carreira e valor de mercado em ${marketValueIncrease}. ${profile.careerAmbition.includes('Liderando') ? 'Sua postura proativa em liderar iniciativas de IA acelerará oportunidades de liderança sênior.' : profile.careerAmbition.includes('Explorando') ? 'Sua abordagem exploratória em IA criará bases sólidas para crescimento sustentado.' : 'Seu desenvolvimento gradual em IA estabelecerá credibilidade duradoura no mercado.'} Além disso, posicionará você para promoções e oportunidades de liderança sênior em tecnologia e inovação.`
    };
  } else {
    return {
      personal_productivity: `As ${jobTitle} at ${company}, you'll gain ${timeGain} hours weekly through intelligent automation of ${profile.focusArea.toLowerCase()}, allowing dedication to strategic initiatives that demonstrate visionary leadership. With focus on ${profile.industry}, this will result in greater visibility with leadership and access to high-impact projects.`,
      
      team_performance: `Your team of ${profile.teamSize} will experience a ${productivityIncrease} increase in productivity through AI solutions personalized for ${profile.focusArea.toLowerCase()}, significantly improving morale and establishing you as the leader who transforms departments through technology. ${profile.primaryChallenge.includes('team-burden') ? 'Especially important given current team overload.' : 'This will create a more engaged work environment and measurable results.'}`,
      
      leadership_recognition: `Leading AI implementation in ${profile.industry} will establish you as an innovator at ${company}, creating opportunities for mentorship, cross-functional projects, and recognition from leadership as a digital transformation specialist. ${profile.authorityLevel === 'high' ? 'Your high decision autonomy accelerates this recognition.' : profile.authorityLevel === 'medium' ? 'Working with managerial approvals will demonstrate upward influence capability.' : 'Even with budget limitations, will demonstrate innovation capacity within constraints.'} This positions you for promotions and salary increases.`,
      
      professional_growth: `Developing AI expertise specific to ${profile.industry} will make you a highly valued professional, increasing your career options and market value by ${marketValueIncrease}. ${profile.careerAmbition.includes('Leading') ? 'Your proactive stance in leading AI initiatives will accelerate senior leadership opportunities.' : profile.careerAmbition.includes('Exploring') ? 'Your exploratory approach to AI will create solid foundations for sustained growth.' : 'Your gradual development in AI will establish lasting credibility in the market.'} Additionally, it will position you for promotions and senior leadership opportunities in technology and innovation.`
    };
  }
}

// Gerador de quick wins
function generateQuickWins(userData: UserData, profile: UserProfile) {
  const isPortuguese = userData.language === 'pt';
  const { responses } = userData;
  
  if (isPortuguese) {
    const month1Actions = [];
    
    // Ação específica baseada no contexto operacional do usuário (análise inteligente)
    if (responses['operational-challenges']) {
      const context = analyzeOperationalContext(responses['operational-challenges'] as string, isPortuguese);
      
      let smartAction = '';
      let smartImpact = '';
      
      if (context.processType === 'documentation') {
        smartAction = 'Implementar IA para automação de criação de documentos e propostas usando templates inteligentes';
        smartImpact = 'Redução de 60-70% do tempo de elaboração documental e padronização da qualidade';
      } else if (context.processType === 'dataEntry') {
        smartAction = 'Configurar automação para entrada e validação de dados usando RPA e IA';
        smartImpact = 'Eliminação de 80-90% dos erros de digitação e aceleração de processos em 5x';
      } else if (context.processType === 'coordination') {
        smartAction = 'Implementar assistente de IA para agendamento e follow-up automatizado de reuniões';
        smartImpact = 'Economia de 8-12 horas semanais em coordenação e melhoria na taxa de conclusão';
      } else if (context.processType === 'analysis') {
        smartAction = 'Configurar sistema de análise automatizada de dados usando IA para insights';
        smartImpact = 'Redução de 70% do tempo de análise e aumento da precisão analítica';
      } else if (context.processType === 'communication') {
        smartAction = 'Implementar chatbot inteligente para automação de comunicações repetitivas';
        smartImpact = 'Economia de 15-20 horas semanais e melhoria na consistência das respostas';
      } else {
        smartAction = 'Automatizar processos operacionais usando ferramentas de IA como ChatGPT ou Zapier';
        smartImpact = 'Redução de 60-80% do tempo gasto em tarefas manuais e eliminação de erros';
      }
      
      month1Actions.push({
        action: smartAction,
        impact: smartImpact
      });
    }
    
    // Segunda ação baseada no foco do departamento
    if (profile.focusArea.includes('ROI')) {
      month1Actions.push({
        action: 'Implementar dashboard de IA para rastreamento de KPIs e ROI em tempo real',
        impact: 'Demonstração imediata de valor mensurável para stakeholders e liderança'
      });
    } else if (profile.focusArea.includes('Produtividade')) {
      month1Actions.push({
        action: 'Implementar ChatGPT para automação de relatórios e comunicações da equipe',
        impact: `Economia de 8-12 horas semanais para equipe de ${profile.teamSize} e melhoria na qualidade das comunicações`
      });
    } else {
      month1Actions.push({
        action: `Introduzir assistente de IA para ${profile.focusArea.toLowerCase()} específico para ${profile.industry}`,
        impact: 'Insights especializados e capacidade de tomar decisões baseadas em dados do setor'
      });
    }
    
    // Preencher se necessário
    if (month1Actions.length < 2) {
      month1Actions.push({
        action: 'Criar sistema de análise automatizada de dados departamentais usando IA',
        impact: 'Insights em tempo real e capacidade de tomar decisões proativas baseadas em dados'
      });
    }

    const quarter1Goals = [
      {
        goal: `Estabelecer programa piloto de IA focado em ${profile.focusArea.toLowerCase()} com 3-5 processos automatizados`,
        outcome: `Case study interno demonstrando ROI de ${profile.readinessLevel === 'champion' ? '300-400%' : '200-300%'} e posicionamento como líder em inovação`
      },
      {
        goal: `Treinar equipe de ${profile.teamSize} em ferramentas de IA relevantes para ${profile.industry}`,
        outcome: 'Reconhecimento como mentor em tecnologia e criação de centro de excelência em IA departamental'
      }
    ];

    return { month_1_actions: month1Actions, quarter_1_goals: quarter1Goals };
  } else {
    const month1Actions = [];
    
    // Specific action based on user's operational context (intelligent analysis)
    if (responses['operational-challenges']) {
      const context = analyzeOperationalContext(responses['operational-challenges'] as string, isPortuguese);
      
      let smartAction = '';
      let smartImpact = '';
      
      if (context.processType === 'documentation') {
        smartAction = 'Implement AI for automated document and proposal creation using intelligent templates';
        smartImpact = '60-70% reduction in document creation time and standardized quality';
      } else if (context.processType === 'dataEntry') {
        smartAction = 'Configure automation for data entry and validation using RPA and AI';
        smartImpact = 'Elimination of 80-90% of typing errors and 5x process acceleration';
      } else if (context.processType === 'coordination') {
        smartAction = 'Implement AI assistant for automated meeting scheduling and follow-up';
        smartImpact = 'Save 8-12 hours weekly on coordination and improve completion rates';
      } else if (context.processType === 'analysis') {
        smartAction = 'Configure automated data analysis system using AI for insights';
        smartImpact = '70% reduction in analysis time and increased analytical precision';
      } else if (context.processType === 'communication') {
        smartAction = 'Implement intelligent chatbot for automating repetitive communications';
        smartImpact = 'Save 15-20 hours weekly and improve response consistency';
      } else {
        smartAction = 'Automate operational processes using AI tools like ChatGPT or Zapier';
        smartImpact = '60-80% reduction in time spent on manual tasks and error elimination';
      }
      
      month1Actions.push({
        action: smartAction,
        impact: smartImpact
      });
    }
    
    // Second action based on department focus
    if (profile.focusArea.includes('ROI')) {
      month1Actions.push({
        action: 'Implement AI dashboard for real-time KPI and ROI tracking',
        impact: 'Immediate demonstration of measurable value to stakeholders and leadership'
      });
    } else if (profile.focusArea.includes('Productivity')) {
      month1Actions.push({
        action: 'Implement ChatGPT for automation of team reports and communications',
        impact: `8-12 hours weekly savings for ${profile.teamSize} team and improved communication quality`
      });
    } else {
      month1Actions.push({
        action: `Introduce AI assistant for ${profile.focusArea.toLowerCase()} specific to ${profile.industry}`,
        impact: 'Specialized insights and ability to make data-driven industry-specific decisions'
      });
    }
    
    // Fill if necessary
    if (month1Actions.length < 2) {
      month1Actions.push({
        action: 'Create automated departmental data analysis system using AI',
        impact: 'Real-time insights and ability to make proactive data-driven decisions'
      });
    }

    const quarter1Goals = [
      {
        goal: `Establish AI pilot program focused on ${profile.focusArea.toLowerCase()} with 3-5 automated processes`,
        outcome: `Internal case study demonstrating ${profile.readinessLevel === 'champion' ? '300-400%' : '200-300%'} ROI and positioning as innovation leader`
      },
      {
        goal: `Train ${profile.teamSize} team in AI tools relevant to ${profile.industry}`,
        outcome: 'Recognition as technology mentor and creation of departmental AI center of excellence'
      }
    ];

    return { month_1_actions: month1Actions, quarter_1_goals: quarter1Goals };
  }
}

// Gerador de roadmap de implementação
function generateImplementationRoadmap(userData: UserData, profile: UserProfile) {
  const { company, jobTitle } = userData;
  const isPortuguese = userData.language === 'pt';
  
  // Ajustar duração baseado na autoridade e urgência
  const phase1Duration = profile.authorityLevel === 'high' ? '3-4 semanas' : '4-6 semanas';
  const phase2Duration = profile.urgency.includes('imediata') ? '6-8 semanas' : '8-12 semanas';
  const phase3Duration = profile.isManagerRole ? '3-4 meses' : '4-6 meses';
  
  if (isPortuguese) {
    return [
      {
        phase: 'Fase 1: Avaliação e Projeto Piloto',
        duration: phase1Duration,
        description: `Como ${jobTitle} na ${company}, você conduzirá análise detalhada dos processos de ${profile.focusArea.toLowerCase()} no setor de ${profile.industry}, identificará oportunidades de automação de alto impacto para equipe de ${profile.teamSize}, e implementará projeto piloto focado em ${userData.responses['operational-challenges'] ? 'processos operacionais específicos identificados' : 'processos críticos'}. ${profile.authorityLevel === 'high' ? 'Sua autonomia de decisão acelerará a implementação.' : 'Trabalhará com aprovações necessárias de forma estratégica.'} Estabelecerá métricas claras de sucesso e framework de avaliação de ROI específico para ${profile.industry}.`,
        career_benefit: `Posicionamento como líder estratégico e visionário em IA para ${profile.industry}, com credibilidade técnica demonstrada e visão de negócios alinhada às necessidades do setor`
      },
      {
        phase: 'Fase 2: Implementação e Escalonamento',
        duration: phase2Duration,
        description: `Implementação das soluções de IA selecionadas focadas em ${profile.focusArea.toLowerCase()}, treinamento especializado da equipe de ${profile.teamSize} em ferramentas relevantes para ${profile.industry}, monitoramento de resultados com KPIs específicos e ajustes baseados em feedback. ${profile.primaryChallenge.includes('team-burden') ? 'Prioridade em aliviar sobrecarga da equipe através de automação inteligente.' : 'Foco em demonstrar ROI mensurável e impacto operacional.'} Desenvolvimento de cases de sucesso internos e documentação de melhores práticas para replicação.`,
        career_benefit: `Demonstração de resultados tangíveis e liderança prática em ${profile.industry}, estabelecendo track record comprovado de sucesso em transformação digital departamental`
      },
      {
        phase: 'Fase 3: Liderança Organizacional e Expansão',
        duration: phase3Duration,
        description: `Expansão do programa de IA para processos mais complexos e outros departamentos na ${company}, estabelecimento como centro de excelência em IA específico para ${profile.industry}, mentoria de outros líderes departamentais em implementação de IA. ${profile.careerAmbition.includes('Liderando') ? 'Liderança de iniciativas cross-funcionais e estratégia organizacional de IA.' : 'Desenvolvimento gradual de influência organizacional através de resultados comprovados.'} Criação de programa de capacitação organizacional e estratégia de longo prazo para transformação digital.`,
        career_benefit: `Reconhecimento como especialista organizacional líder em IA para ${profile.industry}, posicionamento para promoção executiva e aumento significativo de valor de mercado como profissional de transformação digital`
      }
    ];
  } else {
    return [
      {
        phase: 'Phase 1: Assessment and Pilot Project',
        duration: phase1Duration,
        description: `As ${jobTitle} at ${company}, you'll conduct detailed analysis of ${profile.focusArea.toLowerCase()} processes in ${profile.industry} sector, identify high-impact automation opportunities for ${profile.teamSize} team, and implement pilot project focused on ${userData.responses['operational-challenges'] ? 'specific operational processes identified' : 'critical processes'}. ${profile.authorityLevel === 'high' ? 'Your decision autonomy will accelerate implementation.' : 'Will work strategically with necessary approvals.'} Establish clear success metrics and ROI evaluation framework specific to ${profile.industry}.`,
        career_benefit: `Positioning as strategic leader and AI visionary for ${profile.industry}, with demonstrated technical credibility and business vision aligned to sector needs`
      },
      {
        phase: 'Phase 2: Implementation and Scaling',
        duration: phase2Duration,
        description: `Implementation of selected AI solutions focused on ${profile.focusArea.toLowerCase()}, specialized training of ${profile.teamSize} team in tools relevant to ${profile.industry}, results monitoring with specific KPIs and feedback-based adjustments. ${profile.primaryChallenge.includes('team-burden') ? 'Priority on relieving team overload through intelligent automation.' : 'Focus on demonstrating measurable ROI and operational impact.'} Development of internal success cases and documentation of best practices for replication.`,
        career_benefit: `Demonstration of tangible results and practical leadership in ${profile.industry}, establishing proven track record of departmental digital transformation success`
      },
      {
        phase: 'Phase 3: Organizational Leadership and Expansion',
        duration: phase3Duration,
        description: `Expansion of AI program to more complex processes and other departments at ${company}, establishment as AI center of excellence specific to ${profile.industry}, mentoring other departmental leaders in AI implementation. ${profile.careerAmbition.includes('Leading') ? 'Leadership of cross-functional initiatives and organizational AI strategy.' : 'Gradual development of organizational influence through proven results.'} Creation of organizational capacity building program and long-term digital transformation strategy.`,
        career_benefit: `Recognition as leading organizational AI specialist for ${profile.industry}, positioning for executive promotion and significant increase in market value as digital transformation professional`
      }
    ];
  }
}

// Função principal para gerar relatório fallback
export function generateFallbackReport(userData: UserData): ReportData {
  console.log('🛡️ Generating fallback report for:', userData.company);
  
  const profile = analyzeUserProfile(userData);
  
  const report: ReportData = {
    executive_summary: generateExecutiveSummary(userData, profile),
    department_challenges: generateDepartmentChallenges(userData, profile),
    career_impact: generateCareerImpact(userData, profile),
    quick_wins: generateQuickWins(userData, profile),
    implementation_roadmap: generateImplementationRoadmap(userData, profile)
  };
  
  console.log('✅ Fallback report generated successfully');
  return report;
}

// Função para converter o relatório em JSON string
export function generateFallbackReportJSON(userData: UserData): string {
  try {
    const report = generateFallbackReport(userData);
    return JSON.stringify(report, null, 2);
  } catch (error) {
    console.error('❌ Error generating fallback report:', error);
    
    // Último recurso: relatório mínimo básico
    const minimalReport = {
      executive_summary: `Relatório personalizado para ${userData.jobTitle} na ${userData.company}. Score: ${userData.score}/100. Oportunidades de IA identificadas para seu departamento.`,
      department_challenges: ['Análise de desafios específicos para seu departamento'],
      career_impact: {
        personal_productivity: 'Aumento de produtividade através de ferramentas de IA',
        team_performance: 'Melhoria no desempenho da equipe',
        leadership_recognition: 'Reconhecimento como líder em inovação',
        professional_growth: 'Crescimento profissional através de expertise em IA'
      },
      quick_wins: {
        month_1_actions: [{ action: 'Implementar primeira ferramenta de IA', impact: 'Resultados imediatos' }],
        quarter_1_goals: [{ goal: 'Estabelecer programa piloto', outcome: 'Base para expansão' }]
      },
      implementation_roadmap: [
        {
          phase: 'Fase 1: Início',
          duration: '4 semanas',
          description: 'Primeiros passos na implementação de IA',
          career_benefit: 'Estabelecimento como líder em tecnologia'
        }
      ]
    };
    
    return JSON.stringify(minimalReport, null, 2);
  }
}