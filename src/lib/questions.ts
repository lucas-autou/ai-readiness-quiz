export interface QuizQuestion {
  id: string;
  question: string;
  subtitle?: string;
  type: 'multiple-choice' | 'scale' | 'card-select' | 'slider' | 'ranking' | 'multi-select' | 'multi-card-select' | 'text-area';
  options?: string[];
  cards?: { title: string; description: string; value: string; icon?: string }[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
  weight: number;
  personalizable?: boolean;
  multiSelect?: boolean; // Enable multiple selections
  maxSelections?: number; // Optional limit on selections
  placeholder?: string; // For text-area type
  maxLength?: number; // Character limit for text-area
  optional?: boolean; // Mark question as optional
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'time-consuming-process',
    question: "Qual processo repetitivo consome mais tempo da sua equipe toda semana?",
    subtitle: "Seja específico - vamos calcular o ROI de automatizar isso",
    type: 'card-select',
    cards: [
      {
        title: "Relatórios e Análises",
        description: "Consolidar dados de múltiplas fontes, criar dashboards, PowerPoints",
        value: "reporting-analytics",
        icon: "📊"
      },
      {
        title: "Atendimento e Respostas",
        description: "Emails repetitivos, suporte ao cliente, FAQs, tickets", 
        value: "customer-support",
        icon: "💬"
      },
      {
        title: "Gestão de Documentos",
        description: "Contratos, propostas, aprovações, controle de versões",
        value: "document-management",
        icon: "📄"
      },
      {
        title: "Entrada e Processamento de Dados",
        description: "Digitação manual, transferência entre sistemas, validações",
        value: "data-entry",
        icon: "⌨️"
      }
    ],
    weight: 5,
    personalizable: true
  },
  {
    id: 'weekly-hours-wasted',
    question: "Quantas horas por semana sua equipe gasta nesse processo?",
    subtitle: "Some todos para chegar no total (ex: 5 pessoas x 4h cada = 20h)",
    type: 'slider',
    scaleMin: 5,
    scaleMax: 100,
    scaleLabels: { min: "5 horas", max: "100+ horas" },
    weight: 5,
    personalizable: true
  },
  {
    id: 'process-error-cost',
    question: "Quando erros acontecem nesse processo, qual é o impacto?",
    subtitle: "Pense em retrabalho, perda de clientes, multas, atrasos",
    type: 'card-select',
    cards: [
      {
        title: "Baixo Impacto",
        description: "Pequenos atrasos, retrabalho de menos de 1 hora",
        value: "low-impact",
        icon: "🟢"
      },
      {
        title: "Médio Impacto",
        description: "Retrabalho de horas, reclamações de clientes, atrasos em entregas",
        value: "medium-impact",
        icon: "🟡"
      },
      {
        title: "Alto Impacto",
        description: "Perda de clientes, multas, danos à reputação, dias de retrabalho",
        value: "high-impact",
        icon: "🔴"
      },
      {
        title: "Crítico",
        description: "Perdas financeiras significativas, riscos de compliance, impacto legal",
        value: "critical-impact",
        icon: "🚨"
      }
    ],
    weight: 4
  },
  {
    id: 'monthly-budget-available',
    question: "Qual orçamento mensal você consegue aprovar ou influenciar para ferramentas de IA?",
    subtitle: "Seja realista - isso define o tipo de solução que podemos recomendar",
    type: 'multiple-choice',
    options: [
      "Até R$ 500/mês - Aprovo sozinho pequenas ferramentas",
      "R$ 500-2.000/mês - Preciso justificar mas consigo aprovar", 
      "R$ 2.000-10.000/mês - Preciso de aprovação do diretor",
      "Acima de R$ 10.000/mês - Decisão de comitê executivo"
    ],
    weight: 5
  },
  {
    id: 'current-tech-stack',
    question: "Quais sistemas sua equipe usa diariamente? (selecione todos)",
    subtitle: "Vamos recomendar soluções que se integram com suas ferramentas",
    type: 'multi-card-select',
    multiSelect: true,
    cards: [
      {
        title: "Excel/Google Sheets",
        description: "Planilhas para dados e relatórios",
        value: "spreadsheets",
        icon: "📊"
      },
      {
        title: "CRM (Salesforce, HubSpot)",
        description: "Gestão de clientes e vendas",
        value: "crm",
        icon: "👥"
      },
      {
        title: "ERP (SAP, Oracle, TOTVS)",
        description: "Sistema integrado de gestão",
        value: "erp",
        icon: "🏢"
      },
      {
        title: "Email/Comunicação",
        description: "Outlook, Gmail, Teams, Slack",
        value: "communication",
        icon: "📧"
      },
      {
        title: "BI/Analytics",
        description: "Power BI, Tableau, Looker",
        value: "analytics",
        icon: "📈"
      },
      {
        title: "Sistemas Próprios",
        description: "Software desenvolvido internamente",
        value: "custom",
        icon: "🔧"
      }
    ],
    weight: 3
  },
  {
    id: 'success-metric',
    question: "Qual métrica de sucesso seria mais valiosa para você apresentar em 90 dias?",
    subtitle: "Escolha o resultado que mais impressionaria sua liderança",
    type: 'card-select',
    cards: [
      {
        title: "Redução de 50% no Tempo",
        description: "Processos que levavam dias agora levam horas",
        value: "time-reduction",
        icon: "⏱️"
      },
      {
        title: "Economia de R$ 20k+/mês", 
        description: "Redução comprovada de custos operacionais",
        value: "cost-savings",
        icon: "💰"
      },
      {
        title: "Zero Erros Críticos",
        description: "Eliminação de erros caros e retrabalho",
        value: "error-elimination",
        icon: "✅"
      },
      {
        title: "ROI de 300%+",
        description: "Retorno mensurável sobre investimento em IA",
        value: "roi-achievement",
        icon: "📈"
      }
    ],
    weight: 4,
    personalizable: true
  },
  {
    id: 'implementation-urgency',
    question: "Até quando você precisa mostrar resultados com IA?",
    subtitle: "Seja realista sobre pressões e expectativas",
    type: 'multiple-choice',
    options: [
      "30 dias - Pressão imediata por resultados",
      "90 dias - Fim do trimestre, preciso de quick wins",
      "6 meses - Tempo para implementação estruturada",
      "Sem pressa - Explorando possibilidades"
    ],
    weight: 3
  },
  {
    id: 'team-impact-size',
    question: "Quantas pessoas seriam impactadas positivamente pela automação?",
    subtitle: "Inclua sua equipe direta e outros departamentos beneficiados",
    type: 'multiple-choice',
    options: [
      "1-5 pessoas - Impacto localizado",
      "6-20 pessoas - Departamento inteiro",
      "21-50 pessoas - Múltiplas equipes",
      "51-100 pessoas - Área completa",
      "100+ pessoas - Impacto organizacional"
    ],
    weight: 3
  },
  {
    id: 'industry-sector',
    question: "Em qual setor sua empresa atua?",
    subtitle: "Vamos dar exemplos específicos do seu mercado",
    type: 'card-select',
    cards: [
      {
        title: "Tecnologia/SaaS",
        description: "Software, serviços digitais, plataformas",
        value: "technology",
        icon: "💻"
      },
      {
        title: "Indústria/Manufatura",
        description: "Produção, supply chain, operações industriais", 
        value: "manufacturing",
        icon: "🏭"
      },
      {
        title: "Saúde/Farmacêutico",
        description: "Hospitais, clínicas, laboratórios, farmácias",
        value: "healthcare",
        icon: "🏥"
      },
      {
        title: "Serviços Financeiros",
        description: "Bancos, seguros, fintech, investimentos",
        value: "financial",
        icon: "🏦"
      },
      {
        title: "Varejo/E-commerce",
        description: "Lojas físicas, online, marketplace",
        value: "retail",
        icon: "🛒"
      },
      {
        title: "Serviços Profissionais",
        description: "Consultoria, advocacia, contabilidade, agências",
        value: "services",
        icon: "💼"
      }
    ],
    weight: 3
  },
  {
    id: 'biggest-ai-concern',
    question: "Qual sua maior preocupação ao implementar IA?",
    subtitle: "Vamos endereçar isso especificamente no seu roadmap",
    type: 'card-select',
    cards: [
      {
        title: "Segurança dos Dados",
        description: "Proteção de informações confidenciais da empresa",
        value: "data-security",
        icon: "🔒"
      },
      {
        title: "Resistência da Equipe",
        description: "Medo de mudança ou substituição de empregos",
        value: "team-resistance",
        icon: "👥"
      },
      {
        title: "Falha na Implementação",
        description: "Projeto não entregar os resultados prometidos",
        value: "implementation-failure",
        icon: "⚠️"
      },
      {
        title: "Custo vs Benefício",
        description: "ROI não justificar o investimento",
        value: "roi-concern",
        icon: "💸"
      }
    ],
    weight: 3
  },
  {
    id: 'specific-process-description',
    question: "Descreva exatamente como funciona hoje o processo que você quer automatizar",
    subtitle: "Quanto mais detalhes, mais preciso será nosso roadmap de IA para você",
    type: 'text-area',
    placeholder: "Exemplo: Todo dia extraio dados de vendas do Salesforce (30min), copio para Excel (15min), cruzo com dados do ERP (45min), formato relatório no PowerPoint (2h), envio para 5 gerentes aprovarem. Se alguém pede mudança, refaço tudo. Total: 4h/dia.",
    maxLength: 800,
    optional: false,
    weight: 5,
    personalizable: true
  }
];

