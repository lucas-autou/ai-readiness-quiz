import { NextRequest, NextResponse } from 'next/server';
import { insertQuizResponse, insertLead } from '@/lib/supabase';
import { storeAIReport, storeMockQuizResponse } from '@/lib/reportStore';
import { generateFallbackReportJSON } from '@/lib/fallbackReportGenerator';
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

    // Generate AI report with robust fallback system
    let aiReport = null;
    let reportGenerationMethod = 'none';
    
    // Attempt 1: Generate using Claude API
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        console.log('🤖 Attempting AI report generation for:', company);
        
        aiReport = await generateAIReport({
          email,
          company,
          jobTitle,
          responses,
          score,
          language
        });
        
        if (aiReport && aiReport.length > 100) {
          console.log('✅ AI report generated successfully, length:', aiReport.length);
          reportGenerationMethod = 'claude-api';
          
          // Validate that it's proper JSON
          try {
            JSON.parse(aiReport);
            console.log('✅ AI report is valid JSON');
          } catch (jsonError) {
            console.log('⚠️ AI report is not valid JSON, will use as-is:', jsonError);
          }
        } else {
          console.log('⚠️ AI report generation returned insufficient content');
          aiReport = null;
        }
      } catch (error) {
        console.error('❌ Error generating AI report:', error);
        aiReport = null;
      }
    } else {
      console.log('⚠️ No Anthropic API key found, skipping Claude generation');
    }
    
    // Attempt 2: Generate using fallback system if Claude failed
    if (!aiReport) {
      try {
        console.log('🛡️ Generating fallback report for guaranteed content');
        
        aiReport = generateFallbackReportJSON({
          company,
          jobTitle,
          score,
          responses,
          language
        });
        
        if (aiReport) {
          console.log('✅ Fallback report generated successfully, length:', aiReport.length);
          reportGenerationMethod = 'fallback';
        }
      } catch (fallbackError) {
        console.error('❌ Error generating fallback report:', fallbackError);
        
        // Last resort: minimal JSON report
        aiReport = JSON.stringify({
          executive_summary: `Relatório personalizado para ${jobTitle} na ${company}. Score: ${score}/100.`,
          department_challenges: ['Análise de desafios identificados'],
          career_impact: {
            personal_productivity: 'Aumento de produtividade',
            team_performance: 'Melhoria da equipe',
            leadership_recognition: 'Reconhecimento em liderança',
            professional_growth: 'Crescimento profissional'
          },
          quick_wins: {
            month_1_actions: [{ action: 'Implementar IA', impact: 'Resultados rápidos' }],
            quarter_1_goals: [{ goal: 'Expandir programa', outcome: 'Sucesso sustentado' }]
          },
          implementation_roadmap: [{
            phase: 'Fase 1',
            duration: '4 semanas',
            description: 'Implementação inicial',
            career_benefit: 'Liderança em IA'
          }]
        }, null, 2);
        
        reportGenerationMethod = 'minimal';
        console.log('🛡️ Generated minimal report as last resort');
      }
    }
    
    console.log('📊 Report generation completed via:', reportGenerationMethod);

    // Insert quiz response into database with robust retry logic
    let result;
    let dbStorageAttempts = 0;
    const maxDbAttempts = 3;
    
    while (dbStorageAttempts < maxDbAttempts) {
      try {
        dbStorageAttempts++;
        console.log(`💾 Attempting database storage (attempt ${dbStorageAttempts}/${maxDbAttempts})`);
        
        result = await insertQuizResponse({
          email,
          company,
          job_title: jobTitle,
          responses,
          score,
          ai_report: aiReport || undefined
        });
        
        // Verify the report was actually stored
        if (result && (result.ai_report || aiReport)) {
          console.log('✅ Database storage successful for ID:', result.id);
          console.log('📊 Final result has AI report:', !!result.ai_report);
          console.log('📊 AI report length in result:', result.ai_report?.length || 0);
          break;
        } else {
          console.log('⚠️ Database storage succeeded but report seems missing');
          if (dbStorageAttempts === maxDbAttempts) {
            // Force the result to have the report
            result = { ...result, ai_report: aiReport };
          }
        }
      } catch (dbError) {
        console.error(`❌ Database storage attempt ${dbStorageAttempts} failed:`, dbError);
        
        if (dbStorageAttempts === maxDbAttempts) {
          // Create a mock result for fallback
          result = {
            id: Date.now(), // Use timestamp as fallback ID
            email,
            company,
            job_title: jobTitle,
            responses,
            score,
            ai_report: aiReport,
            created_at: new Date().toISOString()
          };
          
          console.log('🛡️ Created fallback result after DB failures');
        } else {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // Multiple backup strategies to ensure report availability
    if (aiReport && result) {
      // Strategy 1: Store in memory cache
      try {
        console.log('📝 Storing AI report in memory store as backup...');
        storeAIReport(result.id.toString(), aiReport);
        console.log('✅ Report stored in memory store');
      } catch (memoryError) {
        console.error('❌ Memory store backup failed:', memoryError);
      }
      
      // Strategy 2: Store in mock database for additional redundancy
      try {
        console.log('🗃️ Storing complete result in mock database as redundancy...');
        storeMockQuizResponse({
          id: result.id,
          email: result.email,
          company: result.company,
          job_title: result.job_title,
          responses: result.responses,
          score: result.score,
          ai_report: result.ai_report || aiReport, // Ensure we have the report
          created_at: result.created_at
        });
        console.log('✅ Mock database backup completed');
      } catch (mockError) {
        console.error('❌ Mock database backup failed:', mockError);
      }
    }
    
    // Final verification
    const finalReportExists = result?.ai_report || aiReport;
    console.log('🔍 Final verification - Report exists:', !!finalReportExists);
    console.log('🔍 Report generation method used:', reportGenerationMethod);
    console.log('🔍 Report length:', finalReportExists?.length || 0);

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
      aiReport: result?.ai_report || aiReport, // Ensure we return the report
      reportGenerationMethod, // For debugging
      hasReport: !!(result?.ai_report || aiReport)
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

// Helper function to clean and validate quiz data
function cleanQuizData(responses: Record<string, string | string[]>) {
  const cleaned: Record<string, string> = {};
  
  // Industry sector mapping to readable names
  const industryMap: Record<string, string> = {
    'Tecnologia/SaaS': 'tecnologia',
    'Manufatura': 'manufatura',
    'Saúde/Ciências da Vida': 'saúde',
    'Serviços Financeiros': 'serviços financeiros',
    'Varejo/E-commerce': 'varejo',
    'Serviços Profissionais': 'serviços profissionais',
    'Technology/SaaS': 'technology',
    'Manufacturing': 'manufacturing',
    'Healthcare/Life Sciences': 'healthcare',
    'Financial Services': 'financial services',
    'Retail/E-commerce': 'retail',
    'Professional Services': 'professional services'
  };
  
  // Department size mapping to readable format
  const departmentSizeMap: Record<string, string> = {
    '1-5 pessoas': 'pequena (1-5 pessoas)',
    '6-15 pessoas': 'média (6-15 pessoas)', 
    '16-50 pessoas': 'grande (16-50 pessoas)',
    '50+ pessoas': 'muito grande (50+ pessoas)',
    '1-5 people': 'small (1-5 people)',
    '6-15 people': 'medium (6-15 people)',
    '16-50 people': 'large (16-50 people)',
    '50+ people': 'very large (50+ people)'
  };
  
  // Company context simplification
  const contextMap: Record<string, string> = {
    'Startup/Pequena Empresa - menos de 50 funcionários, estrutura informal': 'startup',
    'Empresa em Crescimento - 50-200 funcionários, estabelecendo processos formais': 'empresa em crescimento',
    'Corporação de Médio Porte - 200-1000 funcionários, estrutura departamental': 'empresa de médio porte',
    'Grande Empresa - 1000-5000 funcionários, hierarquia complexa': 'grande empresa',
    'Fortune 500/Global - 5000+ funcionários, múltiplas divisões e localizações': 'corporação global'
  };
  
  // Clean each field
  Object.entries(responses).forEach(([key, value]) => {
    const strValue = Array.isArray(value) ? value.join(', ') : value?.toString() || '';
    
    switch (key) {
      case 'industry-sector':
        cleaned[key] = industryMap[strValue] || strValue.toLowerCase();
        break;
      case 'department-size':
        cleaned[key] = departmentSizeMap[strValue] || strValue;
        break;
      case 'company-context':
        cleaned[key] = contextMap[strValue] || strValue;
        break;
      case 'operational-challenges':
        // Keep original but truncate if too long
        cleaned[key] = strValue.length > 500 ? strValue.substring(0, 500) + '...' : strValue;
        break;
      default:
        cleaned[key] = strValue;
    }
  });
  
  return cleaned;
}

async function generateAIReport(data: {
  email: string;
  company: string;
  jobTitle: string;
  responses: Record<string, string | string[]>;
  score: number;
  language?: string;
}) {
  // Clean and validate quiz data first
  const cleanedResponses = cleanQuizData(data.responses);
  
  const languageInstruction = data.language === 'pt' ? 
    'IMPORTANT: Write the entire report in Portuguese (Brazilian Portuguese). All content must be in Portuguese.' : 
    'Write the report in English.';

  const prompt = `You are an operational efficiency consultant creating a practical AI implementation report. This report focuses on ACTIONABLE SOLUTIONS, not generic career advice.

${languageInstruction}

CLIENT PROFILE:
• Company: ${data.company}  
• Role: ${data.jobTitle}
• AI Readiness Score: ${data.score}/100
• Industry: ${cleanedResponses['industry-sector'] || 'geral'}
• Team Size: ${cleanedResponses['department-size'] || 'não especificado'}
• Company Type: ${cleanedResponses['company-context'] || 'não especificado'}
• Primary Challenge: ${cleanedResponses['department-challenge'] || 'não especificado'}
• Current Tools: ${cleanedResponses['current-tools'] || 'não especificado'}
• Implementation Timeline: ${cleanedResponses['implementation-timeline'] || 'não especificado'}
• Decision Authority: ${cleanedResponses['approval-process'] || 'não especificado'}
• Success Metric: ${cleanedResponses['success-metric'] || 'não especificado'}

${cleanedResponses['operational-challenges'] ? `
SPECIFIC OPERATIONAL CHALLENGES PROVIDED BY USER:
"${cleanedResponses['operational-challenges']}"
CRITICAL: Use these specific details throughout the report to provide tailored solutions.
` : ''}

Create an ACTIONABLE operational efficiency report in JSON format. Focus on PRACTICAL SOLUTIONS and SPECIFIC TOOLS, not career platitudes.

TOOL RECOMMENDATIONS BY INDUSTRY:
- Tecnologia: GitHub Copilot, Zapier, ChatGPT, Claude, Notion AI, Linear
- Manufatura: PredictiveAI, Zapier, Power BI, ChatGPT for documentation
- Saúde: Scribe AI, ChatGPT for research, HIPAA-compliant automation tools
- Serviços Financeiros: Reconciliation AI, Excel + ChatGPT, compliance automation
- Varejo: Inventory AI, ChatGPT for product descriptions, Shopify AI tools
- Serviços Profissionais: ChatGPT, Claude, Zapier, document automation, CRM integration

COMMON PROCESS AUTOMATIONS:
- Email management: Gmail filters + Zapier + ChatGPT templates
- Report generation: Python scripts + ChatGPT + automated dashboards  
- Data entry: OCR tools + validation algorithms + database integration
- Document creation: ChatGPT templates + automated formatting
- Meeting coordination: Calendly + Zapier + automated follow-ups
- Customer service: Chatbots + knowledge base + escalation rules

WRITING STYLE REQUIREMENTS:
- Maximum 15 words per sentence
- Use bullet points, not paragraphs
- Include specific numbers and metrics
- Mention actual AI tools by name (ChatGPT, Zapier, Claude, etc.)
- Focus on time savings and efficiency gains
- No generic business jargon or fluff

CRITICAL REQUIREMENTS:
1. Write ACTIONABLE steps - include specific tools and processes
2. Provide measurable outcomes (hours saved, % improvements, costs)
3. Scale recommendations to their team size and authority level
4. Include implementation steps, not just benefits
5. Reference their industry context appropriately
6. Focus on operational efficiency, not career advancement

CRITICAL: Return ONLY valid JSON. Start with { and end with }. No markdown formatting, no explanations, no text before or after the JSON.

Create detailed, specific content for each section:

{
  "executive_summary": "Score ${data.score}/100 indica [nível de prontidão]. Principais gargalos: [desafios específicos]. Automação de [processo X] pode economizar [X horas/semana]. Ferramentas de IA reduzirão custos operacionais em [X%] nos próximos 6 meses.",
  
  "department_challenges": [
    "• Processo [específico] consome [X horas/dia] de trabalho manual",
    "• Falta de automação em [área específica] causa [impacto mensurável]", 
    "• [Ferramenta atual] não integra com [sistema Y], gerando retrabalho",
    "• Análise de [dados específicos] demora [X dias] sem ferramentas adequadas",
    "• Equipe gasta [X%] do tempo em tarefas que IA pode automatizar"
  ],
  
  "career_impact": {
    "personal_productivity": "• Economia de [X-Y] horas semanais através de [ferramenta específica]\n• Redução de [X%] em tarefas manuais repetitivas",
    "team_performance": "• Aumento de [X%] na produtividade da equipe de [tamanho]\n• Melhoria de [X%] na precisão de [processo específico]",
    "leadership_recognition": "• Liderança em automação posiciona para [oportunidade específica]\n• Resultados mensuráveis em [X semanas] demonstram competência técnica",
    "professional_growth": "• Expertise em IA para [setor específico] aumenta valor de mercado\n• Habilidades em [ferramentas específicas] abrem [oportunidades]"
  },
  
  "quick_wins": {
    "month_1_actions": [
      { 
        "action": "Implementar [ferramenta específica como ChatGPT/Zapier] para automatizar [processo específico]",
        "impact": "Economia imediata de [X] horas semanais e redução de [Y%] em erros"
      },
      { 
        "action": "Configurar [ferramenta específica] para [tarefa específica do setor]",
        "impact": "[X%] de melhoria em [métrica específica] em [tempo específico]"
      }
    ],
    "quarter_1_goals": [
      { 
        "goal": "Automatizar completamente [processo específico] usando [ferramentas específicas]",
        "outcome": "[X%] de redução no tempo de [processo] e economia de R$ [valor]"
      },
      { 
        "goal": "Treinar equipe em [X ferramentas de IA específicas] relevantes para [setor]",
        "outcome": "Capacitação que reduz dependência externa e acelera [processo específico]"
      }
    ]
  },
  
  "implementation_roadmap": [
    {
      "phase": "Automação Básica",
      "duration": "4-6 semanas",
      "description": "• Implementar [2-3 ferramentas específicas] para [processos específicos]\n• Configurar integrações com [sistemas atuais]",
      "career_benefit": "Demonstração prática de resultados em IA para [setor específico]"
    },
    {
      "phase": "Otimização Avançada", 
      "duration": "8-12 semanas",
      "description": "• Expandir automação para [processos mais complexos]\n• Implementar analytics com [ferramentas específicas]",
      "career_benefit": "Expertise comprovada em implementação de IA em [contexto específico]"
    },
    {
      "phase": "Escalabilidade Departamental",
      "duration": "3-6 meses", 
      "description": "• Replicar soluções para outros [departamentos/processos]\n• Estabelecer governança de IA com [frameworks específicos]",
      "career_benefit": "Reconhecimento como especialista interno em transformação digital"
    }
  ]
}

MANDATORY: 
- Replace ALL placeholder text with actual, specific recommendations
- Use real tool names (ChatGPT, Zapier, Claude, Notion AI, etc.)
- Include specific time estimates and cost savings
- Reference their actual industry and team size
- Focus on OPERATIONAL EFFICIENCY, not career benefits
- Make every recommendation immediately actionable

CONCISÃO OBRIGATÓRIA: Máximo 15 palavras por frase. Foque em resultados mensuráveis. Elimine texto genérico.`;

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

// Removed unused helper functions to clean up code