import { NextRequest, NextResponse } from 'next/server';
import { generateFallbackReportJSON } from '@/lib/fallbackReportGenerator';

export async function GET() {
  const startTime = Date.now();
  const checks = {
    fallbackReportGeneration: false,
    claudeApiKey: false,
    supabaseConnection: false,
    memoryStore: false,
    overallHealth: false
  };
  
  const results = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    checks,
    details: {} as Record<string, unknown>,
    processingTime: 0
  };

  try {
    console.log('🏥 Starting health check at', results.timestamp);

    // Check 1: Fallback Report Generation
    console.log('🔧 Testing fallback report generation...');
    try {
      const testReport = generateFallbackReportJSON({
        company: 'Test Company',
        jobTitle: 'Test Manager',
        score: 75,
        responses: {
          'industry-sector': 'Technology',
          'department-challenge': 'team-burden',
          'career-positioning': 'Leading initiatives'
        },
        language: 'pt'
      });

      if (testReport && testReport.length > 100) {
        const parsed = JSON.parse(testReport);
        if (parsed.executive_summary && parsed.department_challenges) {
          checks.fallbackReportGeneration = true;
          results.details.fallbackReport = {
            generated: true,
            length: testReport.length,
            hasRequiredFields: true
          };
          console.log('✅ Fallback report generation working');
        }
      }
    } catch (fallbackError) {
      console.log('❌ Fallback report generation failed:', fallbackError);
      results.details.fallbackReport = {
        generated: false,
        error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
      };
    }

    // Check 2: Claude API Key
    console.log('🔑 Checking Claude API key...');
    if (process.env.ANTHROPIC_API_KEY) {
      checks.claudeApiKey = true;
      results.details.claudeApi = {
        keyExists: true,
        keyLength: process.env.ANTHROPIC_API_KEY.length
      };
      console.log('✅ Claude API key present');
    } else {
      results.details.claudeApi = {
        keyExists: false,
        warning: 'No Claude API key found - will use fallback reports'
      };
      console.log('⚠️ No Claude API key found');
    }

    // Check 3: Supabase Connection
    console.log('🗃️ Testing Supabase connection...');
    try {
      if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
        checks.supabaseConnection = true;
        results.details.supabase = {
          urlExists: true,
          keyExists: true,
          url: process.env.SUPABASE_URL.substring(0, 30) + '...'
        };
        console.log('✅ Supabase configuration present');
      } else {
        results.details.supabase = {
          urlExists: !!process.env.SUPABASE_URL,
          keyExists: !!process.env.SUPABASE_ANON_KEY,
          warning: 'Missing Supabase configuration - using mock storage'
        };
        console.log('⚠️ Supabase configuration incomplete');
      }
    } catch (supabaseError) {
      results.details.supabase = {
        error: supabaseError instanceof Error ? supabaseError.message : 'Unknown error'
      };
      console.log('❌ Supabase check failed:', supabaseError);
    }

    // Check 4: Memory Store
    console.log('💾 Testing memory store...');
    try {
      const { storeAIReport, getAIReport } = await import('@/lib/reportStore');
      
      // Test store and retrieve
      const testId = 'health-check-' + Date.now();
      const testContent = JSON.stringify({ test: 'health check', timestamp: Date.now() });
      
      storeAIReport(testId, testContent);
      const retrieved = getAIReport(testId);
      
      if (retrieved === testContent) {
        checks.memoryStore = true;
        results.details.memoryStore = {
          working: true,
          testPassed: true
        };
        console.log('✅ Memory store working');
      } else {
        results.details.memoryStore = {
          working: false,
          testPassed: false,
          issue: 'Retrieved content does not match stored content'
        };
        console.log('❌ Memory store test failed');
      }
    } catch (memoryError) {
      results.details.memoryStore = {
        working: false,
        error: memoryError instanceof Error ? memoryError.message : 'Unknown error'
      };
      console.log('❌ Memory store check failed:', memoryError);
    }

    // Overall Health Assessment
    const criticalChecks = [checks.fallbackReportGeneration];
    const allChecks = Object.values(checks);
    
    const criticalPassed = criticalChecks.every(check => check);
    const totalPassed = allChecks.filter(check => check).length;
    const totalChecks = allChecks.length;

    checks.overallHealth = criticalPassed;
    
    results.status = criticalPassed ? 'healthy' : 'degraded';
    results.processingTime = Date.now() - startTime;
    
    results.details.summary = {
      criticalChecksPassed: criticalChecks.length,
      totalChecksPassed: totalPassed,
      totalChecks: totalChecks,
      healthScore: Math.round((totalPassed / totalChecks) * 100),
      recommendation: criticalPassed ? 
        'System is operational. Reports will generate successfully.' :
        'Critical systems failing. Reports may not generate properly.'
    };

    console.log('🏥 Health check completed in', results.processingTime, 'ms');
    console.log('📊 Health score:', (results.details.summary as { healthScore: number }).healthScore + '%');

    return NextResponse.json(results, {
      status: criticalPassed ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ Critical error during health check:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime,
      checks: {
        ...checks,
        overallHealth: false
      }
    }, { status: 500 });
  }
}

// POST endpoint for manual report testing
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { company, jobTitle, score, responses } = body;

    console.log('🧪 Manual report test requested for:', company);

    if (!company || !jobTitle || score === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: company, jobTitle, score',
        processingTime: Date.now() - startTime
      }, { status: 400 });
    }

    // Test fallback report generation
    const fallbackReport = generateFallbackReportJSON({
      company,
      jobTitle,
      score,
      responses: responses || {},
      language: 'pt'
    });

    if (!fallbackReport) {
      throw new Error('Fallback report generation failed');
    }

    // Validate JSON structure
    const parsed = JSON.parse(fallbackReport);
    const hasRequiredStructure = !!(
      parsed.executive_summary &&
      parsed.department_challenges &&
      parsed.career_impact &&
      parsed.quick_wins &&
      parsed.implementation_roadmap
    );

    const result = {
      success: true,
      testResults: {
        reportGenerated: true,
        reportLength: fallbackReport.length,
        hasValidStructure: hasRequiredStructure,
        structure: Object.keys(parsed)
      },
      sampleReport: {
        executive_summary: parsed.executive_summary?.substring(0, 200) + '...',
        challengesCount: parsed.department_challenges?.length || 0,
        careerImpactAreas: Object.keys(parsed.career_impact || {}),
        quickWinsCount: (parsed.quick_wins?.month_1_actions?.length || 0) + (parsed.quick_wins?.quarter_1_goals?.length || 0),
        roadmapPhases: parsed.implementation_roadmap?.length || 0
      },
      processingTime: Date.now() - startTime
    };

    console.log('✅ Manual report test completed successfully');
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Manual report test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}