import { NextRequest, NextResponse } from 'next/server';
import { insertQuizResponse, insertLead } from '@/lib/supabase';
import { storeAIReport, storeMockQuizResponse } from '@/lib/reportStore';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Utility function for generating test reports (kept for debugging)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateTestReport(data: {
  email: string;
  company: string;
  jobTitle: string;
  responses: Record<string, string | string[]>;
  score: number;
}): Promise<string> {
  const bottleneckAnalysis = generateBottleneckAnalysis(data.responses);
  const primaryBottleneck = getPrimaryBottleneck(data.responses);
  
  return `### ✅ Executive Summary

${data.company} operates in the ${data.responses['industry-sector']} sector with ${data.responses['company-size']} revenue scale, facing immediate operational challenges in ${primaryBottleneck.toLowerCase()} processes. With ${data.responses['competitor-reality']?.toString().toLowerCase() || 'moderate competitive pressure'} from market adoption of AI technologies, there's a strategic window of 6-12 months to establish competitive differentiation. Our analysis identifies potential for 25-40% efficiency gains and $2-5M annual cost savings through targeted AI implementation, positioning ${data.company} as an industry leader rather than a follower in digital transformation.

### 📊 AI Readiness Score + Benchmark Analysis

**Score: ${data.score}/100**

**What This Score Means for ${data.company}:**
- Industry benchmark comparison for ${data.jobTitle} roles in ${data.responses['industry-sector']} sector
- Specific strengths and critical gaps identified through comprehensive assessment
- Competitive positioning analysis based on current market adoption rates
- Strategic urgency level and competitive advantage window timeline
- Three immediate high-impact opportunities with projected ROI estimates

### 🚧 Key Bottlenecks Identified

**Primary Operational Challenges:**
${bottleneckAnalysis}

**Impact Assessment:**
- Current productivity loss: 8-12 hours per week per employee on manual tasks
- Annual cost of inefficiency: $1.2-3.8M based on ${data.responses['team-size']?.toString() || 'team size'} and operational overhead
- Competitive disadvantage timeline: 6-9 months to significant market position risk

### 💰 Estimated Cost Savings & ROI Potential

**Immediate Savings Opportunities:**
- Operational efficiency gains: $850K-2.1M annually through automation of ${primaryBottleneck.toLowerCase()} processes
- Time recovery for strategic work: 15-25 hours per week for leadership team
- Error reduction savings: $320K-680K from improved accuracy and reduced rework
- Competitive advantage capture: $1.8-4.2M additional revenue over 18 months

**Investment Requirements:**
- Phase 1 pilot implementation: $45K-85K (3-6 week deployment)
- Team training and change management: $25K-65K (ongoing 6 months)
- Technology platform and integration: $3K-12K monthly operational cost
- **Total ROI projection: 280-420% return within 12-18 months**

### 🔢 Prioritized Opportunities

**Top 3 Strategic Actions (Impact vs. Effort Analysis)**

**🥇 Priority 1: ${primaryBottleneck} Automation**
- **Action**: Deploy AI-powered automation for ${primaryBottleneck.toLowerCase()} optimization
- **Timeline**: 3-4 weeks implementation with pilot deployment
- **Investment**: $35K-55K total cost including setup and integration
- **Expected ROI**: 35-50% efficiency gain, $420K-750K annual savings
- **Why First**: Addresses primary operational pain point, immediate measurable impact

**🥈 Priority 2: AI Decision Support System**
- **Action**: Implement intelligent analytics and decision support platform
- **Timeline**: 6-10 weeks development and integration
- **Investment**: $65K-95K setup, training, and initial deployment
- **Expected ROI**: 25-40% improvement in decision-making speed and accuracy
- **Why Second**: Builds strategic capability, enables data-driven leadership

**🥉 Priority 3: Customer Experience Enhancement**
- **Action**: Deploy AI-powered customer service and engagement tools
- **Timeline**: 10-14 weeks full deployment with iterative rollout
- **Investment**: $85K-140K platform, integration, and optimization
- **Expected ROI**: 15-25% revenue increase through enhanced customer satisfaction
- **Why Third**: Market differentiation, requires operational foundation from priorities 1 & 2

### 🧭 Recommended Next Steps

1. **Launch a 4-6 week pilot program** focused on automating ${primaryBottleneck.toLowerCase()} processes, targeting 30-45% reduction in manual effort and $25K-40K monthly savings within 8 weeks.

2. **Establish AI governance council** with executive sponsorship (CEO/COO level) to oversee strategic implementation, change management, and ROI measurement across all initiatives.

3. **Complete technical readiness audit** of existing data infrastructure, API capabilities, and integration points to ensure seamless deployment and maximum value extraction.

4. **Engage certified AI implementation partner** for detailed technology selection, vendor negotiations, and 90-day tactical execution roadmap with specific milestones and success metrics.

---

### ✅ Final Note

This report outlines the top opportunities for strategic AI implementation based on your current readiness assessment. For further support or tailored implementation guidance, consult your AI advisor or solutions partner.

---

*This strategic analysis was developed specifically for ${data.company} leadership based on comprehensive assessment responses. Every recommendation includes precise investment requirements, expected outcomes, and implementation timelines tailored to your organization's current capabilities and strategic objectives.*`;
}

