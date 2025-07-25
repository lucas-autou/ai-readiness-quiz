import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        error: 'Supabase client not initialized',
        message: 'Please configure SUPABASE_URL and SUPABASE_ANON_KEY environment variables'
      }, { status: 500 });
    }

    // Test if tables exist by trying to select from them
    const { error: quizError } = await supabase
      .from('quiz_responses')
      .select('id')
      .limit(1);

    const { error: leadsError } = await supabase
      .from('leads')
      .select('id')
      .limit(1);

    if (quizError || leadsError) {
      return NextResponse.json({
        tablesExist: false,
        quizError: quizError?.message || null,
        leadsError: leadsError?.message || null,
        setupUrl: '/setup'
      });
    }

    return NextResponse.json({
      tablesExist: true,
      message: 'Database tables are ready!',
      quizTableAccessible: !quizError,
      leadsTableAccessible: !leadsError
    });

  } catch (error) {
    return NextResponse.json({
      tablesExist: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      setupUrl: '/setup'
    }, { status: 500 });
  }
}