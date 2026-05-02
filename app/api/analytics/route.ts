import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

type JobPosting = {
  id: string;
  status?: string | null;
  category?: string | null;
  event_city?: string | null;
  created_at?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
};

function incrementMap(map: Map<string, number>, key?: string | null) {
  const safeKey = key?.trim() || 'Unknown';
  map.set(safeKey, (map.get(safeKey) || 0) + 1);
}

function mapToSortedArray(map: Map<string, number>, limit?: number) {
  const result = Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return typeof limit === 'number' ? result.slice(0, limit) : result;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select(
        'id,status,category,event_city,created_at,budget_min,budget_max'
      );

    if (error) {
      throw error;
    }

    const postings = (data ?? []) as JobPosting[];

    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalPostings = postings.length;
    const activePostings = postings.filter((posting) => posting.status === 'active').length;
    const openPostings = postings.filter((posting) => posting.status === 'open').length;
    const closedPostings = postings.filter((posting) => posting.status === 'closed').length;
    const archivedPostings = postings.filter((posting) => posting.status === 'archived').length;

    const postingsThisMonth = postings.filter((posting) => {
      if (!posting.created_at) return false;
      const createdAt = new Date(posting.created_at);
      return !Number.isNaN(createdAt.getTime()) && createdAt >= monthAgo;
    }).length;

    const categoryMap = new Map<string, number>();
    const cityMap = new Map<string, number>();

    postings.forEach((posting) => {
      incrementMap(categoryMap, posting.category);
      incrementMap(cityMap, posting.event_city);
    });

    const postingsByCategory = mapToSortedArray(categoryMap);
    const postingsByCity = mapToSortedArray(cityMap, 20);

    const postingsWithBudget = postings.filter(
      (posting) =>
        typeof posting.budget_min === 'number' &&
        typeof posting.budget_max === 'number' &&
        posting.budget_min > 0 &&
        posting.budget_max > 0
    );

    const averageBudget =
      postingsWithBudget.length > 0
        ? postingsWithBudget.reduce((sum, posting) => {
            return sum + ((posting.budget_min || 0) + (posting.budget_max || 0)) / 2;
          }, 0) / postingsWithBudget.length
        : 0;

    const budgetRanges = [
      { range: '0 - 100K ₽', min: 0, max: 100000 },
      { range: '100K - 500K ₽', min: 100000, max: 500000 },
      { range: '500K - 1M ₽', min: 500000, max: 1000000 },
      { range: '1M - 5M ₽', min: 1000000, max: 5000000 },
      { range: '5M+ ₽', min: 5000000, max: Number.POSITIVE_INFINITY },
    ];

    const budgetDistribution = budgetRanges.map((range) => ({
      range: range.range,
      count: postingsWithBudget.filter((posting) => {
        const minBudget = posting.budget_min || 0;
        return minBudget >= range.min && minBudget < range.max;
      }).length,
    }));

    return NextResponse.json(
      {
        totalPostings,
        activePostings,
        openPostings,
        closedPostings,
        archivedPostings,
        postingsThisMonth,
        postingsByCategory,
        postingsByCity,
        averageBudget,
        budgetDistribution,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/analytics error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}