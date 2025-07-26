-- ============================================================================
-- STEP-BY-STEP MIGRATION SCRIPT
-- ============================================================================
-- Run these steps one by one to migrate safely without losing data

-- ============================================================================
-- STEP 1: Backup existing data (CRITICAL - DO THIS FIRST!)
-- ============================================================================

-- Create backup tables
CREATE TABLE quiz_responses_backup AS SELECT * FROM quiz_responses;
CREATE TABLE leads_backup AS SELECT * FROM leads;

-- Verify backup
SELECT 'quiz_responses_backup' as table_name, COUNT(*) as records FROM quiz_responses_backup
UNION ALL
SELECT 'leads_backup' as table_name, COUNT(*) as records FROM leads_backup;

-- ============================================================================
-- STEP 2: Add missing columns to existing tables (non-breaking changes)
-- ============================================================================

-- Add ai_report column if it doesn't exist
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS ai_report TEXT;

-- Add additional tracking columns to existing tables
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS completion_time_seconds INTEGER;
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS device_type TEXT;
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS ip_address INET;

-- Add enhanced fields to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT 'quiz_completion';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_score INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- ============================================================================
-- STEP 3: Create new supporting tables (safe - won't affect existing data)
-- ============================================================================

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    industry TEXT,
    size_category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table (will eventually replace user info in quiz_responses)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    company_id BIGINT REFERENCES companies(id),
    job_title TEXT,
    department TEXT,
    seniority_level TEXT,
    first_quiz_at TIMESTAMP WITH TIME ZONE,
    last_quiz_at TIMESTAMP WITH TIME ZONE,
    total_quizzes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quiz versions for future A/B testing
CREATE TABLE IF NOT EXISTS quiz_versions (
    id BIGSERIAL PRIMARY KEY,
    version TEXT NOT NULL UNIQUE,
    questions JSONB NOT NULL,
    scoring_algorithm JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI reports with enhanced tracking
CREATE TABLE IF NOT EXISTS ai_reports (
    id BIGSERIAL PRIMARY KEY,
    quiz_response_id BIGINT REFERENCES quiz_responses(id), -- Link to existing table initially
    generation_method TEXT,
    agents_used TEXT[],
    generation_time_ms INTEGER,
    report_json JSONB NOT NULL,
    report_markdown TEXT,
    personalization_level TEXT,
    language TEXT DEFAULT 'pt',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agent execution logs
CREATE TABLE IF NOT EXISTS agent_executions (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT REFERENCES ai_reports(id),
    agent_name TEXT NOT NULL,
    execution_order INTEGER,
    input_data JSONB,
    output_data JSONB,
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User engagement tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    email TEXT, -- Use email initially, will migrate to user_id later
    session_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP WITH TIME ZONE,
    pages_visited TEXT[],
    actions_taken JSONB,
    conversion_event TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT
);

-- Report sharing tracking
CREATE TABLE IF NOT EXISTS report_shares (
    id BIGSERIAL PRIMARY KEY,
    quiz_response_id BIGINT REFERENCES quiz_responses(id), -- Link to existing table initially
    shared_by_email TEXT,
    share_method TEXT,
    share_url TEXT,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- STEP 4: Create indexes for performance
-- ============================================================================

-- Existing table indexes
CREATE INDEX IF NOT EXISTS idx_quiz_responses_email_enhanced ON quiz_responses(email);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_created_at_enhanced ON quiz_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_score_enhanced ON quiz_responses(score);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_company_enhanced ON quiz_responses(company);

-- New table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_ai_reports_quiz_response_id ON ai_reports(quiz_response_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_generation_method ON ai_reports(generation_method);
CREATE INDEX IF NOT EXISTS idx_user_sessions_email ON user_sessions(email);
CREATE INDEX IF NOT EXISTS idx_report_shares_quiz_response_id ON report_shares(quiz_response_id);

-- ============================================================================
-- STEP 5: Insert initial data
-- ============================================================================

-- Insert current quiz version
INSERT INTO quiz_versions (version, questions, is_active)
VALUES ('v1.0', '{"version": "1.0", "description": "Current production quiz structure"}', true)
ON CONFLICT (version) DO NOTHING;

-- Auto-populate companies from existing quiz responses
INSERT INTO companies (name, domain, industry, created_at)
SELECT DISTINCT
    CASE 
        WHEN company IS NOT NULL AND company != '' THEN company
        ELSE split_part(split_part(email, '@', 2), '.', 1)
    END as name,
    split_part(email, '@', 2) as domain,
    NULL as industry, -- Will be filled later
    MIN(created_at) as created_at
FROM quiz_responses
WHERE split_part(email, '@', 2) NOT IN ('gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com')
GROUP BY 1, 2
ON CONFLICT DO NOTHING;

-- Auto-populate users from existing quiz responses
INSERT INTO users (email, company_id, job_title, first_quiz_at, last_quiz_at, total_quizzes, created_at)
SELECT 
    qr.email,
    c.id as company_id,
    qr.job_title,
    MIN(qr.created_at) as first_quiz_at,
    MAX(qr.created_at) as last_quiz_at,
    COUNT(*) as total_quizzes,
    MIN(qr.created_at) as created_at
FROM quiz_responses qr
LEFT JOIN companies c ON c.domain = split_part(qr.email, '@', 2)
GROUP BY qr.email, c.id, qr.job_title
ON CONFLICT (email) DO UPDATE SET
    total_quizzes = EXCLUDED.total_quizzes,
    last_quiz_at = EXCLUDED.last_quiz_at;

-- Migrate existing AI reports from ai_report column
INSERT INTO ai_reports (quiz_response_id, generation_method, report_json, report_markdown, created_at)
SELECT 
    id,
    'legacy' as generation_method,
    CASE 
        WHEN ai_report LIKE '{%}' THEN ai_report::jsonb
        ELSE json_build_object('content', ai_report)::jsonb
    END as report_json,
    ai_report as report_markdown,
    created_at
FROM quiz_responses
WHERE ai_report IS NOT NULL AND ai_report != ''
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 6: Enable Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_shares ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for now (tighten in production)
CREATE POLICY "Allow all operations on companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on quiz_versions" ON quiz_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ai_reports" ON ai_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on agent_executions" ON agent_executions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_sessions" ON user_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on report_shares" ON report_shares FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- STEP 7: Create utility views for backwards compatibility
-- ============================================================================

-- View that maintains compatibility with existing application code
CREATE OR REPLACE VIEW quiz_responses_enhanced AS
SELECT 
    qr.*,
    u.id as user_id,
    c.name as company_name,
    c.industry as company_industry,
    c.size_category as company_size,
    ar.generation_method,
    ar.agents_used,
    ar.personalization_level
FROM quiz_responses qr
LEFT JOIN users u ON u.email = qr.email
LEFT JOIN companies c ON c.id = u.company_id
LEFT JOIN ai_reports ar ON ar.quiz_response_id = qr.id;

-- Analytics view for insights
CREATE OR REPLACE VIEW quiz_analytics_summary AS
SELECT 
    DATE(qr.created_at) as quiz_date,
    c.industry,
    c.size_category,
    u.seniority_level,
    COUNT(*) as total_responses,
    AVG(qr.score) as avg_score,
    COUNT(CASE WHEN ar.id IS NOT NULL THEN 1 END) as reports_generated,
    COUNT(CASE WHEN rs.id IS NOT NULL THEN 1 END) as reports_shared
FROM quiz_responses qr
LEFT JOIN users u ON u.email = qr.email
LEFT JOIN companies c ON c.id = u.company_id
LEFT JOIN ai_reports ar ON ar.quiz_response_id = qr.id
LEFT JOIN report_shares rs ON rs.quiz_response_id = qr.id
GROUP BY 1,2,3,4
ORDER BY 1 DESC;

-- ============================================================================
-- STEP 8: Verification queries
-- ============================================================================

-- Verify migration success
SELECT 
    'Original quiz_responses' as table_name, 
    COUNT(*) as records,
    COUNT(CASE WHEN ai_report IS NOT NULL THEN 1 END) as with_ai_report
FROM quiz_responses
UNION ALL
SELECT 
    'Migrated users' as table_name, 
    COUNT(*) as records,
    NULL as with_ai_report
FROM users
UNION ALL
SELECT 
    'Migrated companies' as table_name, 
    COUNT(*) as records,
    NULL as with_ai_report
FROM companies
UNION ALL
SELECT 
    'Migrated ai_reports' as table_name, 
    COUNT(*) as records,
    NULL as with_ai_report
FROM ai_reports;

-- Check data integrity
SELECT 
    'Users without company' as check_name,
    COUNT(*) as count
FROM users WHERE company_id IS NULL
UNION ALL
SELECT 
    'Quiz responses without matching user' as check_name,
    COUNT(*) as count
FROM quiz_responses qr
LEFT JOIN users u ON u.email = qr.email
WHERE u.id IS NULL;

-- ============================================================================
-- NEXT STEPS AFTER MIGRATION
-- ============================================================================

/*
After running this migration:

1. **Update Application Code**:
   - Modify database queries to use new structure
   - Update AI report storage to use ai_reports table
   - Add user session tracking

2. **Test Thoroughly**:
   - Verify all existing functionality works
   - Test new analytics capabilities
   - Ensure report generation still works

3. **Phase 2 Migration** (Later):
   - Fully normalize quiz_responses into quiz_attempts + quiz_responses
   - Remove redundant columns from original tables
   - Implement more sophisticated analytics

4. **Analytics Setup**:
   - Create dashboards using the new views
   - Set up monitoring for agent performance
   - Implement conversion tracking

5. **Performance Optimization**:
   - Monitor query performance with new indexes
   - Optimize based on actual usage patterns
   - Consider partitioning for large datasets

The migration maintains full backwards compatibility while adding
powerful new analytics and tracking capabilities.
*/