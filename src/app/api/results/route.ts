import { NextRequest, NextResponse } from 'next/server';
import { getQuizResponseById } from '@/lib/supabase';
import { getAIReport, getMockQuizResponse } from '@/lib/reportStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Response ID is required' },
        { status: 400 }
      );
    }

    // Get quiz response by ID from database or mock store
    let result = await getQuizResponseById(id);
    
    // If not found in database, try the mock store (for local development)
    if (!result) {
      console.log('🔍 Trying mock database for ID:', id);
      result = getMockQuizResponse(id);
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Quiz response not found' },
        { status: 404 }
      );
    }

    // Use the AI report from database first, then fallback to store, then error message
    const storedReport = getAIReport(id);
    console.log('🔍 Looking for report ID:', id, 'Found in DB:', !!result.ai_report, 'DB report length:', result.ai_report?.length || 0, 'Found in store:', !!storedReport);
    
    // DEBUG: Log first 200 chars of report to see if it's personalized
    if (result.ai_report) {
      console.log('🔍 DB Report preview:', result.ai_report.substring(0, 200));
    }
    if (storedReport) {
      console.log('🔍 Store Report preview:', storedReport.substring(0, 200));
    }
    
    const aiReport = result.ai_report || storedReport || `# Premium AI Report Not Available
    
Your AI Readiness Score of ${result.score}/100 has been calculated, but the detailed report is currently being generated. Please check back in a few minutes or contact support if this issue persists.

## Quick Insights for ${result.company}
- Score: ${result.score}/100
- Industry: Professional assessment completed
- Next Steps: Detailed recommendations will be available shortly

Please refresh this page or contact our team for immediate assistance.`;

    return NextResponse.json({
      id: result.id,
      email: result.email,
      company: result.company,
      jobTitle: result.job_title,
      score: result.score,
      createdAt: result.created_at,
      responses: result.responses,
      aiReport: aiReport
    });

  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}