// Helper functions for multi-select support
function generateBottleneckAnalysis(responses: Record<string, string | string[]>): string {
  const bottlenecks: string[] = [];
  
  // Handle biggest-time-waster (multi-select)
  const timeWasters = responses['biggest-time-waster'];
  if (Array.isArray(timeWasters)) {
    bottlenecks.push(...timeWasters);
  } else if (typeof timeWasters === 'string') {
    bottlenecks.push(timeWasters);
  }
  
  // Handle current-bottleneck (multi-select)  
  const currentBottlenecks = responses['current-bottleneck'];
  if (Array.isArray(currentBottlenecks)) {
    bottlenecks.push(...currentBottlenecks);
  } else if (typeof currentBottlenecks === 'string') {
    bottlenecks.push(currentBottlenecks);
  }
  
  return bottlenecks.length > 0 
    ? bottlenecks.map(b => `- ${b.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`).join('\n')
    : '- Process inefficiencies requiring immediate attention';
}

function getPrimaryBottleneck(responses: Record<string, string | string[]>): string {
  // Get first bottleneck from biggest-time-waster or current-bottleneck
  const timeWasters = responses['biggest-time-waster'];
  const currentBottlenecks = responses['current-bottleneck'];
  
  let primary = '';
  if (Array.isArray(timeWasters) && timeWasters.length > 0) {
    primary = timeWasters[0];
  } else if (typeof timeWasters === 'string') {
    primary = timeWasters;
  } else if (Array.isArray(currentBottlenecks) && currentBottlenecks.length > 0) {
    primary = currentBottlenecks[0];
  } else if (typeof currentBottlenecks === 'string') {
    primary = currentBottlenecks;
  }
  
  return primary.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'operational inefficiencies';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, company, jobTitle, responses, score, language = 'en' } = body;

    // Validate required fields
    if (!email || !company || !jobTitle || !responses || score === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate AI report first
    let aiReport = null;
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        console.log('🤖 Generating AI report for:', company);
        
        // Generate the actual AI report
        aiReport = await generateAIReport({
          email,
          company,
          jobTitle,
          responses,
          score,
          language
        });
        
        if (aiReport) {
          console.log('✅ AI report generated successfully, length:', aiReport.length);
        } else {
          console.log('⚠️ AI report generation returned null');
        }
      } catch (error) {
        console.error('❌ Error generating AI report:', error);
        // Continue without AI report if it fails
      }
    } else {
      console.log('⚠️ No Anthropic API key found, skipping report generation');
    }

    // Insert quiz response into database with AI report
    const result = await insertQuizResponse({
      email,
      company,
      job_title: jobTitle,
      responses,
      score,
      ai_report: aiReport || undefined
    });

    console.log('💾 Stored quiz response and AI report in database for ID:', result.id);
    console.log('📊 Final result has AI report:', !!result.ai_report);
    
    // Always store AI report in memory store as a backup (for serverless compatibility)
    if (aiReport) {
      console.log('📝 Storing AI report in memory store as backup...');
      storeAIReport(result.id.toString(), aiReport);
      console.log('📝 Report stored in memory store');
    }

    // If this is a mock result (no Supabase), store it in the mock database as well
    if (!process.env.SUPABASE_URL) {
      console.log('🗃️ Storing complete result in mock database...');
      storeMockQuizResponse({
        id: result.id,
        email: result.email,
        company: result.company,
        job_title: result.job_title,
        responses: result.responses,
        score: result.score,
        ai_report: result.ai_report,
        created_at: result.created_at
      });
    }

    // Insert or update lead
    await insertLead({
      email,
      company,
      job_title: jobTitle,
      score,
      report_generated: true
    });

    return NextResponse.json({
      success: true,
      responseId: result.id,
      score,
      aiReport
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    
    // Check if it's a Supabase table not found error
    if (error instanceof Error && error.message.includes('relation') && error.message.includes('does not exist')) {
      return NextResponse.json(
        { 
          error: 'Database tables not found. Please create the Supabase tables first.',
          setupRequired: true,
          setupInstructions: 'Go to Supabase Dashboard > SQL Editor and run the table creation script provided in the console.'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateAIReport(data: {
  email: string;
  company: string;
  jobTitle: string;
  responses: Record<string, string | string[]>;
  score: number;
  language?: string;
}) {
  // Analyze quiz responses to build detailed persona
  const persona = analyzePersona(data.responses, data.jobTitle);
  // const industryInsights = getIndustryInsights(data.company, data.jobTitle);
  // const urgencyLevel = getUrgencyLevel(data.responses);
  // const bottleneckAnalysis = generateBottleneckAnalysis(data.responses);
  // const primaryBottleneck = getPrimaryBottleneck(data.responses);
  
  const languageInstruction = data.language === 'pt' ? 
    'IMPORTANT: Write the entire report in Portuguese (Brazilian Portuguese). All content must be in Portuguese.' : 
    'Write the report in English.';

  const prompt = `You are a career-focused AI consultant creating a premium departmental AI readiness report. This report is for a DEPARTMENT LEADER, not a CEO.

${languageInstruction}

DEPARTMENT LEADER PROFILE:
• Company: ${data.company}  
• Role: ${data.jobTitle}
• AI Readiness Score: ${data.score}/100
• Leadership Profile: ${persona}
• Industry: ${data.responses['industry-sector'] || 'General Business'}
• Department Size: ${data.responses['department-size'] || 'Not specified'}
• Company Context: ${data.responses['company-context'] || 'Not specified'}
• Primary Challenge: ${data.responses['department-challenge'] || 'Not specified'}
• Career Position: ${data.responses['career-positioning'] || 'Not specified'}
• Department Focus: ${data.responses['department-focus'] || 'Not specified'}
• Current Tech Stack: ${data.responses['current-tools'] || 'Not specified'}
• Leadership Pressure: ${data.responses['leadership-pressure'] || 'Unknown'}
• Implementation Timeline: ${data.responses['implementation-timeline'] || 'Unknown'}
• Approval Authority: ${data.responses['approval-process'] || 'Unknown'}
• Success Metric: ${data.responses['success-metric'] || 'Unknown'}

QUIZ RESPONSES ANALYSIS:
${Object.entries(data.responses).map(([key, value]) => `• ${key}: ${value}`).join('\n')}

Create a premium DEPARTMENT-FOCUSED report in CLEAN JSON format. This is for a MID-MANAGER, not a CEO. Focus on CAREER ADVANCEMENT and DEPARTMENTAL SUCCESS.

CRITICAL REQUIREMENTS:
1. Write concrete, actionable content - no placeholders or instructions
2. Reference ${data.jobTitle} at ${data.company} throughout with specific recommendations
3. Focus on their department area and provide detailed solutions
4. Scale recommendations to their actual situation and authority level
5. Provide specific metrics, timelines, and career benefits
6. Make it feel like a $1000+ personalized consulting report

CRITICAL: Return ONLY valid JSON. Start with { and end with }. No markdown formatting, no explanations, no text before or after the JSON.

Create detailed, specific content for each section:

{
  "executive_summary": "[Write 4-6 specific sentences for this ${data.jobTitle} at ${data.company}. Analyze their ${data.score}/100 score, address their primary challenges, explain how AI will advance their career, and position them as an innovation leader. Be concrete and personal.]",
  
  "department_challenges": [
    "[Convert their actual responses into 4-5 specific departmental challenges they face. Make these concrete problems they recognize, not generic statements. Use their actual company context and role.]"
  ],
  
  "career_impact": {
    "personal_productivity": "[Specific description of how AI will save this ${data.jobTitle} time and increase their personal effectiveness. Include estimated time savings and productivity gains.]",
    "team_performance": "[Concrete ways AI will improve their team's performance, with specific metrics and improvements they can expect.]",
    "leadership_recognition": "[Detailed explanation of how leading AI initiatives will position them for recognition and advancement within their organization.]",
    "professional_growth": "[Specific career advancement opportunities and skills they'll gain by becoming the AI champion in their department.]"
  },
  
  "quick_wins": {
    "month_1_actions": [
      { "action": "[Specific AI tool or process they can implement immediately in month 1]", "impact": "[Concrete result and benefit they'll see]" },
      { "action": "[Second specific action for month 1]", "impact": "[Specific measurable impact]" }
    ],
    "quarter_1_goals": [
      { "goal": "[Specific quarterly goal with metrics]", "outcome": "[Concrete outcome and career benefit]" },
      { "goal": "[Second quarterly goal]", "outcome": "[Specific result for their career]" }
    ]
  },
  
  "implementation_roadmap": [
    {
      "phase": "[Specific phase 1 name]",
      "duration": "[Realistic timeline: 4-6 weeks]",
      "description": "[Detailed description of what this ${data.jobTitle} will actually do in phase 1, specific to their department and authority level]",
      "career_benefit": "[Specific career advancement benefit from completing this phase]"
    },
    {
      "phase": "[Specific phase 2 name]", 
      "duration": "[Realistic timeline: 8-12 weeks]",
      "description": "[Detailed phase 2 activities specific to their role and team size]",
      "career_benefit": "[Concrete career advancement from this phase]"
    },
    {
      "phase": "[Specific phase 3 name]",
      "duration": "[Realistic timeline: 3-6 months]", 
      "description": "[Detailed expansion phase activities that position them as the AI expert]",
      "career_benefit": "[Specific promotion or recognition opportunities]"
    }
  ]
}

MANDATORY: Write actual content, not instructions. Make every sentence valuable and specific to this person's situation. Focus on their personal career advancement through AI leadership.`;

  console.log('📝 Sending prompt to Anthropic API, length:', prompt.length);
  
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  console.log('📨 Received response from Anthropic API');
  const textResult = message.content[0].type === 'text' ? message.content[0].text : null;
  
  if (textResult) {
    console.log('✅ AI response received, length:', textResult.length);
    console.log('📝 First 200 chars of response:', textResult.substring(0, 200));
    
    // Clean the response - remove any markdown formatting or explanations
    let cleanedText = textResult.trim();
    
    // Find JSON boundaries if there's extra text
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);
      console.log('🧹 Extracted JSON from position', firstBrace, 'to', lastBrace);
    }
    
    try {
      // Parse and validate the JSON response
      const jsonReport = JSON.parse(cleanedText);
      
      // Validate that it has the required structure for department-focused report
      if (jsonReport.executive_summary && jsonReport.department_challenges && 
          jsonReport.career_impact && jsonReport.quick_wins && jsonReport.implementation_roadmap) {
        console.log('✅ JSON report structure validated');
        return JSON.stringify(jsonReport, null, 2);
      } else {
        console.log('❌ Invalid JSON structure - missing required sections');
        console.log('Available keys:', Object.keys(jsonReport));
        
        // Create fallback structure with available data
        const fallbackReport = {
          executive_summary: jsonReport.executive_summary || jsonReport.summary || 
            `Como ${data.jobTitle} na ${data.company}, sua pontuação de ${data.score}/100 demonstra potencial para liderar a implementação de IA em seu departamento. Esta é uma oportunidade estratégica para se posicionar como líder em inovação, implementar soluções que aumentarão a eficiência operacional em 25-40%, e estabelecer sua carreira como especialista em transformação digital. O momento é ideal para tomar a iniciativa e se tornar referência em IA dentro da organização.`,
          
          department_challenges: jsonReport.department_challenges || jsonReport.challenges || [
            'Processos manuais consomem tempo excessivo da equipe, limitando foco em atividades estratégicas',
            'Falta de automação resulta em erros e retrabalho, impactando produtividade e moral da equipe',
            'Análise de dados é feita de forma reativa, perdendo oportunidades de insights proativos',
            'Pressão por resultados mais rápidos sem ferramentas adequadas para acelerar processos',
            'Necessidade de demonstrar inovação e liderança tecnológica para avançar na carreira'
          ],
          
          career_impact: jsonReport.career_impact || {
            personal_productivity: `Como ${data.jobTitle}, você ganhará 8-12 horas semanais através da automação de tarefas repetitivas, permitindo foco em estratégia de alto nível e iniciativas que demonstram liderança visionária dentro da ${data.company}.`,
            team_performance: `Sua equipe experimentará aumento de 30-45% na produtividade através de ferramentas de IA, melhorando a moral e estabelecendo você como o líder que transforma departamentos através da tecnologia.`,
            leadership_recognition: `Liderar a implementação de IA estabelecerá você como inovador na ${data.company}, criando oportunidades de mentoria, projetos cross-funcionais e reconhecimento da diretoria como specialist em transformação digital.`,
            professional_growth: `Desenvolver expertise em IA o tornará um profissional altamente valorizado, aumentando suas opções de carreira e valor de mercado, além de posicioná-lo para promoções e oportunidades de liderança sênior.`
          },
          
          quick_wins: jsonReport.quick_wins || {
            month_1_actions: [
              { 
                action: 'Implementar ferramentas de IA para automação de tarefas administrativas do departamento', 
                impact: 'Redução imediata de 6-8 horas semanais de trabalho manual, demonstrando valor tangível da IA' 
              },
              { 
                action: 'Configurar sistema de relatórios automatizados usando IA para análise de dados', 
                impact: 'Insights em tempo real que impressionam stakeholders e aceleram tomada de decisão' 
              }
            ],
            quarter_1_goals: [
              { 
                goal: 'Estabelecer programa piloto de IA com métricas claras de sucesso e ROI documentado', 
                outcome: 'Case study interno que sustenta expansão e estabelece você como líder em inovação' 
              },
              { 
                goal: 'Treinar equipe em ferramentas de IA e criar processo padronizado de adoção', 
                outcome: 'Reconhecimento como mentor e change agent, posicionando para responsabilidades maiores' 
              }
            ]
          },
          
          implementation_roadmap: jsonReport.implementation_roadmap || [
            {
              phase: 'Avaliação e Projeto Piloto',
              duration: '4-6 semanas', 
              description: `Como ${data.jobTitle}, você conduzirá análise detalhada dos processos departamentais, identificará oportunidades de maior impacto, e implementará projeto piloto de IA com métricas claras de sucesso.`,
              career_benefit: 'Demonstra capacidade de liderança estratégica e visão tecnológica para a alta direção'
            },
            {
              phase: 'Expansão e Otimização',
              duration: '8-12 semanas', 
              description: 'Expandir implementação para todos os processos relevantes, treinar equipe completamente, e estabelecer governança de IA no departamento.',
              career_benefit: 'Prova habilidades de change management e execution, qualificando para posições sênior'
            },
            {
              phase: 'Liderança Organizacional',
              duration: '3-6 meses', 
              description: 'Tornar-se consultor interno de IA, ajudar outros departamentos, e desenvolver estratégia de longo prazo para toda a organização.',
              career_benefit: 'Posiciona para promoção executiva como especialista em transformação digital'
            }
          ]
        };
        
        console.log('✅ Created fallback report structure');
        return JSON.stringify(fallbackReport, null, 2);
      }
    } catch (error) {
      console.log('❌ Failed to parse JSON response:', error);
      console.log('Raw response:', textResult.substring(0, 500));
      
      // As last resort, return the original text but log it for debugging
      return textResult;
    }
  } else {
    console.log('❌ No text content in Anthropic response:', message.content[0]);
    return null;
  }
}

// Helper functions to analyze responses and build persona
function analyzePersona(responses: Record<string, string | string[]>, jobTitle: string): string {
  const challenge = (typeof responses['department-challenge'] === 'string' ? responses['department-challenge'] : '') || '';
  const careerPosition = (typeof responses['career-positioning'] === 'string' ? responses['career-positioning'] : '') || '';
  const approvalProcess = (typeof responses['approval-process'] === 'string' ? responses['approval-process'] : '') || '';
  // const departmentSize = (typeof responses['department-size'] === 'string' ? responses['department-size'] : '') || '';
  
  // Use jobTitle and company for persona analysis
  const isManagerRole = jobTitle.toLowerCase().includes('manager') || jobTitle.toLowerCase().includes('director') || jobTitle.toLowerCase().includes('lead');
  const companyContext = responses['company-context'] || 'Mid-size Organization';
  
  let persona = '';
  
  // Determine primary persona type based on department challenge
  if (challenge.includes('roi-pressure')) {
    persona += 'Strategic Results-Driven Manager - ';
  } else if (challenge.includes('team-burden')) {
    persona += 'Operational Excellence Manager - ';
  } else if (challenge.includes('budget-constraints')) {
    persona += 'Resource-Conscious Leader - ';
  } else if (challenge.includes('career-protection')) {
    persona += 'Cautious Innovation Manager - ';
  }
  
  // Add context-aware modifiers
  if (isManagerRole) {
    persona += `${companyContext} Department Leader with `;
  } else {
    persona += `${companyContext} Team Member with `;
  }
  
  // Add career positioning modifier
  if (careerPosition.includes('Leading initiatives')) {
    persona += 'AI Champion Mindset';
  } else if (careerPosition.includes('Actively exploring')) {
    persona += 'Proactive AI Explorer';
  } else if (careerPosition.includes('Researching quietly')) {
    persona += 'Careful AI Evaluator';
  } else {
    persona += 'AI Learning Mode';
  }
  
  // Add authority modifier
  if (approvalProcess.includes('directly')) {
    persona += ', High Decision Authority';
  } else if (approvalProcess.includes('manager approval')) {
    persona += ', Moderate Decision Authority';
  } else {
    persona += ', Limited Decision Authority';
  }
  
  return persona;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getIndustryInsights(_company: string, _jobTitle: string): string {
  // Simple industry detection based on common patterns
  const companyLower = _company.toLowerCase();
  const titleLower = _jobTitle.toLowerCase();
  
  if (companyLower.includes('tech') || titleLower.includes('cto') || titleLower.includes('technology')) {
    return 'Technology sector - AI adoption is table stakes, focus on competitive differentiation';
  } else if (companyLower.includes('finance') || companyLower.includes('bank') || titleLower.includes('cfo')) {
    return 'Financial services - Regulatory compliance and risk management critical for AI implementation';
  } else if (companyLower.includes('healthcare') || companyLower.includes('medical')) {
    return 'Healthcare - Data privacy and accuracy paramount, huge automation opportunities';
  } else if (companyLower.includes('retail') || companyLower.includes('ecommerce')) {
    return 'Retail/E-commerce - Customer experience and inventory optimization are key AI wins';
  } else if (companyLower.includes('manufacturing')) {
    return 'Manufacturing - Predictive maintenance and quality control offer immediate ROI';
  } else if (titleLower.includes('marketing') || titleLower.includes('cmo')) {
    return 'Marketing focus - Personalization and customer insights drive revenue growth';
  } else {
    return 'Cross-industry applicable - Focus on operational efficiency and customer experience';
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getUrgencyLevel(_responses: Record<string, string | string[]>): string {
  const timeline = (typeof _responses['implementation-timeline'] === 'string' ? _responses['implementation-timeline'] : '') || '';
  const leadership = (typeof _responses['leadership-pressure'] === 'string' ? _responses['leadership-pressure'] : '') || '';
  const challenge = (typeof _responses['department-challenge'] === 'string' ? _responses['department-challenge'] : '') || '';
  
  if (timeline.includes('This month') || leadership.includes('Top priority') || challenge.includes('team-burden')) {
    return 'CRITICAL - Immediate department relief needed for team productivity';
  } else if (timeline.includes('Next quarter') || leadership.includes('Regular agenda') || challenge.includes('roi-pressure')) {
    return 'HIGH - Strategic opportunity to position as AI champion';
  } else {
    return 'MODERATE - Good opportunity for planned career advancement through AI leadership';
  }
}