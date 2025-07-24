'use client';

import { useState } from 'react';
import { Copy, ExternalLink, CheckCircle, Database } from 'lucide-react';

export default function SetupPage() {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- AI Readiness Quiz Database Tables
-- Run this in Supabase SQL Editor

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

-- Create indexes for better performance
CREATE INDEX idx_quiz_responses_email ON quiz_responses(email);
CREATE INDEX idx_quiz_responses_created_at ON quiz_responses(created_at);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at);`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Database Setup Required
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Your AI Readiness Quiz needs database tables to store responses and leads. Follow the steps below to complete the setup.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Open Supabase Dashboard
                </h3>
                <p className="text-blue-200 mb-4">
                  Navigate to your Supabase project&apos;s SQL Editor to run the database setup script.
                </p>
                <a
                  href="https://supabase.com/dashboard/project/xjnjfytapohglezpwksf/editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open SQL Editor
                </a>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Copy & Run SQL Script
                </h3>
                <p className="text-blue-200 mb-4">
                  Copy the SQL script below and paste it into the Supabase SQL Editor, then click &quot;Run&quot;.
                </p>
                
                {/* SQL Script Box */}
                <div className="relative">
                  <pre className="bg-slate-800 text-green-300 p-4 rounded-lg overflow-x-auto text-sm border border-slate-600">
                    <code>{sqlScript}</code>
                  </pre>
                  
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-3 right-3 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Test Your Setup
                </h3>
                <p className="text-blue-200 mb-4">
                  Once you&apos;ve run the SQL script, your AI Readiness Quiz will be ready to collect responses and generate reports.
                </p>
                <a
                  href="/quiz"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  Test Quiz Flow
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="bg-blue-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
            <p className="text-blue-200 text-sm">
              💡 <strong>Tip:</strong> If you encounter any issues, check the browser console for detailed error messages, 
              or verify that your Supabase credentials are correctly set in the .env.local file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}