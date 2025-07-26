import Anthropic from '@anthropic-ai/sdk';
import { 
  Agent,
  ProcessedContext,
  DiagnosticOutput,
  ActionPlannerOutput,
  StorytellerOutput,
  TransformationStory,
  MotivationalElement,
  CtaPrep
} from './types';

interface StorytellerInput {
  context: ProcessedContext;
  diagnosticOutput: DiagnosticOutput;
  actionPlannerOutput: ActionPlannerOutput;
}

export class StorytellerAgent implements Agent<StorytellerInput, StorytellerOutput> {
  name = 'StorytellerAgent';
  private anthropic: Anthropic;

  constructor(anthropic: Anthropic) {
    this.anthropic = anthropic;
  }

  async process(input: StorytellerInput): Promise<StorytellerOutput> {
    const { context, diagnosticOutput, actionPlannerOutput } = input;
    const prompt = this.buildPrompt(context, diagnosticOutput, actionPlannerOutput);
    
    console.log('📖 StorytellerAgent Starting Generation...');
    console.log('📖 Company:', context.company);
    console.log('📖 Job Title:', context.jobTitle);
    console.log('📖 Language:', context.language);
    console.log('📖 Readiness Level:', context.profile.readinessLevel);
    console.log('📖 Primary Opportunity:', diagnosticOutput.primaryOpportunity);
    console.log('📖 Quick Win Available:', actionPlannerOutput.quickWins[0]?.action || 'Not available');
    console.log('📖 Quarterly Vision:', actionPlannerOutput.quarterlyVision.vision);
    console.log('📖 Prompt Length:', prompt.length);
    
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const response = message.content[0].type === 'text' ? message.content[0].text : '';
      console.log('📖 StorytellerAgent Raw Response Length:', response.length);
      console.log('📖 StorytellerAgent Raw Response (First 500 chars):');
      console.log(response.substring(0, 500));
      console.log('📖 StorytellerAgent Raw Response (Full):');
      console.log('='.repeat(80));
      console.log(response);
      console.log('='.repeat(80));
      
      const result = this.parseResponse(response, context);
      
      console.log('📖 StorytellerAgent Parsed Results:');
      console.log('📖 Transformation Story Current State:', result.transformationNarrative.currentState);
      console.log('📖 Transformation Story Journey Steps:', result.transformationNarrative.journeySteps);
      console.log('📖 Transformation Story Future State:', result.transformationNarrative.futureState);
      console.log('📖 Transformation Story Inspiration:', result.transformationNarrative.inspirationalNote);
      console.log('📖 Motivational Elements Count:', result.motivationalElements.length);
      result.motivationalElements.forEach((element, index) => {
        console.log(`📖 Motivational Element ${index + 1} (${element.type}):`, element.message);
      });
      console.log('📖 CTA Prep - Solo Limitations:', result.ctaPreparation.limitationsOfSolo);
      console.log('📖 CTA Prep - Guidance Benefits:', result.ctaPreparation.benefitsOfGuidance);
      console.log('📖 CTA Prep - Urgency Creator:', result.ctaPreparation.urgencyCreator);
      console.log('📖 CTA Prep - Natural Lead In:', result.ctaPreparation.naturalLeadIn);
      
      return result;
    } catch (error) {
      console.error('📖 StorytellerAgent error:', error);
      return this.generateFallback(context, diagnosticOutput, actionPlannerOutput);
    }
  }

  private buildPrompt(
    context: ProcessedContext, 
    diagnostic: DiagnosticOutput,
    actionPlan: ActionPlannerOutput
  ): string {
    const isPortuguese = context.language === 'pt';
    
    // Extract key metrics from diagnostic output
    const quantifiedMatch = diagnostic.quantifiedImpact.match(/R\$ ([\d.,]+)\/mês/);
    const monthlySavings = quantifiedMatch ? quantifiedMatch[1] : '25.000';
    
    const roiMatch = diagnostic.urgencyMessage.match(/ROI de (\d+)%/);
    const roi = roiMatch ? roiMatch[1] : '650';
    
    const paybackMatch = diagnostic.urgencyMessage.match(/payback em (\d+) dias/);
    const payback = paybackMatch ? paybackMatch[1] : '22';
    
    // Calculate range for estimation format
    const baseValue = parseInt(monthlySavings.replace(/\./g, ''));
    const minValue = Math.round(baseValue * 0.7);
    const maxValue = Math.round(baseValue * 1.3);
    
    return `You are a PREMIUM executive report writer creating an IMPRESSIVE summary for a ${context.jobTitle} at ${context.company}.

${isPortuguese ? 'IMPORTANTE: Responda inteiramente em português brasileiro.' : 'Respond in English.'}

DADOS CALCULADOS PELOS ESPECIALISTAS:
- Economia mensal: R$ ${monthlySavings}/mês (faixa: R$ ${minValue.toLocaleString('pt-BR')} a R$ ${maxValue.toLocaleString('pt-BR')})
- ROI projetado: ${roi}%
- Payback: ${payback} dias
- Processo crítico: ${context.responses['time-consuming-process']}
- Horas desperdiçadas: ${context.responses['weekly-hours-wasted']}/semana
- Orçamento: ${context.responses['monthly-budget-available']}

CONTEXTO DO USUÁRIO:
- Empresa: ${context.company}
- Cargo: ${context.jobTitle}
- Score: ${context.score}/100
- Quick Win: ${actionPlan.quickWins[0]?.action || 'Automação de processos'}
- Visão Q1: ${actionPlan.quarterlyVision.vision}

INSTRUÇÕES CRÍTICAS:
1. O executive_summary deve conter EXATAMENTE estes padrões para extração automática:
   - "economia de R$ [número]/mês" OU "R$ [número]/mês" (usar os valores calculados)
   - "ROI de [número]%" (usar ${roi}%)
   - "payback em [número] dias" (usar ${payback} dias)

2. Use os números CALCULADOS, não invente outros
3. Seja OUSADO e ESPECÍFICO
4. Posicione como oportunidade de LIDERANÇA em IA

FORMATO EXATO (JSON):

{
  "executive_summary": "Com base na análise detalhada, ${context.company} pode alcançar economia de R$ ${monthlySavings}/mês automatizando ${context.responses['time-consuming-process']}. Com ${context.responses['weekly-hours-wasted']} horas semanais gastas neste processo e orçamento de ${context.responses['monthly-budget-available']}, recomendamos implementação gerando ROI de ${roi}% com payback em ${payback} dias. Score ${context.score}/100 indica excelente prontidão para começar imediatamente com quick wins.",
  
  "department_challenges": [
    "Processo de ${context.responses['time-consuming-process']} consome tempo excessivo da equipe",
    "Erros operacionais geram retrabalho e custos adicionais", 
    "Falta de automação limita crescimento e inovação",
    "Pressão por resultados sem ferramentas adequadas",
    "Necessidade de demonstrar liderança tecnológica"
  ],
  
  "career_impact": {
    "personal_productivity": "Economia de tempo significativa liberando ${context.jobTitle} para atividades estratégicas de alto valor.",
    "team_performance": "Equipe mais produtiva e engajada com processos automatizados e eficientes.",
    "leadership_recognition": "Liderança em inovação estabelecerá você como referência em transformação digital na ${context.company}.",
    "professional_growth": "Expertise em IA aumentará valor de mercado e oportunidades de carreira significativamente."
  },
  
  "quick_wins": {
    "month_1_actions": [
      { 
        "action": "${actionPlan.quickWins[0]?.action || 'Implementar automação inicial'}", 
        "impact": "Resultados visíveis em 2-3 semanas com economia imediata" 
      }
    ],
    "quarter_1_goals": [
      { 
        "goal": "${actionPlan.quarterlyVision.vision}", 
        "outcome": "ROI de ${roi}% documentado para apresentar à liderança" 
      }
    ]
  },
  
  "implementation_roadmap": [
    {
      "phase": "Implementação Rápida",
      "duration": "4-6 semanas",
      "description": "Deploy inicial com ferramentas dentro do orçamento disponível.",
      "career_benefit": "Demonstra capacidade de execução e visão estratégica"
    }
  ]
}

RESPONDA APENAS COM O JSON VÁLIDO. Use EXATAMENTE os números fornecidos: economia R$ ${monthlySavings}/mês, ROI ${roi}%, payback ${payback} dias.`;
  }

  private parseResponse(response: string, context: ProcessedContext): StorytellerOutput {
    try {
      // Try to parse as JSON first (new format)
      let reportData = null;
      try {
        // Clean response to extract JSON
        const cleanedResponse = response.trim();
        const jsonStart = cleanedResponse.indexOf('{');
        const jsonEnd = cleanedResponse.lastIndexOf('}');
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonStr = cleanedResponse.substring(jsonStart, jsonEnd + 1);
          reportData = JSON.parse(jsonStr);
          
          // Return the parsed JSON directly as a special StorytellerOutput
          return {
            transformationNarrative: {
              currentState: 'JSON report generated',
              journeySteps: ['Implementation planned'],
              futureState: 'Success achieved',
              inspirationalNote: 'Ready to execute'
            },
            motivationalElements: {
              successStory: 'Generated by AI',
              peerComparison: 'Leading the market',
              opportunityCost: 'Time is critical',
              vision: 'Future leader'
            },
            ctaPreparation: {
              soloLimitations: 'Complex implementation',
              guidanceBenefits: 'Expert support',
              urgency: 'Act now',
              naturalLead: 'Contact specialist'
            },
            reportData // Add the JSON data here for the orchestrator to use
          };
        }
      } catch (jsonError) {
        console.log('📖 Not JSON format, falling back to text parsing');
      }
      
      // Fall back to original text parsing if JSON fails
      const transformationStory = this.parseTransformationStory(response);
      const motivationalElements = this.parseMotivationalElements(response);
      const ctaPreparation = this.parseCtaPrep(response);

      return {
        transformationNarrative: transformationStory,
        motivationalElements,
        ctaPreparation
      };
    } catch (error) {
      console.error('Error parsing storyteller response:', error);
      return this.generateFallback(context, null, null);
    }
  }

  private parseTransformationStory(response: string): TransformationStory {
    const storySection = response.match(/=== TRANSFORMATION STORY ===([\s\S]*?)(?==== MOTIVATIONAL ELEMENTS|$)/);
    
    if (storySection) {
      const currentMatch = storySection[0].match(/CURRENT STATE:([\s\S]*?)(?=JOURNEY:|$)/);
      const journeyMatch = storySection[0].match(/JOURNEY:([\s\S]*?)(?=FUTURE STATE:|$)/);
      const futureMatch = storySection[0].match(/FUTURE STATE:([\s\S]*?)(?=INSPIRATION:|$)/);
      const inspirationMatch = storySection[0].match(/INSPIRATION:([\s\S]*?)(?====|$)/);
      
      const journeySteps = this.parseJourneySteps(journeyMatch ? journeyMatch[1] : '');
      
      return {
        currentState: currentMatch ? currentMatch[1].trim() : '',
        journeySteps,
        futureState: futureMatch ? futureMatch[1].trim() : '',
        inspirationalNote: inspirationMatch ? inspirationMatch[1].trim() : ''
      };
    }
    
    return this.getDefaultTransformationStory();
  }

  private parseJourneySteps(journeyText: string): string[] {
    const steps: string[] = [];
    const stepMatches = journeyText.matchAll(/Step \d+:\s*(.+)/g);
    
    for (const match of stepMatches) {
      steps.push(match[1].trim());
    }
    
    return steps.length > 0 ? steps : ['Start', 'Build', 'Scale', 'Lead'];
  }

  private parseMotivationalElements(response: string): MotivationalElement[] {
    const elements: MotivationalElement[] = [];
    const motivationalSection = response.match(/=== MOTIVATIONAL ELEMENTS ===([\s\S]*?)(?==== CTA PREPARATION|$)/);
    
    if (motivationalSection) {
      // Parse success story
      const successMatch = motivationalSection[0].match(/SUCCESS_STORY:([\s\S]*?)(?=PEER_COMPARISON:|$)/);
      if (successMatch) {
        elements.push({
          type: 'success-story',
          message: successMatch[1].trim()
        });
      }
      
      // Parse peer comparison
      const peerMatch = motivationalSection[0].match(/PEER_COMPARISON:([\s\S]*?)(?=OPPORTUNITY_COST:|$)/);
      if (peerMatch) {
        elements.push({
          type: 'peer-comparison',
          message: peerMatch[1].trim()
        });
      }
      
      // Parse opportunity cost
      const costMatch = motivationalSection[0].match(/OPPORTUNITY_COST:([\s\S]*?)(?=VISION:|$)/);
      if (costMatch) {
        elements.push({
          type: 'opportunity-cost',
          message: costMatch[1].trim()
        });
      }
      
      // Parse vision
      const visionMatch = motivationalSection[0].match(/VISION:([\s\S]*?)(?====|$)/);
      if (visionMatch) {
        elements.push({
          type: 'vision',
          message: visionMatch[1].trim()
        });
      }
    }
    
    return elements.length > 0 ? elements : this.getDefaultMotivationalElements();
  }

  private parseCtaPrep(response: string): CtaPrep {
    const ctaSection = response.match(/=== CTA PREPARATION ===([\s\S]*?)$/);
    
    if (ctaSection) {
      const limitationsMatch = ctaSection[0].match(/SOLO_LIMITATIONS:([\s\S]*?)(?=GUIDANCE_BENEFITS:|$)/);
      const benefitsMatch = ctaSection[0].match(/GUIDANCE_BENEFITS:([\s\S]*?)(?=URGENCY:|$)/);
      const urgencyMatch = ctaSection[0].match(/URGENCY:([\s\S]*?)(?=NATURAL_LEAD:|$)/);
      const leadMatch = ctaSection[0].match(/NATURAL_LEAD:([\s\S]*?)$/);
      
      return {
        limitationsOfSolo: limitationsMatch ? limitationsMatch[1].trim() : '',
        benefitsOfGuidance: benefitsMatch ? benefitsMatch[1].trim() : '',
        urgencyCreator: urgencyMatch ? urgencyMatch[1].trim() : '',
        naturalLeadIn: leadMatch ? leadMatch[1].trim() : ''
      };
    }
    
    return this.getDefaultCtaPrep();
  }

  private generateFallback(
    context: ProcessedContext,
    _diagnostic: DiagnosticOutput | null,
    _actionPlan: ActionPlannerOutput | null
  ): StorytellerOutput {
    const isPortuguese = context.language === 'pt';
    
    return {
      transformationNarrative: this.getDefaultTransformationStory(isPortuguese),
      motivationalElements: this.getDefaultMotivationalElements(isPortuguese),
      ctaPreparation: this.getDefaultCtaPrep(isPortuguese)
    };
  }

  private getDefaultTransformationStory(isPortuguese = false): TransformationStory {
    return {
      currentState: isPortuguese ?
        `Como ${this.jobTitle} você enfrenta desafios diários com processos manuais que consomem seu tempo valioso, impedindo foco em estratégia e inovação.` :
        `As a ${this.jobTitle} you face daily challenges with manual processes that consume your valuable time, preventing focus on strategy and innovation.`,
      journeySteps: isPortuguese ? [
        'Semana 1: Primeiros processos mapeados e quick wins implementados',
        'Mês 1: Automações funcionando, equipe notando a diferença',
        'Mês 2: Resultados mensuráveis, reconhecimento da liderança',
        'Trimestre 1: Referência em eficiência e inovação no departamento'
      ] : [
        'Week 1: First processes mapped and quick wins implemented',
        'Month 1: Automations working, team noticing the difference',
        'Month 2: Measurable results, leadership recognition',
        'Quarter 1: Reference in efficiency and innovation in the department'
      ],
      futureState: isPortuguese ?
        'Em 90 dias, você será reconhecido como líder em transformação digital, com processos 40% mais eficientes e tempo para iniciativas estratégicas.' :
        'In 90 days, you\'ll be recognized as a digital transformation leader, with 40% more efficient processes and time for strategic initiatives.',
      inspirationalNote: isPortuguese ?
        'Você tem tudo que precisa para liderar esta transformação. O plano está claro, os resultados são alcançáveis, e o momento é agora.' :
        'You have everything you need to lead this transformation. The plan is clear, the results are achievable, and the moment is now.'
    };
  }

  private getDefaultMotivationalElements(isPortuguese = false): MotivationalElement[] {
    return [
      {
        type: 'success-story',
        message: isPortuguese ?
          'Um gerente de operações similar ao seu perfil implementou estas ações e em 60 dias reduziu 30% do trabalho manual, ganhando promoção em 6 meses.' :
          'An operations manager similar to your profile implemented these actions and in 60 days reduced manual work by 30%, earning promotion in 6 months.'
      },
      {
        type: 'peer-comparison',
        message: isPortuguese ?
          'Enquanto 70% dos profissionais ainda lutam com processos manuais, você estará entre os 30% que lideram com tecnologia.' :
          'While 70% of professionals still struggle with manual processes, you\'ll be among the 30% who lead with technology.'
      },
      {
        type: 'opportunity-cost',
        message: isPortuguese ?
          'Cada semana sem automação representa 15 horas perdidas e R$ 3k em ineficiência. Em 3 meses, isso soma R$ 36k que poderia ser investido em crescimento.' :
          'Each week without automation represents 15 hours lost and $3k in inefficiency. In 3 months, that adds up to $36k that could be invested in growth.'
      },
      {
        type: 'vision',
        message: isPortuguese ?
          'Imagine: daqui a 90 dias, processos rodando automaticamente, equipe focada em estratégia, e você reconhecido como o líder que transformou o departamento.' :
          'Imagine: 90 days from now, processes running automatically, team focused on strategy, and you recognized as the leader who transformed the department.'
      }
    ];
  }

  private getDefaultCtaPrep(isPortuguese = false): CtaPrep {
    return {
      limitationsOfSolo: isPortuguese ?
        'Implementar sozinho é possível, mas requer tempo para pesquisa, testes e ajustes que podem atrasar resultados.' :
        'Implementing alone is possible, but requires time for research, testing and adjustments that can delay results.',
      benefitsOfGuidance: isPortuguese ?
        'Com orientação especializada, profissionais aceleram resultados em 3x, evitam erros comuns e implementam melhores práticas desde o início.' :
        'With expert guidance, professionals accelerate results by 3x, avoid common mistakes and implement best practices from the start.',
      urgencyCreator: isPortuguese ?
        'A janela de oportunidade para se destacar com IA está se fechando. Em 6 meses, será requisito básico, não diferencial.' :
        'The window of opportunity to stand out with AI is closing. In 6 months, it will be a basic requirement, not a differentiator.',
      naturalLeadIn: isPortuguese ?
        'Você tem o plano, a motivação e a visão. Imagine o que conseguiria com um parceiro experiente acelerando sua jornada...' :
        'You have the plan, motivation and vision. Imagine what you could achieve with an experienced partner accelerating your journey...'
    };
  }

  private jobTitle = 'professional'; // Default fallback
}