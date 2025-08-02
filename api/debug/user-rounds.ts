import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header is missing" });
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Bearer token is missing" });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get ALL sessions for debugging
    const { data: allSessions, error: allSessionsError } = await supabase
      .from('exercise_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });

    if (allSessionsError) {
      console.error('Error fetching sessions:', allSessionsError);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }

    // Get current user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Calculate what the totals SHOULD be (completed sessions only)
    const completedSessions = allSessions?.filter(s => s.completed === true) || [];
    const calculatedTotalRounds = completedSessions.reduce((sum, session) => sum + (Number(session.rounds_completed) || 0), 0);
    const calculatedTotalSessions = completedSessions.length;
    const calculatedTotalMinutes = Math.floor(
      completedSessions.reduce((sum, session) => sum + (Number(session.duration_seconds) || 0), 0) / 60
    );

    res.json({
      userId: user.id,
      currentStats: stats ? {
        totalSessions: stats.total_sessions,
        totalRounds: stats.total_rounds,
        totalMinutes: stats.total_minutes,
        lastUpdated: stats.updated_at
      } : null,
      calculatedStats: {
        totalRounds: calculatedTotalRounds,
        totalSessions: calculatedTotalSessions,
        totalMinutes: calculatedTotalMinutes
      },
      sessionsSummary: {
        totalSessionsInDB: allSessions?.length || 0,
        completedSessions: completedSessions.length,
        incompleteSessions: (allSessions?.length || 0) - completedSessions.length
      },
      recentSessions: allSessions?.slice(0, 10).map(s => ({
        id: s.id,
        exerciseId: s.exercise_id,
        rounds: s.rounds,
        roundsCompleted: s.rounds_completed,
        durationSeconds: s.duration_seconds,
        completed: s.completed,
        startedAt: s.started_at,
        completedAt: s.completed_at
      })),
      discrepancy: {
        roundsDifference: (stats?.total_rounds || 0) - calculatedTotalRounds,
        sessionsDifference: (stats?.total_sessions || 0) - calculatedTotalSessions,
        message: stats && stats.total_rounds !== calculatedTotalRounds 
          ? `Stats show ${stats.total_rounds} rounds but should be ${calculatedTotalRounds}` 
          : 'Stats are correct'
      }
    });

  } catch (error) {
    console.error('Debug User Rounds API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    });
  }
}