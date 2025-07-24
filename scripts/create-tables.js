const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Try a simple operation to test connection
    const { data, error } = await supabase
      .from('quiz_responses')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Error accessing quiz_responses table:', error.message);
      if (error.message.includes('relation "quiz_responses" does not exist')) {
        console.log('❌ Tables do not exist in Supabase yet.');
        console.log('📋 Please create the tables manually in the Supabase Dashboard.');
        console.log('\n🔗 Go to: https://supabase.com/dashboard/project/' + supabaseUrl.split('.')[0].split('//')[1] + '/editor');
        console.log('\n📝 Run this SQL in the SQL Editor:');
        console.log(`
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
        `);
        return false;
      } else {
        console.log('Unknown error:', error);
        return false;
      }
    } else {
      console.log('✅ Connection successful! Tables exist and are accessible.');
      return true;
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

async function insertTestData() {
  console.log('Testing data insertion...');
  
  try {
    // Test inserting a quiz response
    const { data: quizData, error: quizError } = await supabase
      .from('quiz_responses')
      .insert([{
        email: 'test@example.com',
        company: 'Test Company',
        job_title: 'Test Role',
        responses: { 'test-question': 'test-answer' },
        score: 85
      }])
      .select()
      .single();
    
    if (quizError) {
      console.log('❌ Error inserting quiz response:', quizError.message);
      return false;
    } else {
      console.log('✅ Quiz response inserted successfully:', quizData.id);
    }
    
    // Test inserting a lead
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert([{
        email: 'test@example.com',
        company: 'Test Company',
        job_title: 'Test Role',
        score: 85,
        report_generated: true
      }])
      .select()
      .single();
    
    if (leadError) {
      console.log('❌ Error inserting lead:', leadError.message);
      return false;
    } else {
      console.log('✅ Lead inserted successfully:', leadData.id);
    }
    
    // Clean up test data
    await supabase.from('quiz_responses').delete().eq('email', 'test@example.com');
    await supabase.from('leads').delete().eq('email', 'test@example.com');
    console.log('✅ Test data cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Test insertion failed:', error.message);
    return false;
  }
}

async function main() {
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    const insertionOk = await insertTestData();
    
    if (insertionOk) {
      console.log('\n🎉 Supabase setup is complete and working!');
      console.log('🚀 Your application is ready to use Supabase.');
    }
  }
}

main();