# 📊 Code Migration Guide - Enhanced Database Schema

## 🎯 Overview

This guide shows how to update your application code to use the enhanced database schema while maintaining backwards compatibility.

## 🔄 Migration Strategy

### Phase 1: Safe Migration (Current)
- ✅ Add new tables alongside existing ones
- ✅ Maintain backwards compatibility
- ✅ Gradually enhance functionality

### Phase 2: Full Migration (Future)
- 🔄 Replace legacy queries with new structure
- 🔄 Remove deprecated columns
- 🔄 Implement advanced analytics

## 📝 Code Changes Required

### 1. Updated Supabase Functions

```typescript
// src/lib/supabase-enhanced.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Enhanced user management
export async function createOrUpdateUser(userData: {
  email: string;
  jobTitle: string;
  company?: string;
  department?: string;
}) {
  // First, check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', userData.email)
    .single();

  if (existingUser) {
    // Update existing user
    const { data, error } = await supabase
      .from('users')
      .update({
        job_title: userData.jobTitle,
        department: userData.department,
        updated_at: new Date().toISOString()
      })
      .eq('email', userData.email)
      .select()
      .single();
    
    return { data, error };
  } else {
    // Create new user (company will be auto-assigned by trigger)
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        job_title: userData.jobTitle,
        department: userData.department
      })
      .select()
      .single();
    
    return { data, error };
  }
}

// Enhanced quiz response insertion
export async function insertEnhancedQuizResponse(data: {
  email: string;
  company: string;
  jobTitle: string;
  responses: Record<string, string | string[]>;
  score: number;
  completionTimeSeconds?: number;
  deviceType?: string;
  source?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  // 1. Create or update user
  const { data: user } = await createOrUpdateUser({
    email: data.email,
    jobTitle: data.jobTitle,
    company: data.company
  });

  // 2. Insert into legacy table for backwards compatibility
  const { data: quizResponse, error: quizError } = await supabase
    .from('quiz_responses')
    .insert({
      email: data.email,
      company: data.company,
      job_title: data.jobTitle,
      responses: data.responses,
      score: data.score,
      completion_time_seconds: data.completionTimeSeconds,
      device_type: data.deviceType,
      source: data.source,
      user_agent: data.userAgent,
      ip_address: data.ipAddress
    })
    .select()
    .single();

  if (quizError) {
    console.error('Error inserting quiz response:', quizError);
    throw quizError;
  }

  // 3. Create lead record with enhanced tracking
  await supabase
    .from('leads')
    .upsert({
      email: data.email,
      company: data.company,
      job_title: data.jobTitle,
      score: data.score,
      lead_source: 'quiz_completion',
      lead_score: calculateLeadScore(data.score, data.responses),
      report_generated: false
    }, {
      onConflict: 'email'
    });

  return quizResponse;
}

// Enhanced AI report storage
export async function storeEnhancedAIReport(data: {
  quizResponseId: number;
  reportJson: object;
  reportMarkdown?: string;
  generationMethod: string;
  agentsUsed: string[];
  generationTimeMs: number;
  personalizationLevel: 'high' | 'medium' | 'low';
  language: string;
}) {
  const { data: report, error } = await supabase
    .from('ai_reports')
    .insert({
      quiz_response_id: data.quizResponseId,
      report_json: data.reportJson,
      report_markdown: data.reportMarkdown,
      generation_method: data.generationMethod,
      agents_used: data.agentsUsed,
      generation_time_ms: data.generationTimeMs,
      personalization_level: data.personalizationLevel,
      language: data.language
    })
    .select()
    .single();

  if (error) {
    console.error('Error storing AI report:', error);
    throw error;
  }

  // Also update the legacy ai_report column for backwards compatibility
  await supabase
    .from('quiz_responses')
    .update({ ai_report: data.reportMarkdown || JSON.stringify(data.reportJson) })
    .eq('id', data.quizResponseId);

  return report;
}

// Store agent execution details
export async function storeAgentExecution(data: {
  reportId: number;
  agentName: string;
  executionOrder: number;
  inputData: object;
  outputData: object;
  executionTimeMs: number;
  success: boolean;
  errorMessage?: string;
}) {
  const { data: execution, error } = await supabase
    .from('agent_executions')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error storing agent execution:', error);
  }

  return execution;
}

// Helper function to calculate lead score
function calculateLeadScore(quizScore: number, responses: Record<string, any>): number {
  let leadScore = quizScore;
  
  // Boost score based on specific indicators
  if (responses['approval-process']?.includes('directly')) leadScore += 10;
  if (responses['implementation-timeline']?.includes('month')) leadScore += 15;
  if (responses['department-size']?.includes('50+')) leadScore += 5;
  if (responses['operational-challenges'] && responses['operational-challenges'].length > 100) leadScore += 10;
  
  return Math.min(leadScore, 100);
}
```

