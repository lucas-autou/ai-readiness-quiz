// Note: SQLite disabled for Vercel deployment (serverless incompatible)
// Using Supabase instead via supabase.ts
import { z } from 'zod';

// const db = new Database('quiz.db'); // Disabled for Vercel

export const QuizResponseSchema = z.object({
  id: z.number().optional(),
  email: z.string().email(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  responses: z.record(z.string(), z.string()),
  score: z.number(),
  createdAt: z.string().optional(),
});

export type QuizResponse = z.infer<typeof QuizResponseSchema>;

export const LeadSchema = z.object({
  id: z.number().optional(),
  email: z.string().email(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  score: z.number(),
  reportGenerated: z.boolean().default(false),
  createdAt: z.string().optional(),
});

export type Lead = z.infer<typeof LeadSchema>;

// SQLite functions disabled for Vercel - use Supabase instead
/*
db.exec(`
  CREATE TABLE IF NOT EXISTS quiz_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    company TEXT,
    job_title TEXT,
    responses TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    company TEXT,
    job_title TEXT,
    score INTEGER NOT NULL,
    report_generated BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export const insertQuizResponse = db.prepare(`
  INSERT INTO quiz_responses (email, company, job_title, responses, score)
  VALUES (?, ?, ?, ?, ?)
`);

export const insertLead = db.prepare(`
  INSERT OR REPLACE INTO leads (email, company, job_title, score, report_generated)
  VALUES (?, ?, ?, ?, ?)
`);

export const getLeadByEmail = db.prepare(`
  SELECT * FROM leads WHERE email = ?
`);

export const getAllLeads = db.prepare(`
  SELECT * FROM leads ORDER BY created_at DESC
`);

export const getQuizResponsesByEmail = db.prepare(`
  SELECT * FROM quiz_responses WHERE email = ? ORDER BY created_at DESC
`);

export default db;
*/

// For Vercel deployment, all database operations are handled via Supabase
// See src/lib/supabase.ts for database functions