export function calculateScore(responses: Record<string, string | string[]>): number {
  let totalScore = 0;
  let totalWeight = 0;

  quizQuestions.forEach(question => {
    const response = responses[question.id];
    if (!response) return;

    let points = 0;
    let maxPoints = 5; // Default max points

    // Custom scoring for new actionable questions
    switch (question.id) {
      case 'time-consuming-process':
        // Higher scores for processes with more automation potential
        const processMap: Record<string, number> = {
          'reporting-analytics': 5, // High automation potential
          'data-entry': 4, // Very repetitive
          'customer-support': 3, // Moderate automation
          'document-management': 3 // Moderate automation
        };
        points = processMap[response as string] || 2;
        maxPoints = 5;
        break;

      case 'weekly-hours-wasted':
        // Higher scores for more hours wasted (more opportunity)
        const hours = parseInt(response as string);
        if (hours >= 80) points = 5;
        else if (hours >= 50) points = 4;
        else if (hours >= 30) points = 3;
        else if (hours >= 15) points = 2;
        else points = 1;
        maxPoints = 5;
        break;

      case 'process-error-cost':
        // Higher scores for higher impact (more value in fixing)
        const errorMap: Record<string, number> = {
          'critical-impact': 5,
          'high-impact': 4,
          'medium-impact': 2,
          'low-impact': 1
        };
        points = errorMap[response as string] || 1;
        maxPoints = 5;
        break;

      case 'monthly-budget-available':
        // Higher scores for more budget authority
        const budgetMap: Record<string, number> = {
          'Até R$ 500/mês - Aprovo sozinho pequenas ferramentas': 2,
          'R$ 500-2.000/mês - Preciso justificar mas consigo aprovar': 3,
          'R$ 2.000-10.000/mês - Preciso de aprovação do diretor': 4,
          'Acima de R$ 10.000/mês - Decisão de comitê executivo': 5
        };
        points = budgetMap[response as string] || 1;
        maxPoints = 5;
        break;

      case 'implementation-urgency':
        // Higher scores for more urgency (ready to act)
        const urgencyMap: Record<string, number> = {
          '30 dias - Pressão imediata por resultados': 5,
          '90 dias - Fim do trimestre, preciso de quick wins': 4,
          '6 meses - Tempo para implementação estruturada': 3,
          'Sem pressa - Explorando possibilidades': 1
        };
        points = urgencyMap[response as string] || 1;
        maxPoints = 5;
        break;

      case 'team-impact-size':
        // Higher scores for larger impact
        const impactMap: Record<string, number> = {
          '1-5 pessoas - Impacto localizado': 1,
          '6-20 pessoas - Departamento inteiro': 2,
          '21-50 pessoas - Múltiplas equipes': 3,
          '51-100 pessoas - Área completa': 4,
          '100+ pessoas - Impacto organizacional': 5
        };
        points = impactMap[response as string] || 1;
        maxPoints = 5;
        break;

      case 'success-metric':
        // All metrics are valuable, slight preference for ROI
        const metricMap: Record<string, number> = {
          'roi-achievement': 5,
          'cost-savings': 4,
          'time-reduction': 4,
          'error-elimination': 3
        };
        points = metricMap[response as string] || 3;
        maxPoints = 5;
        break;

      case 'current-tech-stack':
        // More tools = better integration readiness
        if (Array.isArray(response)) {
          points = Math.min(response.length, 5);
          maxPoints = 5;
        }
        break;

      case 'biggest-ai-concern':
        // Lower scores for bigger concerns (more barriers)
        const concernMap: Record<string, number> = {
          'data-security': 3, // Valid but manageable
          'team-resistance': 2, // Requires change management
          'implementation-failure': 2, // Fear-based
          'roi-concern': 3 // Financial focus is good
        };
        points = concernMap[response as string] || 2;
        maxPoints = 5;
        break;

      case 'specific-process-description':
        // Score based on detail level
        if (typeof response === 'string') {
          const textLength = response.trim().length;
          if (textLength >= 400) points = 5; // Very detailed
          else if (textLength >= 200) points = 4; // Good detail
          else if (textLength >= 100) points = 3; // Some detail
          else if (textLength >= 50) points = 2; // Basic
          else points = 1; // Minimal
          maxPoints = 5;
        }
        break;

      default:
        // Default scoring for other questions
        if (question.type === 'multiple-choice' && question.options) {
          const index = question.options.indexOf(response as string);
          points = index >= 0 ? index + 1 : 1;
          maxPoints = question.options.length;
        } else {
          points = 3; // Default middle score
          maxPoints = 5;
        }
    }

    // Normalize to 0-1 scale, then apply weight
    const normalizedScore = points / maxPoints;
    totalScore += normalizedScore * question.weight;
    totalWeight += question.weight;
  });

  return Math.round((totalScore / totalWeight) * 100);
}