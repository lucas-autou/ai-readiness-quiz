import { NextRequest, NextResponse } from 'next/server';
import { insertQuizResponse, insertLead } from '@/lib/supabase';
import { storeAIReport } from '@/lib/reportStore';
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
    
    // Store AI report in memory store as fallback if database doesn't have the column
    if (aiReport && !result.ai_report) {
      console.log('📝 Storing AI report in memory store as fallback...');
      storeAIReport(result.id.toString(), aiReport);
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

  const prompt = `You are a career-focused AI consultant creating a premium departmental AI readiness report worth $1,000+. This report is for a DEPARTMENT LEADER, not a CEO.

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
1. Reference ${data.jobTitle} at ${data.company} throughout - this is their personal career report
2. Focus on ${data.responses['department-focus']} as their primary department area
3. Address their specific challenge: ${data.responses['department-challenge']}
4. Scale recommendations to their approval authority: ${data.responses['approval-process']}
5. Consider their team size: ${data.responses['department-size']}
6. Timeline must match: ${data.responses['implementation-timeline']}
7. Career positioning context: ${data.responses['career-positioning']}

Return ONLY this JSON structure with NO explanations:

{
  "executive_summary": "Write exactly 4-6 sentences specifically for ${data.jobTitle} at ${data.company}. Must address: their department's ${data.responses['department-focus']} challenges, how AI can solve their ${data.responses['department-challenge']} issue, career advancement opportunity from leading this initiative, and positioning them as the AI champion within their ${data.responses['company-context']} organization.",
  
  "department_challenges": [
    "Convert their specific challenge into actionable insight: ${data.responses['department-challenge']}",
    "Address their department pain point: ${data.responses['department-pain']}",  
    "Include career/political challenge from: ${data.responses['biggest-fear']}",
    "Add context about leadership pressure: ${data.responses['leadership-pressure']}"
  ],
  
  "career_impact": {
    "personal_productivity": "Calculate time savings for ${data.jobTitle} personally managing ${data.responses['department-size']} team",
    "team_performance": "Quantify team improvements in ${data.responses['department-focus']} area",
    "leadership_recognition": "How this positions them as innovation leader given ${data.responses['career-positioning']} current state",
    "professional_growth": "Career advancement opportunities from successfully implementing ${data.responses['success-metric']}"
  },
  
  "quick_wins": {
    "month_1_actions": [
      { "action": "Immediate ${data.responses['department-focus']} optimization within ${data.responses['approval-process']} budget", "impact": "Specific weekly time savings for their team" },
      { "action": "Address ${data.responses['department-pain']} with low-risk pilot", "impact": "Measurable department efficiency gain" }
    ],
    "quarter_1_goals": [
      { "goal": "Build case for larger AI initiative targeting ${data.responses['department-challenge']}", "outcome": "Position as department AI champion" },
      { "goal": "Demonstrate ${data.responses['success-metric']} to leadership", "outcome": "Career advancement recognition" }
    ]
  },
  
  "implementation_roadmap": [
    {
      "phase": "Department Assessment & Pilot",
      "duration": "Match their timeline: ${data.responses['implementation-timeline']}",
      "description": "Specific to ${data.jobTitle}: audit ${data.responses['department-focus']} processes and launch pilot project within ${data.responses['approval-process']} authority",
      "career_benefit": "Establishes you as the proactive AI leader"
    },
    {
      "phase": "Team Adoption & Results", 
      "duration": "Scale to ${data.responses['department-size']} team complexity",
      "description": "Roll out successful pilot across ${data.responses['department-focus']} team, measure and document results",
      "career_benefit": "Provides concrete achievements for performance reviews"
    },
    {
      "phase": "Cross-Department Expansion",
      "duration": "Based on ${data.responses['company-context']} organizational structure", 
      "description": "Become the AI expert helping other departments, leveraging success in ${data.responses['department-focus']}",
      "career_benefit": "Position for promotion as the company's AI transformation leader"
    }
  ]
}

MANDATORY: Every field must focus on ${data.jobTitle}'s PERSONAL success and CAREER advancement, not company-wide transformation.`;

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
    
    try {
      // Parse and validate the JSON response
      const jsonReport = JSON.parse(textResult);
      
      // Validate that it has the required structure for department-focused report
      if (jsonReport.executive_summary && jsonReport.department_challenges && 
          jsonReport.career_impact && jsonReport.quick_wins && jsonReport.implementation_roadmap) {
        console.log('✅ JSON report structure validated');
        return JSON.stringify(jsonReport, null, 2);
      } else {
        console.log('❌ Invalid JSON structure - missing required sections');
        return textResult; // Return raw text as fallback
      }
    } catch (error) {
      console.log('❌ Failed to parse JSON response:', error);
      return textResult; // Return raw text as fallback
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