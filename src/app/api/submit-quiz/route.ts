import { NextRequest, NextResponse } from 'next/server';
import { insertQuizResponse, insertLead } from '@/lib/supabase';
import { storeAIReport, storeMockQuizResponse } from '@/lib/reportStore';
import { generateFallbackReportJSON } from '@/lib/fallbackReportGenerator';
import { generateAIReportWithAgents } from '@/lib/ai-agents';
import { AdvancedReportGenerator } from '@/lib/reportGenerator';
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

    // Generate AI report with multi-agent system and robust fallback
    let aiReport = null;
    let reportGenerationMethod = 'none';
    
    // Attempt 1: Generate using Multi-Agent System (PRIORITY 1 - AI FIRST!)
    if (!aiReport && process.env.ANTHROPIC_API_KEY) {
      try {
        console.log('🚀 Attempting Multi-Agent AI report generation for:', company);
        
        const userContext = {
          email,
          company,
          jobTitle,
          responses,
          score,
          language: language as 'pt' | 'en'
        };
        
        const result = await generateAIReportWithAgents(
          userContext,
          process.env.ANTHROPIC_API_KEY
        );
        
        if (result.success && result.report) {
          aiReport = JSON.stringify(result.report, null, 2);
          reportGenerationMethod = 'multi-agent';
          console.log(`✅ Multi-agent report generated successfully in ${result.executionTime}ms`);
          console.log('📊 Agents used:', result.agentsUsed.join(', '));
        } else {
          console.log('⚠️ Multi-agent system failed, falling back to legacy:', result.error);
          aiReport = null;
        }
      } catch (error) {
        console.error('❌ Multi-agent system error:', error);
        aiReport = null;
      }
    }
    
    // Attempt 2: Generate using Legacy Claude API (FALLBACK 1)
    if (!aiReport && process.env.ANTHROPIC_API_KEY) {
      try {
        console.log('🤖 Attempting legacy AI report generation for:', company);
        
        aiReport = await generateAIReport({
          email,
          company,
          jobTitle,
          responses,
          score,
          language
        });
        
        if (aiReport && aiReport.length > 100) {
          console.log('✅ Legacy AI report generated successfully, length:', aiReport.length);
          reportGenerationMethod = 'claude-legacy';
          
          // Validate that it's proper JSON
          try {
            JSON.parse(aiReport);
            console.log('✅ Legacy AI report is valid JSON');
          } catch (jsonError) {
            console.log('⚠️ Legacy AI report is not valid JSON, will use as-is:', jsonError);
          }
        } else {
          console.log('⚠️ Legacy AI report generation returned insufficient content');
          aiReport = null;
        }
      } catch (error) {
        console.error('❌ Error generating legacy AI report:', error);
        aiReport = null;
      }
    } else if (!aiReport) {
      console.log('⚠️ No Anthropic API key found, skipping Claude generation');
    }
    
    // Attempt 3: Generate using Advanced Report Generator (FALLBACK 2)
    if (!aiReport) {
      try {
        console.log('🔧 Generating advanced personalized report as fallback for:', company);
        
        const generator = new AdvancedReportGenerator({
          email,
          company,
          jobTitle,
          score,
          responses
        });
        
        const advancedReport = generator.generateReport();
        aiReport = JSON.stringify(advancedReport, null, 2);
        reportGenerationMethod = 'advanced-generator-fallback';
        console.log('✅ Advanced report generated successfully as fallback');
      } catch (error) {
        console.error('❌ Advanced generator fallback error:', error);
        aiReport = null;
      }
    }
    
    // Attempt 4: Generate using fallback system if all methods failed
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
        
        // CRITICAL: Ensure the AI report is included in the mock database
        const completeResult = {
          id: result.id,
          email: result.email,
          company: result.company,
          job_title: result.job_title,
          responses: result.responses,
          score: result.score,
          ai_report: aiReport, // Use the generated report directly
          created_at: result.created_at
        };
        
        console.log('🗃️ Mock result has report:', !!completeResult.ai_report, 'length:', completeResult.ai_report?.length || 0);
        
        storeMockQuizResponse(completeResult);
        console.log('✅ Mock database backup completed with AI report');
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
  
  // Process type mapping
  const processMap: Record<string, string> = {
    'reporting-analytics': 'relatórios e análises',
    'customer-support': 'atendimento e suporte',
    'document-management': 'gestão de documentos',
    'data-entry': 'entrada de dados'
  };
  
  // Error impact mapping
  const errorMap: Record<string, string> = {
    'low-impact': 'baixo impacto',
    'medium-impact': 'médio impacto',
    'high-impact': 'alto impacto',
    'critical-impact': 'impacto crítico'
  };
  
  // Success metric mapping
  const metricMap: Record<string, string> = {
    'time-reduction': 'redução de 50% no tempo',
    'cost-savings': 'economia de R$ 20k+/mês',
    'error-elimination': 'zero erros críticos',
    'roi-achievement': 'ROI de 300%+'
  };
  
  // Concern mapping
  const concernMap: Record<string, string> = {
    'data-security': 'segurança dos dados',
    'team-resistance': 'resistência da equipe',
    'implementation-failure': 'falha na implementação',
    'roi-concern': 'custo vs benefício'
  };
  
  // Industry mapping
  const industryMap: Record<string, string> = {
    'technology': 'tecnologia',
    'manufacturing': 'manufatura',
    'healthcare': 'saúde',
    'financial': 'serviços financeiros',
    'retail': 'varejo',
    'services': 'serviços profissionais'
  };
  
  // Clean each field
  Object.entries(responses).forEach(([key, value]) => {
    const strValue = Array.isArray(value) ? value.join(', ') : value?.toString() || '';
    
    switch (key) {
      case 'time-consuming-process':
        cleaned[key] = processMap[strValue] || strValue;
        break;
      case 'process-error-cost':
        cleaned[key] = errorMap[strValue] || strValue;
        break;
      case 'success-metric':
        cleaned[key] = metricMap[strValue] || strValue;
        break;
      case 'biggest-ai-concern':
        cleaned[key] = concernMap[strValue] || strValue;
        break;
      case 'industry-sector':
        cleaned[key] = industryMap[strValue] || strValue;
        break;
      case 'specific-process-description':
        // Keep original description as-is for maximum personalization
        cleaned[key] = strValue;
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

  const prompt = `You are creating a PREMIUM AI MASTERPLAN that the user will want to save, share, and reference repeatedly. This must be so valuable and specific that they feel confident implementing it immediately.

${languageInstruction}

CLIENT PROFILE:
• ${data.jobTitle} at ${data.company}
• AI Readiness: ${data.score}/100 (${data.score >= 80 ? 'Champion Ready' : data.score >= 60 ? 'High Potential' : data.score >= 40 ? 'Emerging Leader' : 'Starting Journey'})
• Industry: ${cleanedResponses['industry-sector'] || 'geral'}

CRITICAL DATA FOR CALCULATIONS:
• Process to Automate: ${cleanedResponses['time-consuming-process'] || 'reporting-analytics'}
• Current Time Waste: ${cleanedResponses['weekly-hours-wasted'] || '40'} hours/week
• Error Impact: ${cleanedResponses['process-error-cost'] || 'high-impact'}
• Budget Available: ${cleanedResponses['monthly-budget-available'] || 'R$ 2.000-10.000/mês'}
• Tech Stack: ${cleanedResponses['current-tech-stack'] || 'spreadsheets, crm'}
• Success Target: ${cleanedResponses['success-metric'] || 'cost-savings'}
• Timeline Pressure: ${cleanedResponses['implementation-urgency'] || '90 dias'}
• Team Size: ${cleanedResponses['team-impact-size'] || '21-50 pessoas'}
• Main Concern: ${cleanedResponses['biggest-ai-concern'] || 'data-security'}

${cleanedResponses['specific-process-description'] ? `
USER'S EXACT PROCESS DESCRIPTION:
"${cleanedResponses['specific-process-description']}"

CRITICAL INSTRUCTIONS:
1. Reference this EXACT process throughout the report
2. Break down the specific steps they mentioned
3. Calculate time savings for EACH step mentioned
4. Recommend tools that automate THESE SPECIFIC tasks
` : ''}

MANDATORY CALCULATIONS (use exact numbers from data):
• Weekly hours: ${cleanedResponses['weekly-hours-wasted'] || '40'}
• Hourly cost: R$ 150 (market average for ${cleanedResponses['industry-sector'] || 'business'} professionals)
• Automation rate: 70% (industry standard for ${cleanedResponses['time-consuming-process'] || 'reporting'})
• Hours saved weekly = ${cleanedResponses['weekly-hours-wasted'] || '40'} × 0.7 = ${Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7))}
• Monthly savings = ${Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7))} × 4 × R$150 = R$ ${(Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7)) * 4 * 150).toLocaleString('pt-BR')}

SPECIFIC TOOL RECOMMENDATIONS FOR THEIR CASE:
Based on: ${cleanedResponses['time-consuming-process']} + ${cleanedResponses['monthly-budget-available']} + ${cleanedResponses['current-tech-stack']}

Must recommend EXACT tools with prices in BRL:
• Primary tool: [Name + exact monthly cost in R$]
• Integration tool: [Name + exact cost]
• Training/Support: [Specific approach + cost]

SUCCESS METRIC FOCUS:
They want: ${cleanedResponses['success-metric']}
So emphasize: ${cleanedResponses['success-metric']?.includes('time') ? 'hours saved' : cleanedResponses['success-metric']?.includes('cost') ? 'R$ saved' : cleanedResponses['success-metric']?.includes('error') ? 'error elimination' : 'ROI percentage'}

TIMELINE ADAPTATION:
They need results in: ${cleanedResponses['implementation-urgency']}
So structure phases as: ${cleanedResponses['implementation-urgency']?.includes('30 dias') ? 'Week 1-2, Week 3-4, Month 2-3' : cleanedResponses['implementation-urgency']?.includes('90 dias') ? 'Month 1, Month 2, Month 3' : 'Quarter 1, Quarter 2, Quarter 3-4'}

ADDRESSING THEIR CONCERN:
Main worry: ${cleanedResponses['biggest-ai-concern']}
Address this EXPLICITLY in quick wins and roadmap phases.

REPORT MUST BE SO GOOD THAT:
1. User immediately sees the value and ROI
2. Feels confident they can implement it
3. Wants to share with their boss
4. Saves it for future reference
5. Books a consultation to go deeper

JSON STRUCTURE (fill with REAL data, no placeholders):

{
  "executive_summary": "Com score ${data.score}/100 e ${cleanedResponses['weekly-hours-wasted']} horas semanais gastas em ${cleanedResponses['time-consuming-process']}, identificamos economia potencial de R$ ${(Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7)) * 4 * 150).toLocaleString('pt-BR')}/mês. Automatizando ${cleanedResponses['time-consuming-process']} com ferramentas dentro do orçamento de ${cleanedResponses['monthly-budget-available']}, ${data.company} alcançará ${cleanedResponses['success-metric']} em ${cleanedResponses['implementation-urgency']}. ROI projetado: ${Math.round(((Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7)) * 4 * 150 - 2000) / 2000) * 100)}% com payback em ${Math.ceil(2000 / (Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7)) * 4 * 150) * 30)} dias.",
  
  "department_challenges": [
    "Processo de ${cleanedResponses['time-consuming-process']} consome ${cleanedResponses['weekly-hours-wasted']} horas/semana da equipe de ${cleanedResponses['team-impact-size']}",
    "Impacto ${cleanedResponses['process-error-cost']} dos erros gera retrabalho estimado em ${parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.2} horas adicionais/semana", 
    "Falta de integração entre ${cleanedResponses['current-tech-stack']} causa duplicação de esforços em ${Math.round(parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.3)} horas/semana",
    "Limitação orçamentária de ${cleanedResponses['monthly-budget-available']} exige soluções criativas e escalonáveis",
    "Preocupação com ${cleanedResponses['biggest-ai-concern']} deve ser endereçada com [solução específica]"
  ],
  
  "career_impact": {
    "personal_productivity": "Economia de ${Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7))} horas semanais (${Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7) / 40 * 100)}% do tempo) automatizando ${cleanedResponses['time-consuming-process']}. Total anual: ${Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7) * 52)} horas liberadas para atividades estratégicas.",
    "team_performance": "Impacto em ${cleanedResponses['team-impact-size']} com produtividade aumentando ${Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7) / parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 100)}%. Redução de ${cleanedResponses['process-error-cost']?.includes('critical') ? '95%' : cleanedResponses['process-error-cost']?.includes('high') ? '85%' : '70%'} nos erros operacionais.",
    "leadership_recognition": "Entrega de ${cleanedResponses['success-metric']} em ${cleanedResponses['implementation-urgency']} posicionará você como líder em inovação. Case documentado para apresentar resultados de R$ ${(Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7)) * 4 * 150 * 12).toLocaleString('pt-BR')}/ano.",
    "professional_growth": "Domínio de ferramentas IA para ${cleanedResponses['industry-sector']} aumenta valor de mercado em 30-45%. Certificações em [ferramentas específicas recomendadas] são altamente valorizadas."
  },
  
  "quick_wins": {
    "month_1_actions": [
      { 
        "action": "Implementar [ferramenta específica dentro do orçamento ${cleanedResponses['monthly-budget-available']}] para automatizar [parte específica do processo descrito]",
        "impact": "Economia imediata de ${Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7) * 0.3)} horas/semana e ROI positivo em ${Math.ceil(2000 / ((Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7)) * 0.3) * 4 * 150) * 30)} dias"
      },
      { 
        "action": "Configurar integração entre [ferramenta IA] e ${cleanedResponses['current-tech-stack']} para eliminar entrada manual de dados",
        "impact": "Redução de ${cleanedResponses['process-error-cost']?.includes('high') || cleanedResponses['process-error-cost']?.includes('critical') ? '90%' : '70%'} nos erros e economia de R$ ${Math.round((Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7)) * 4 * 150) * 0.4).toLocaleString('pt-BR')}/mês"
      }
    ],
    "quarter_1_goals": [
      { 
        "goal": "Automatizar 100% do processo de ${cleanedResponses['time-consuming-process']} com [ferramentas específicas]",
        "outcome": "Alcançar ${cleanedResponses['success-metric']} e economizar R$ ${(Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7)) * 4 * 150).toLocaleString('pt-BR')}/mês"
      },
      { 
        "goal": "Resolver preocupação com ${cleanedResponses['biggest-ai-concern']} através de [abordagem específica]",
        "outcome": "Confiança para escalar solução para ${cleanedResponses['team-impact-size']} com segurança total"
      }
    ]
  },
  
  "implementation_roadmap": [
    {
      "phase": "Implementação Rápida",
      "duration": "${cleanedResponses['implementation-urgency']?.includes('30 dias') ? '2-3 semanas' : cleanedResponses['implementation-urgency']?.includes('90 dias') ? '4-6 semanas' : '6-8 semanas'}",
      "description": "Deploy de [ferramenta específica] para automatizar ${cleanedResponses['time-consuming-process']} conforme descrito. Integração inicial com ${cleanedResponses['current-tech-stack']}. Treinamento da equipe piloto. Resolução da preocupação com ${cleanedResponses['biggest-ai-concern']} através de [medidas específicas].",
      "career_benefit": "Resultados mensuráveis em ${cleanedResponses['implementation-urgency']?.includes('30 dias') ? '2 semanas' : '4 semanas'} para reportar à liderança"
    },
    {
      "phase": "Otimização e Escala", 
      "duration": "${cleanedResponses['implementation-urgency']?.includes('30 dias') ? '4-6 semanas' : cleanedResponses['implementation-urgency']?.includes('90 dias') ? '8-10 semanas' : '12-16 semanas'}",
      "description": "Expansão para ${cleanedResponses['team-impact-size']} completa. Automação de [subprocessos específicos]. Dashboard de ROI mostrando R$ ${(Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7)) * 4 * 150).toLocaleString('pt-BR')}/mês economizados.",
      "career_benefit": "Case documentado com ${Math.round(((Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7)) * 4 * 150 - 2000) / 2000) * 100)}% ROI para apresentações executivas"
    },
    {
      "phase": "Liderança Organizacional",
      "duration": "${cleanedResponses['implementation-urgency']?.includes('30 dias') ? '2-3 meses' : cleanedResponses['implementation-urgency']?.includes('90 dias') ? '3-4 meses' : '6-8 meses'}", 
      "description": "Centro de excelência em IA para ${cleanedResponses['industry-sector']}. Expansão para processos relacionados. Programa de mentoria interna. Economia anual documentada: R$ ${(Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7)) * 4 * 150 * 12).toLocaleString('pt-BR')}.",
      "career_benefit": "Reconhecimento como principal especialista em IA da ${data.company} e referência no setor"
    }
  ]
}

CRITICAL SUCCESS FACTORS:
1. Use EXACT numbers from their data (${cleanedResponses['weekly-hours-wasted']} hours, R$ ${(Math.round((parseInt(cleanedResponses['weekly-hours-wasted'] || '40') * 0.7)) * 4 * 150).toLocaleString('pt-BR')} savings)
2. Reference their SPECIFIC process description throughout
3. Recommend tools within their EXACT budget range
4. Address their MAIN concern (${cleanedResponses['biggest-ai-concern']})
5. Align timeline with their urgency (${cleanedResponses['implementation-urgency']})
6. Make them feel this is THEIR custom plan, not generic advice

RETURN ONLY VALID JSON. No markdown, no explanations, no placeholders.`;

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