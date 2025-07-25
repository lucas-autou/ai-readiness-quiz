import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const QuizResponseSchema = z.object({
  id: z.number().optional(),
  email: z.string().email(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  responses: z.record(z.string(), z.string()),
  score: z.number(),
  ai_report: z.string().optional(),
  created_at: z.string().optional(),
});

export type QuizResponse = z.infer<typeof QuizResponseSchema>;

export const LeadSchema = z.object({
  id: z.number().optional(),
  email: z.string().email(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  score: z.number(),
  report_generated: z.boolean().default(false),
  created_at: z.string().optional(),
});

export type Lead = z.infer<typeof LeadSchema>;

// Database functions
export async function insertQuizResponse(data: {
  email: string;
  company: string;
  job_title: string;
  responses: Record<string, string | string[]>;
  score: number;
  ai_report?: string;
}) {
  // If Supabase is not configured, return a mock result for local development
  if (!supabase) {
    console.log('⚠️ Supabase not configured, using mock data');
    const mockId = Math.floor(Math.random() * 1000) + 1;
    return {
      id: mockId,
      email: data.email,
      company: data.company,
      job_title: data.job_title,
      responses: data.responses,
      score: data.score,
      ai_report: data.ai_report || null,
      created_at: new Date().toISOString()
    };
  }
  const insertData: Record<string, unknown> = {
    email: data.email,
    company: data.company,
    job_title: data.job_title,
    responses: data.responses,
    score: data.score,
  };

  // Only add ai_report if the column exists in the database
  if (data.ai_report) {
    try {
      // Try to insert with ai_report first
      const testData = { ...insertData, ai_report: data.ai_report };
      console.log('💾 Attempting to insert with ai_report column...');
      
      const { data: result, error } = await supabase
        .from('quiz_responses')
        .insert([testData])
        .select()
        .single();

      if (error) {
        if (error.message.includes('ai_report')) {
          console.log('⚠️ ai_report column not found, inserting without it...');
          // Column doesn't exist, insert without it
          const { data: fallbackResult, error: fallbackError } = await supabase
            .from('quiz_responses')
            .insert([insertData])
            .select()
            .single();
            
          if (fallbackError) {
            console.error('❌ Database insert error:', fallbackError);
            throw fallbackError;
          }
          
          console.log('✅ Quiz response inserted without AI report, ID:', fallbackResult.id);
          return fallbackResult;
        } else {
          throw error;
        }
      }
      
      console.log('✅ Quiz response inserted with AI report, ID:', result.id);
      return result;
      
    } catch (error) {
      console.error('❌ Error during insert:', error);
      throw error;
    }
  }

  // If no ai_report, just insert the basic data
  console.log('💾 Inserting quiz response without AI report...');
  
  const { data: result, error } = await supabase
    .from('quiz_responses')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('❌ Database insert error:', error);
    throw error;
  }

  console.log('✅ Quiz response inserted with ID:', result.id);
  return result;
}

export async function insertLead(data: {
  email: string;
  company: string;
  job_title: string;
  score: number;
  report_generated?: boolean;
}) {
  // If Supabase is not configured, return a mock result
  if (!supabase) {
    console.log('⚠️ Supabase not configured, skipping lead insertion');
    return {
      id: Math.floor(Math.random() * 1000) + 1,
      email: data.email,
      company: data.company,
      job_title: data.job_title,
      score: data.score,
      report_generated: data.report_generated || true,
      created_at: new Date().toISOString()
    };
  }
  const { data: result, error } = await supabase
    .from('leads')
    .upsert([{
      email: data.email,
      company: data.company,
      job_title: data.job_title,
      score: data.score,
      report_generated: data.report_generated || true,
    }], {
      onConflict: 'email'
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
}

export async function getLeadByEmail(email: string) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw error;
  }

  return data;
}

export async function getAllLeads() {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getQuizResponsesByEmail(email: string) {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data, error } = await supabase
    .from('quiz_responses')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getQuizResponseById(id: string) {
  // If Supabase is not configured, return null
  if (!supabase) {
    console.log('⚠️ Supabase not configured, cannot fetch quiz response');
    return null;
  }
  const { data, error } = await supabase
    .from('quiz_responses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    // If it's a "not found" error, return null instead of throwing
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

export async function getQuizResponseBySlug(slug: string) {
  // If Supabase is not configured, return null
  if (!supabase) {
    console.log('⚠️ Supabase not configured, cannot fetch quiz response by slug');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('quiz_responses')
      .select('*')
      .eq('share_slug', slug)
      .single();

    if (error) {
      // If it's a "not found" error, return null instead of throwing
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.log('⚠️ share_slug column might not exist yet, returning null');
    return null;
  }
}

export async function updateQuizResponseShareSlug(id: string, shareSlug: string) {
  // If Supabase is not configured, return mock success
  if (!supabase) {
    console.log('⚠️ Supabase not configured, mock updating share slug');
    return { id, share_slug: shareSlug };
  }
  
  try {
    const { data, error } = await supabase
      .from('quiz_responses')
      .update({ share_slug: shareSlug })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.message.includes('share_slug')) {
        console.log('⚠️ share_slug column not found, needs database migration');
        // Column doesn't exist yet - we'll need to add it to the database
        return null;
      }
      throw error;
    }

    console.log('✅ Share slug updated for response ID:', id);
    return data;
  } catch (error) {
    console.error('❌ Error updating share slug:', error);
    return null;
  }
}