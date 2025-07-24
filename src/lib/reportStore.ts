// Temporary file-based store for AI reports until database migration
// In production, this would be stored in the database

import * as fs from 'fs';
import * as path from 'path';

const REPORTS_DIR = path.join(process.cwd(), '.temp-reports');

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

export function storeAIReport(responseId: string, report: string): void {
  try {
    console.log('📝 Storing report for key:', responseId, 'length:', report.length);
    const filePath = path.join(REPORTS_DIR, `${responseId}.json`);
    const data = {
      responseId,
      report,
      timestamp: Date.now()
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('📝 Report stored to file:', filePath);
    
    // Clean up old reports after 24 hours
    setTimeout(() => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('🗑️ Cleaned up old report:', responseId);
        }
      } catch (error) {
        console.error('Error cleaning up report:', error);
      }
    }, 24 * 60 * 60 * 1000);
  } catch (error) {
    console.error('❌ Error storing AI report:', error);
  }
}

export function getAIReport(responseId: string): string | null {
  try {
    console.log('🔍 Looking for report file:', responseId);
    const filePath = path.join(REPORTS_DIR, `${responseId}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log('🔍 Report file not found:', filePath);
      return null;
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log('🔍 Found report file, length:', data.report?.length || 0);
    return data.report || null;
  } catch (error) {
    console.error('❌ Error reading AI report:', error);
    return null;
  }
}

export function getAllStoredReports(): { [responseId: string]: string } {
  try {
    const reports: { [responseId: string]: string } = {};
    const files = fs.readdirSync(REPORTS_DIR);
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const responseId = file.replace('.json', '');
        const report = getAIReport(responseId);
        if (report) {
          reports[responseId] = report;
        }
      }
    });
    
    return reports;
  } catch (error) {
    console.error('Error getting all reports:', error);
    return {};
  }
}