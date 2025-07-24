const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('Setting up Supabase database...');
  
  try {
    // Create quiz_responses table
    const { error: quizError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS quiz_responses (
            id BIGSERIAL PRIMARY KEY,
            email TEXT NOT NULL,
            company TEXT,
            job_title TEXT,
            responses JSONB NOT NULL,
            score INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_quiz_responses_email ON quiz_responses(email);
        CREATE INDEX IF NOT EXISTS idx_quiz_responses_created_at ON quiz_responses(created_at);
      `
    });
    
    if (quizError) {
      console.log('Quiz table might already exist or RPC not available, trying direct approach...');
    }

    // Create leads table
    const { error: leadsError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS leads (
            id BIGSERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            company TEXT,
            job_title TEXT,
            score INTEGER NOT NULL,
            report_generated BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
        CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
      `
    });
    
    if (leadsError) {
      console.log('Leads table might already exist or RPC not available, trying direct approach...');
    }
    
    // Test the connection by checking if tables exist
    const { data: quizTest, error: quizTestError } = await supabase
      .from('quiz_responses')
      .select('count(*)')
      .limit(1);
      
    const { data: leadsTest, error: leadsTestError } = await supabase
      .from('leads')
      .select('count(*)')
      .limit(1);
      
    if (quizTestError || leadsTestError) {
      console.log('Tables may not exist yet. Please run the SQL manually in Supabase Dashboard:');
      console.log('\n--- Copy this SQL to Supabase SQL Editor ---');
      console.log(`
-- Quiz Responses Table
CREATE TABLE IF NOT EXISTS quiz_responses (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    company TEXT,
    job_title TEXT,
    responses JSONB NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leads Table  
CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    company TEXT,
    job_title TEXT,
    score INTEGER NOT NULL,
    report_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_responses_email ON quiz_responses(email);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_created_at ON quiz_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Enable RLS (optional, for security)
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (adjust policies as needed)
CREATE POLICY "Allow all operations on quiz_responses" ON quiz_responses
    FOR ALL USING (true) WITH CHECK (true);
    
CREATE POLICY "Allow all operations on leads" ON leads  
    FOR ALL USING (true) WITH CHECK (true);
      `);
      console.log('--- End SQL ---\n');
    } else {
      console.log('✅ Database connection successful!');
      console.log('✅ Tables appear to be accessible');
    }
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();