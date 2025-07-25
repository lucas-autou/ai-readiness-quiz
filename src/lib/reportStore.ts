// Serverless-compatible report store
// Uses in-memory storage for Vercel deployment (stateless functions)
// In production, reports should be stored directly in Supabase database

// In-memory storage for the current function execution
const reportCache = new Map<string, { report: string; timestamp: number }>();

// Extended storage for mock database entries when Supabase is not available
const mockDatabase = new Map<string, {
  id: number;
  email: string;
  company: string;
  job_title: string;
  responses: Record<string, string | string[]>;
  score: number;
  ai_report: string | null;
  created_at: string;
}>();

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

export function getMockQuizResponse(id: string): any {
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