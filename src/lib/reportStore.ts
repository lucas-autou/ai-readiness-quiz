// Serverless-compatible report store
// Uses in-memory storage for Vercel deployment (stateless functions)
// In production, reports should be stored directly in Supabase database

// In-memory storage for the current function execution
const reportCache = new Map<string, { report: string; timestamp: number }>();

// In-memory storage for slug → ID mapping when database doesn't have share_slug column
const slugToIdCache = new Map<string, string>();

// Type definition for quiz response
export type QuizResponse = {
  id: number;
  email: string;
  company: string;
  job_title: string;
  responses: Record<string, string | string[]>;
  score: number;
  ai_report: string | null;
  created_at: string;
};

// Extended storage for mock database entries when Supabase is not available
const mockDatabase = new Map<string, QuizResponse>();

// Initialize with test data for ID 78
mockDatabase.set('78', {
  id: 78,
  email: 'test@autou.com',
  company: 'autou',
  job_title: 'Gerente de Projetos',
  responses: {
    'industry-sector': 'Technology',
    'department-size': '10-25 pessoas',
    'company-context': 'Startup em crescimento',
    'department-challenge': 'Automação de processos',
    'career-positioning': 'Busco liderança em inovação',
    'department-focus': 'Operações e eficiência',
    'current-tools': 'Ferramentas básicas',
    'leadership-pressure': 'Média pressão por resultados',
    'implementation-timeline': '3-6 meses',
    'approval-process': 'Preciso aprovação da diretoria',
    'success-metric': 'Redução de tempo em processos'
  },
  score: 60,
  ai_report: null,
  created_at: new Date().toISOString()
});

export function storeAIReport(responseId: string, report: string): void {
  try {
    console.log('📝 Storing report in memory for key:', responseId, 'length:', report.length);
    
    reportCache.set(responseId, {
      report,
      timestamp: Date.now()
    });
    
    console.log('📝 Report stored in memory cache');
    
    // Note: In serverless environment, this data only persists for the current function execution
    // For production, store directly in Supabase database instead
  } catch (error) {
    console.error('❌ Error storing AI report:', error);
  }
}

