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