### 2. Enhanced Submit Quiz Route

```typescript
// src/app/api/submit-quiz/route.ts - Key changes
import { 
  insertEnhancedQuizResponse, 
  storeEnhancedAIReport, 
  storeAgentExecution 
} from '@/lib/supabase-enhanced';

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const body = await request.json();
    const { email, company, jobTitle, responses, score, language = 'pt' } = body;

    // Capture additional context
    const userAgent = request.headers.get('user-agent') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : undefined;
    
    // Detect device type
    const deviceType = userAgent?.includes('Mobile') ? 'mobile' : 
                      userAgent?.includes('Tablet') ? 'tablet' : 'desktop';

    // Insert enhanced quiz response
    const result = await insertEnhancedQuizResponse({
      email,
      company,
      jobTitle,
      responses,
      score,
      completionTimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      deviceType,
      userAgent,
      ipAddress
    });

    // Generate AI report with enhanced tracking
    let aiReport = null;
    let reportGenerationMethod = 'none';
    let agentsUsed: string[] = [];
    
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        console.log('🚀 Attempting Multi-Agent AI report generation for:', company);
        
        const userContext = {
          email, company, jobTitle, responses, score,
          language: language as 'pt' | 'en'
        };
        
        const reportResult = await generateAIReportWithAgents(
          userContext,
          process.env.ANTHROPIC_API_KEY
        );
        
        if (reportResult.success && reportResult.report) {
          // Store enhanced AI report
          const reportData = await storeEnhancedAIReport({
            quizResponseId: result.id,
            reportJson: reportResult.report,
            reportMarkdown: JSON.stringify(reportResult.report, null, 2),
            generationMethod: 'multi-agent',
            agentsUsed: reportResult.agentsUsed,
            generationTimeMs: reportResult.executionTime,
            personalizationLevel: responses['operational-challenges'] ? 'high' : 'medium',
            language
          });

          // Store individual agent executions (if available in reportResult)
          if (reportResult.agentExecutions) {
            for (const [index, execution] of reportResult.agentExecutions.entries()) {
              await storeAgentExecution({
                reportId: reportData.id,
                agentName: execution.agentName,
                executionOrder: index + 1,
                inputData: execution.input,
                outputData: execution.output,
                executionTimeMs: execution.executionTime,
                success: execution.success,
                errorMessage: execution.error
              });
            }
          }

          aiReport = JSON.stringify(reportResult.report, null, 2);
          reportGenerationMethod = 'multi-agent';
          agentsUsed = reportResult.agentsUsed;
          
          console.log(`✅ Enhanced AI report stored with tracking`);
        }
      } catch (error) {
        console.error('❌ Multi-agent system error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      responseId: result.id,
      score,
      aiReport,
      reportGenerationMethod,
      agentsUsed,
      hasReport: !!aiReport
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. Enhanced Analytics Endpoints

```typescript
// src/app/api/analytics/route.ts - New analytics endpoint
import { supabase } from '@/lib/supabase-enhanced';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const metric = searchParams.get('metric');
  const timeframe = searchParams.get('timeframe') || '30d';

  try {
    switch (metric) {
      case 'quiz-summary':
        const { data: summary } = await supabase
          .from('quiz_analytics_summary')
          .select('*')
          .gte('quiz_date', getDateRange(timeframe))
          .order('quiz_date', { ascending: false });
        
        return NextResponse.json({ data: summary });

      case 'agent-performance':
        const { data: agentStats } = await supabase
          .from('agent_executions')
          .select(`
            agent_name,
            count(*) as executions,
            avg(execution_time_ms) as avg_time,
            sum(case when success then 1 else 0 end) as success_count
          `)
          .gte('created_at', getDateRange(timeframe))
          .groupBy('agent_name');
        
        return NextResponse.json({ data: agentStats });

      case 'user-engagement':
        const { data: engagement } = await supabase
          .from('user_sessions')
          .select('*')
          .gte('session_start', getDateRange(timeframe));
        
        return NextResponse.json({ data: engagement });

      case 'company-insights':
        const { data: companies } = await supabase
          .from('companies')
          .select(`
            *,
            users(count),
            users(quiz_attempts(count))
          `)
          .order('created_at', { ascending: false });
        
        return NextResponse.json({ data: companies });

      default:
        return NextResponse.json({ error: 'Invalid metric' }, { status: 400 });
    }
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function getDateRange(timeframe: string): string {
  const now = new Date();
  switch (timeframe) {
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }
}
```

### 4. Enhanced AI Agent Integration

```typescript
// src/lib/ai-agents/orchestrator-enhanced.ts
import { storeAgentExecution } from '@/lib/supabase-enhanced';

export class EnhancedAIOrchestrator extends AIOrchestrator {
  private reportId?: number;

  async generateReportWithTracking(
    context: UserContext, 
    reportId: number
  ): Promise<OrchestratorResult> {
    this.reportId = reportId;
    return await this.generateReport(context);
  }

  // Override agent execution to add tracking
  private async executeAgentWithTracking<T, R>(
    agent: Agent<T, R>,
    input: T,
    executionOrder: number
  ): Promise<R> {
    const startTime = Date.now();
    let result: R;
    let success = true;
    let error: string | undefined;

    try {
      console.log(`🔄 Executing ${agent.name} (Order: ${executionOrder})`);
      result = await agent.process(input);
      console.log(`✅ ${agent.name} completed successfully`);
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error';
      console.error(`❌ ${agent.name} failed:`, error);
      throw err;
    } finally {
      const executionTime = Date.now() - startTime;
      
      // Store execution details
      if (this.reportId) {
        await storeAgentExecution({
          reportId: this.reportId,
          agentName: agent.name,
          executionOrder,
          inputData: input as object,
          outputData: success ? (result as object) : {},
          executionTimeMs: executionTime,
          success,
          errorMessage: error
        });
      }
    }

    return result!;
  }
}
```

## 🔧 Implementation Steps

### Step 1: Run Database Migration
```sql
-- Run migration-step-by-step.sql in Supabase SQL Editor
-- This adds new tables while preserving existing data
```

### Step 2: Update Application Code
```bash
# 1. Create enhanced supabase functions
touch src/lib/supabase-enhanced.ts

# 2. Update API routes gradually
# Start with submit-quiz route
# Add analytics endpoints
# Enhance agent tracking
```

### Step 3: Test & Verify
```bash
# Run existing functionality tests
# Verify backwards compatibility
# Test new analytics features
```

### Step 4: Deploy & Monitor
```bash
# Deploy to staging first
# Monitor performance metrics
# Verify data integrity
```

## 📈 New Analytics Capabilities

### 1. User Journey Analytics
- Track quiz completion patterns
- Identify drop-off points
- Measure engagement metrics

### 2. AI Agent Performance
- Monitor execution times
- Track success rates
- Identify optimization opportunities

### 3. Company Intelligence
- Industry trend analysis
- Company size correlations
- Market penetration insights

### 4. Lead Quality Scoring
- Enhanced lead scoring algorithm
- Conversion prediction
- Segmentation capabilities

## 🎯 Benefits

### Immediate Benefits
- ✅ Better data structure for analytics
- ✅ Enhanced AI report tracking
- ✅ User journey insights
- ✅ Company intelligence

### Future Benefits
- 🔄 A/B testing capabilities
- 🔄 Predictive analytics
- 🔄 Advanced segmentation
- 🔄 Real-time dashboards

## 🚨 Important Notes

1. **Backwards Compatibility**: All existing functionality continues to work
2. **Gradual Migration**: Implement changes incrementally
3. **Data Integrity**: Always backup before major changes
4. **Performance**: Monitor query performance with new structure
5. **Privacy**: Ensure compliance with data protection regulations

This enhanced structure provides powerful analytics while maintaining full backwards compatibility with your existing application.