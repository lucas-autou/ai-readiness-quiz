-- ============================================================================
-- ENHANCED AI READINESS QUIZ DATABASE SCHEMA
-- ============================================================================
-- This schema is designed for better analytics, user tracking, and insights
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. USERS AND COMPANIES
-- ============================================================================

-- Companies table for better organization insights
CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT, -- email domain for automatic matching
    industry TEXT,
    size_category TEXT, -- 'startup', 'sme', 'enterprise', 'fortune500'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    company_id BIGINT REFERENCES companies(id),
    job_title TEXT,
    department TEXT,
    seniority_level TEXT, -- 'individual', 'manager', 'director', 'executive'
    first_quiz_at TIMESTAMP WITH TIME ZONE,
    last_quiz_at TIMESTAMP WITH TIME ZONE,
    total_quizzes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. QUIZ STRUCTURE AND METADATA
-- ============================================================================

-- Quiz versions for A/B testing and evolution tracking
CREATE TABLE IF NOT EXISTS quiz_versions (
    id BIGSERIAL PRIMARY KEY,
    version TEXT NOT NULL UNIQUE, -- 'v1.0', 'v2.0', etc.
    questions JSONB NOT NULL, -- Structure of questions for this version
    scoring_algorithm JSONB, -- How scoring works for this version
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Individual quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    quiz_version_id BIGINT REFERENCES quiz_versions(id),
    score INTEGER NOT NULL,
    completion_time_seconds INTEGER, -- Time to complete quiz
    device_type TEXT, -- 'mobile', 'desktop', 'tablet'
    source TEXT, -- UTM source, referrer, etc.
    status TEXT DEFAULT 'completed', -- 'started', 'completed', 'abandoned'
    ip_address INET, -- For geographical insights
    user_agent TEXT, -- For device/browser analytics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 3. DETAILED QUIZ RESPONSES
-- ============================================================================

-- Normalized question responses for better analytics
CREATE TABLE IF NOT EXISTS quiz_responses (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT REFERENCES quiz_attempts(id),
    question_id TEXT NOT NULL,
    question_type TEXT NOT NULL, -- 'multiple-choice', 'card-select', etc.
    response_value JSONB NOT NULL, -- Actual response (string, array, etc.)
    response_text TEXT, -- Human-readable version for analysis
    points_earned INTEGER,
    max_points INTEGER,
    time_spent_seconds INTEGER, -- Time spent on this specific question
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. AI REPORTS AND ANALYSIS
-- ============================================================================

-- AI-generated reports with enhanced tracking
CREATE TABLE IF NOT EXISTS ai_reports (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT REFERENCES quiz_attempts(id),
    generation_method TEXT, -- 'multi-agent', 'claude-legacy', 'fallback'
    agents_used TEXT[], -- Array of agent names used
    generation_time_ms INTEGER, -- Time to generate report
    report_json JSONB NOT NULL, -- Structured report data
    report_markdown TEXT, -- Markdown version for display
    personalization_level TEXT, -- 'high', 'medium', 'low'
    language TEXT DEFAULT 'pt',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Agent execution logs for debugging and optimization
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

-- ============================================================================
-- 5. USER ENGAGEMENT AND ANALYTICS
-- ============================================================================

-- Track user engagement patterns
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    session_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP WITH TIME ZONE,
    pages_visited TEXT[],
    actions_taken JSONB, -- Track clicks, scrolls, etc.
    conversion_event TEXT, -- 'quiz_completed', 'email_captured', 'report_shared'
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT
);

-- Email/Lead management with enhanced tracking
CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    attempt_id BIGINT REFERENCES quiz_attempts(id),
    lead_source TEXT, -- 'quiz_completion', 'email_signup', 'sharing'
    lead_score INTEGER, -- Calculated lead quality score
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted'
    tags TEXT[], -- For segmentation
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Report sharing and viral tracking
CREATE TABLE IF NOT EXISTS report_shares (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT REFERENCES ai_reports(id),
    shared_by_user_id BIGINT REFERENCES users(id),
    share_method TEXT, -- 'email', 'link', 'social'
    share_url TEXT,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0, -- How many people took quiz from this share
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. ANALYTICS AND INSIGHTS VIEWS
-- ============================================================================

-- Pre-computed analytics view for dashboard
CREATE VIEW quiz_analytics AS
SELECT 
    qa.created_at::date as quiz_date,
    u.seniority_level,
    c.industry,
    c.size_category,
    qa.score,
    qa.completion_time_seconds,
    ar.generation_method,
    ar.personalization_level,
    COUNT(*) as total_attempts,
    AVG(qa.score) as avg_score,
    AVG(qa.completion_time_seconds) as avg_completion_time
FROM quiz_attempts qa
JOIN users u ON qa.user_id = u.id
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN ai_reports ar ON ar.attempt_id = qa.id
WHERE qa.status = 'completed'
GROUP BY 1,2,3,4,5,6,7,8;

-- Response patterns view for insights
CREATE VIEW response_patterns AS
SELECT 
    qr.question_id,
    qr.question_type,
    qr.response_text,
    u.seniority_level,
    c.industry,
    COUNT(*) as response_count,
    AVG(qa.score) as avg_user_score
FROM quiz_responses qr
JOIN quiz_attempts qa ON qr.attempt_id = qa.id
JOIN users u ON qa.user_id = u.id
LEFT JOIN companies c ON u.company_id = c.id
GROUP BY 1,2,3,4,5;

-- ============================================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================================

-- User and company indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);

-- Quiz attempt indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON quiz_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_score ON quiz_attempts(score);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON quiz_attempts(status);

-- Response indexes for analytics
CREATE INDEX IF NOT EXISTS idx_quiz_responses_attempt_id ON quiz_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_question_id ON quiz_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_question_type ON quiz_responses(question_type);

-- AI report indexes
CREATE INDEX IF NOT EXISTS idx_ai_reports_attempt_id ON ai_reports(attempt_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_generation_method ON ai_reports(generation_method);
CREATE INDEX IF NOT EXISTS idx_ai_reports_created_at ON ai_reports(created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_start ON user_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- ============================================================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_shares ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (in production, implement proper policies)
CREATE POLICY "Allow all operations on companies" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on quiz_versions" ON quiz_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on quiz_attempts" ON quiz_attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on quiz_responses" ON quiz_responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ai_reports" ON ai_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on agent_executions" ON agent_executions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_sessions" ON user_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on report_shares" ON report_shares FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 9. TRIGGER FUNCTIONS FOR AUTOMATION
-- ============================================================================

-- Function to automatically update company info from email domain
CREATE OR REPLACE FUNCTION extract_company_from_email()
RETURNS TRIGGER AS $$
DECLARE
    email_domain TEXT;
    company_record RECORD;
BEGIN
    -- Extract domain from email
    email_domain := split_part(NEW.email, '@', 2);
    
    -- Skip generic email providers
    IF email_domain NOT IN ('gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com') THEN
        -- Look for existing company with this domain
        SELECT * INTO company_record FROM companies WHERE domain = email_domain;
        
        -- If company doesn't exist, create it
        IF NOT FOUND THEN
            INSERT INTO companies (name, domain) 
            VALUES (initcap(replace(split_part(email_domain, '.', 1), '-', ' ')), email_domain)
            RETURNING * INTO company_record;
        END IF;
        
        -- Update user's company_id
        NEW.company_id := company_record.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign company based on email domain
CREATE TRIGGER auto_assign_company_trigger
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION extract_company_from_email();

-- Function to update user quiz statistics
CREATE OR REPLACE FUNCTION update_user_quiz_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's quiz statistics
    UPDATE users SET 
        total_quizzes = (
            SELECT COUNT(*) FROM quiz_attempts 
            WHERE user_id = NEW.user_id AND status = 'completed'
        ),
        last_quiz_at = NEW.completed_at,
        first_quiz_at = COALESCE(
            (SELECT MIN(completed_at) FROM quiz_attempts 
             WHERE user_id = NEW.user_id AND status = 'completed'), 
            first_quiz_at
        ),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats when quiz is completed
CREATE TRIGGER update_user_stats_trigger
    AFTER INSERT OR UPDATE ON quiz_attempts
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION update_user_quiz_stats();

-- ============================================================================
-- 10. MIGRATION FROM OLD STRUCTURE
-- ============================================================================

-- Insert current quiz version
INSERT INTO quiz_versions (version, questions, is_active)
VALUES ('v1.0', '{"version": "1.0", "description": "Initial quiz structure"}', true)
ON CONFLICT (version) DO NOTHING;

-- NOTE: The following would be used to migrate existing data
-- This is commented out as it should be run carefully after backing up data

/*
-- Migrate existing quiz_responses to new structure
INSERT INTO users (email, company_id, job_title, first_quiz_at, total_quizzes, created_at)
SELECT DISTINCT 
    email,
    NULL, -- company_id will be auto-assigned by trigger
    job_title,
    created_at,
    1,
    created_at
FROM quiz_responses_old
ON CONFLICT (email) DO UPDATE SET
    job_title = EXCLUDED.job_title,
    total_quizzes = users.total_quizzes + 1,
    last_quiz_at = EXCLUDED.first_quiz_at;

-- Create quiz attempts from old responses
WITH version_id AS (SELECT id FROM quiz_versions WHERE version = 'v1.0')
INSERT INTO quiz_attempts (user_id, quiz_version_id, score, status, created_at, completed_at)
SELECT 
    u.id,
    v.id,
    qr.score,
    'completed',
    qr.created_at,
    qr.created_at
FROM quiz_responses_old qr
JOIN users u ON u.email = qr.email
CROSS JOIN version_id v;
*/

-- ============================================================================
-- SUMMARY OF IMPROVEMENTS
-- ============================================================================

/*
This enhanced schema provides:

1. **Better Analytics**: 
   - Normalized responses for trend analysis
   - User journey tracking
   - Conversion funnel analysis

2. **Enhanced User Management**:
   - Company-based segmentation
   - User progression tracking
   - Engagement analytics

3. **Detailed AI Reporting**:
   - Agent execution tracking
   - Performance monitoring
   - Report sharing analytics

4. **Scalable Architecture**:
   - Proper indexing for performance
   - Views for common queries
   - Automated data maintenance

5. **Business Intelligence Ready**:
   - Pre-computed analytics views
   - Response pattern analysis
   - Lead scoring and management

To implement:
1. Run this script in Supabase SQL Editor
2. Update application code to use new schema
3. Migrate existing data using commented migration queries
4. Set up analytics dashboards using the provided views
*/