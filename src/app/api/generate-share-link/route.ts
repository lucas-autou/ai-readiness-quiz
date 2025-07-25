import { NextRequest, NextResponse } from 'next/server';
import { updateQuizResponseShareSlug } from '@/lib/supabase';
import { storeSlugMapping } from '@/lib/reportStore';

// Function to create a URL-friendly slug
function createSlug(company: string, jobTitle: string, email: string, score: number, createdAt: string): string {
  // Extract first name from email
  const firstName = email.split('@')[0].split('.')[0].toLowerCase();
  
  // Clean and format company name
  const companySlug = company
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove multiple hyphens
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  // Clean job title for role indication
  const roleSlug = jobTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 15); // Limit length
  
  // Get month/year from creation date
  const date = new Date(createdAt);
  const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 
                     'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const monthYear = `${monthNames[date.getMonth()]}${date.getFullYear()}`;
  
  // Create unique identifier with score
  const scoreLevel = score >= 80 ? 'champion' : score >= 60 ? 'explorer' : score >= 40 ? 'curious' : 'beginner';
  
  // Generate random suffix for uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  
  return `ai-${scoreLevel}-${companySlug}-${firstName}-${roleSlug}-${monthYear}-${randomSuffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const { responseId } = await request.json();

    if (!responseId) {
      return NextResponse.json(
        { error: 'Response ID is required' },
        { status: 400 }
      );
    }

    // Get the quiz response data to create slug
    const response = await fetch(`${request.nextUrl.origin}/api/results?id=${responseId}`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Quiz response not found' },
        { status: 404 }
      );
    }

    const result = await response.json();
    
    // Create the slug
    const slug = createSlug(
      result.company,
      result.jobTitle,
      result.email,
      result.score,
      result.createdAt
    );

    // Try to update the database with the generated slug (graceful fallback if column doesn't exist)
    const updateResult = await updateQuizResponseShareSlug(responseId, slug);
    
    if (!updateResult) {
      console.log('⚠️ Could not update database with slug (likely missing column), using cache fallback');
      // Fallback: store the mapping in memory cache
      storeSlugMapping(slug, responseId);
    }

    // Generate the full shareable URL
    const shareUrl = `${request.nextUrl.origin}/results/${slug}`;

    return NextResponse.json({
      success: true,
      slug,
      shareUrl,
      responseId
    });

  } catch (error) {
    console.error('Error generating share link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}