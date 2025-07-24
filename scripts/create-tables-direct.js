const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Creating Supabase tables directly...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTablesViaRPC() {
  try {
    // Try creating the tables using raw SQL
    console.log('Attempting to create quiz_responses table...');
    
    const quizTableQuery = `
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
    `;
    
    const { data: quizData, error: quizError } = await supabase.rpc('sql', {
      query: quizTableQuery
    });
    
    if (quizError) {
      console.log('RPC approach failed, this is expected. Error:', quizError.message);
    } else {
      console.log('✅ Quiz table created successfully!');
    }
    
    console.log('Attempting to create leads table...');
    
    const leadsTableQuery = `
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
    `;
    
    const { data: leadsData, error: leadsError } = await supabase.rpc('sql', {
      query: leadsTableQuery
    });
    
    if (leadsError) {
      console.log('RPC approach failed, this is expected. Error:', leadsError.message);
    } else {
      console.log('✅ Leads table created successfully!');
    }
    
  } catch (error) {
    console.log('Could not create tables via RPC (this is normal):', error.message);
  }
  
  // Now test if we can access the tables
  console.log('\nTesting table access...');
  
  try {
    const { data, error } = await supabase.from('quiz_responses').select('count');
    
    if (error) {
      console.log('❌ Tables do not exist. Manual creation required.');
      console.log('Error:', error.message);
      
      // Let's try to use the SQL runner endpoint
      console.log('\nTrying to use Supabase REST API to create tables...');
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          sql: `
            CREATE TABLE IF NOT EXISTS quiz_responses (
              id BIGSERIAL PRIMARY KEY,
              email TEXT NOT NULL,
              company TEXT,
              job_title TEXT,
              responses JSONB NOT NULL,
              score INTEGER NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS leads (
              id BIGSERIAL PRIMARY KEY,
              email TEXT UNIQUE NOT NULL,
              company TEXT,
              job_title TEXT,
              score INTEGER NOT NULL,
              report_generated BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
          `
        })
      });
      
      if (response.ok) {
        console.log('✅ Tables created via REST API!');
        return true;
      } else {
        console.log('❌ REST API approach also failed');
        return false;
      }
    } else {
      console.log('✅ Tables exist and are accessible!');
      return true;
    }
  } catch (error) {
    console.log('❌ Error testing table access:', error.message);
    return false;
  }
}

createTablesViaRPC().then(success => {
  if (!success) {
    console.log('\n🔧 MANUAL SETUP REQUIRED:');
    console.log('1. Go to: https://supabase.com/dashboard/project/xjnjfytapohglezpwksf/editor');
    console.log('2. Click "SQL Editor"');
    console.log('3. Run this SQL:');
    console.log(`
CREATE TABLE quiz_responses (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    company TEXT,
    job_title TEXT,
    responses JSONB NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    company TEXT,
    job_title TEXT,
    score INTEGER NOT NULL,
    report_generated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quiz_responses_email ON quiz_responses(email);
CREATE INDEX idx_leads_email ON leads(email);
    `);
  }
});