export function getAIReport(responseId: string): string | null {
  try {
    console.log('🔍 Looking for report in memory cache:', responseId);
    
    // For testing - return structured JSON report for ID 78
    if (responseId === '78') {
      console.log('📝 Returning test structured JSON report for ID 78');
      return JSON.stringify({
        "executive_summary": "Como profissional na autou, sua pontuação de 60/100 demonstra um potencial significativo para liderar a implementação de IA em seu departamento. Esta é uma oportunidade estratégica para se posicionar como líder em inovação, implementar soluções que aumentarão a eficiência operacional em 25-40%, e estabelecer sua carreira como especialista em transformação digital. O momento é ideal para tomar a iniciativa e se tornar referência em IA dentro da organização, especialmente considerando a crescente demanda por líderes com expertise em tecnologia.",
        "department_challenges": [
          "Processos manuais consomem tempo excessivo da equipe, limitando foco em atividades estratégicas e inovação",
          "Falta de automação resulta em erros humanos e retrabalho, impactando produtividade e moral da equipe",
          "Análise de dados é feita de forma reativa, perdendo oportunidades de insights proativos para tomada de decisão",
          "Pressão crescente por resultados mais rápidos sem ferramentas adequadas para acelerar processos críticos",
          "Necessidade de demonstrar inovação e liderança tecnológica para avançar na carreira e ganhar reconhecimento"
        ],
        "career_impact": {
          "personal_productivity": "Você ganhará 8-12 horas semanais através da automação de tarefas repetitivas, permitindo foco em estratégia de alto nível e iniciativas que demonstram liderança visionária dentro da autou. Isso resultará em maior visibilidade junto à diretoria e oportunidades de projetos estratégicos.",
          "team_performance": "Sua equipe experimentará aumento de 30-45% na produtividade através de ferramentas de IA, melhorando a moral e estabelecendo você como o líder que transforma departamentos através da tecnologia. Isso criará um ambiente de trabalho mais engajado e resultados mensuráveis.",
          "leadership_recognition": "Liderar a implementação de IA estabelecerá você como inovador na autou, criando oportunidades de mentoria, projetos cross-funcionais e reconhecimento da diretoria como specialist em transformação digital. Isso posicionará você para promoções e aumentos salariais.",
          "professional_growth": "Desenvolver expertise em IA o tornará um profissional altamente valorizado, aumentando suas opções de carreira e valor de mercado em 40-60%, além de posicioná-lo para promoções e oportunidades de liderança sênior em tecnologia e inovação."
        },
        "quick_wins": {
          "month_1_actions": [
            {
              "action": "Implementar ChatGPT para automação de relatórios e comunicações internas da equipe",
              "impact": "Economia de 6-8 horas semanais e melhoria na qualidade das comunicações departamentais"
            },
            {
              "action": "Introduzir ferramentas de IA para análise básica de dados e dashboards automatizados",
              "impact": "Insights em tempo real e capacidade de tomar decisões baseadas em dados de forma proativa"
            }
          ],
          "quarter_1_goals": [
            {
              "goal": "Estabelecer programa piloto de IA com 3 processos automatizados e métricas de sucesso claras",
              "outcome": "Demonstração concreta de ROI e posicionamento como líder em inovação na autou"
            },
            {
              "goal": "Treinar equipe em ferramentas básicas de IA e criar framework de implementação departamental",
              "outcome": "Reconhecimento como mentor em tecnologia e preparação para expansão do programa de IA"
            }
          ]
        },
        "implementation_roadmap": [
          {
            "phase": "Fase 1: Avaliação e Fundação",
            "duration": "4-6 semanas",
            "description": "Análise detalhada dos processos atuais do departamento, identificação de oportunidades de automação de alto impacto, e seleção das primeiras ferramentas de IA para implementação piloto, estabelecendo métricas de sucesso e framework de avaliação de ROI.",
            "career_benefit": "Posicionamento como líder estratégico e visionário em IA, com credibilidade técnica e visão de negócios"
          },
          {
            "phase": "Fase 2: Implementação Piloto e Otimização",
            "duration": "8-12 semanas",
            "description": "Implementação das primeiras soluções de IA selecionadas, treinamento da equipe, monitoramento de resultados e ajustes baseados em feedback. Desenvolvimento de cases de sucesso e documentação de melhores práticas para replicação em outros departamentos.",
            "career_benefit": "Demonstração de resultados tangíveis e liderança prática, estabelecendo track record de sucesso em transformação digital"
          },
          {
            "phase": "Fase 3: Expansão e Liderança Organizacional",
            "duration": "3-6 meses",
            "description": "Expansão do programa de IA para processos mais complexos, mentoria de outros departamentos na autou, e estabelecimento como centro de excelência em IA. Desenvolvimento de programa de capacitação organizacional e estratégia de longo prazo para transformação digital.",
            "career_benefit": "Reconhecimento como especialista organizacional em IA, oportunidades de promoção para posições de liderança sênior e aumento significativo de valor de mercado"
          }
        ]
      }, null, 2);
    }
    
    const cached = reportCache.get(responseId);
    if (!cached) {
      console.log('🔍 Report not found in memory cache');
      return null;
    }
    
    console.log('🔍 Found report in cache, length:', cached.report?.length || 0);
    return cached.report || null;
  } catch (error) {
    console.error('❌ Error reading AI report:', error);
    return null;
  }
}

export function getAllStoredReports(): { [responseId: string]: string } {
  try {
    const reports: { [responseId: string]: string } = {};
    
    reportCache.forEach((data, responseId) => {
      if (data.report) {
        reports[responseId] = data.report;
      }
    });
    
    return reports;
  } catch (error) {
    console.error('Error getting all reports:', error);
    return {};
  }
}

// Mock database functions for when Supabase is not available
export function storeMockQuizResponse(data: {
  id: number;
  email: string;
  company: string;
  job_title: string;
  responses: Record<string, string | string[]>;
  score: number;
  ai_report: string | null;
  created_at: string;
}): void {
  try {
    console.log('🗃️ Storing mock quiz response with ID:', data.id);
    mockDatabase.set(data.id.toString(), data);
  } catch (error) {
    console.error('❌ Error storing mock quiz response:', error);
  }
}

export function getMockQuizResponse(id: string): QuizResponse | null {
  try {
    console.log('🔍 Looking for mock quiz response with ID:', id);
    const result = mockDatabase.get(id);
    if (result) {
      console.log('✅ Found mock quiz response');
      return result;
    } else {
      console.log('❌ Mock quiz response not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting mock quiz response:', error);
    return null;
  }
}

// Slug mapping functions for fallback when database doesn't have share_slug column
export function storeSlugMapping(slug: string, responseId: string): void {
  try {
    console.log('🔗 Storing slug mapping:', slug, '→', responseId);
    slugToIdCache.set(slug, responseId);
  } catch (error) {
    console.error('❌ Error storing slug mapping:', error);
  }
}

export function getResponseIdBySlug(slug: string): string | null {
  try {
    console.log('🔍 Looking for response ID by slug:', slug);
    const responseId = slugToIdCache.get(slug);
    if (responseId) {
      console.log('✅ Found response ID:', responseId);
      return responseId;
    } else {
      console.log('❌ Slug mapping not found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting response ID by slug:', error);
    return null;
  }
}