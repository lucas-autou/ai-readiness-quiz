const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTablesDirectly() {
  console.log('Creating tables using direct SQL execution...');
  
  try {
    // Try to create quiz_responses table
    const quizTableSQL = `
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
    `;
    
    const { error: quizError } = await supabase.rpc('execute_sql', {
      sql: quizTableSQL
    });
    
    if (quizError) {
      console.log('Could not execute SQL via RPC. This is normal for most Supabase setups.');
    }
    
    // Try to create leads table  
    const leadsTableSQL = `
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
    `;
    
    const { error: leadsError } = await supabase.rpc('execute_sql', {
      sql: leadsTableSQL
    });
    
    if (leadsError) {
      console.log('Could not execute SQL via RPC. This is normal for most Supabase setups.');
    }
    
    // Now test if we can access the tables
    console.log('Testing table access...');
    
    const { data: quizTest, error: quizTestError } = await supabase
      .from('quiz_responses')
      .select('*')
      .limit(1);
      
    const { data: leadsTest, error: leadsTestError } = await supabase
      .from('leads')  
      .select('*')
      .limit(1);
      
    if (quizTestError || leadsTestError) {
      console.log('\n❌ Tables do not exist yet.');
      console.log('\n📋 Please create them manually in Supabase Dashboard:');
      console.log('🔗 Go to: https://supabase.com/dashboard/project/' + supabaseUrl.split('.')[0].split('//')[1] + '/editor');
      console.log('\n📝 Copy and run this SQL:');
      
      const fullSQL = `
-- Create quiz_responses table
CREATE TABLE quiz_responses (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    company TEXT,
    job_title TEXT,
    responses JSONB NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create leads table
CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    company TEXT,
    job_title TEXT,
    score INTEGER NOT NULL,
    report_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_quiz_responses_email ON quiz_responses(email);
CREATE INDEX idx_quiz_responses_created_at ON quiz_responses(created_at);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at);
      `;
      
      console.log(fullSQL);
      return false;
    } else {
      console.log('✅ Tables exist and are accessible!');
      console.log('✅ Database setup is complete!');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

createTablesDirectly();