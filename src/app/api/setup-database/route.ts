import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('Setting up Supabase database tables...');

    // Check if we can create tables via SQL
    const { error } = await supabase.rpc('create_tables', {});
    
    if (error) {
      // If RPC doesn't work, provide manual setup instructions
      const setupSQL = `
-- Create quiz_responses table
CREATE TABLE IF NOT EXISTS quiz_responses (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    company TEXT,
    job_title TEXT,
    responses JSONB NOT NULL,
    score INTEGER NOT NULL,
    ai_report TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    company TEXT,
    job_title TEXT,
    score INTEGER NOT NULL,
    report_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_responses_email ON quiz_responses(email);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_created_at ON quiz_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
      `;

      return NextResponse.json({
        success: false,
        message: 'Unable to create tables automatically. Please run the SQL manually in Supabase Dashboard.',
        sql: setupSQL,
        dashboardUrl: `https://supabase.com/dashboard/project/${process.env.SUPABASE_URL?.split('.')[0].split('//')[1]}/editor`
      });
    }

    // Test if tables exist and are accessible
    const { error: testError } = await supabase
      .from('quiz_responses')
      .select('count(*)')
      .limit(1);

    if (testError) {
      return NextResponse.json({
        success: false,
        message: 'Tables may exist but are not accessible. Check permissions.',
        error: testError.message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully!'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error during database setup',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}