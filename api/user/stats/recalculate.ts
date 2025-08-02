import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing VITE_SUPABASE_URL environment variable');
}
if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
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

    console.log('🔧 Recalculating stats for user:', user.id);

    // Get all COMPLETED sessions (this is the key fix!)
    const { data: sessions, error: sessionsError } = await supabase
      .from('exercise_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', true); // Only count completed sessions!

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }

    // Calculate totals from completed sessions only
    const totalSessions = sessions?.length || 0;
    const totalRounds = sessions?.reduce((sum, session) => sum + (Number(session.rounds_completed) || 0), 0) || 0;
    const totalSeconds = sessions?.reduce((sum, session) => sum + (Number(session.duration_seconds) || 0), 0) || 0;
    const totalMinutes = Math.floor(totalSeconds / 60);

    console.log('📊 Calculated stats:', {
      totalSessions,
      totalRounds,
      totalMinutes,
      sessionsFound: sessions?.length || 0
    });

    // Update user stats with the correct values
    const { data: updatedStats, error: updateError } = await supabase
      .from('user_stats')
      .update({
        total_sessions: totalSessions,
        total_rounds: totalRounds,
        total_minutes: totalMinutes,
        last_session_at: sessions && sessions.length > 0 
          ? sessions.sort((a, b) => new Date(b.completed_at || b.started_at).getTime() - new Date(a.completed_at || a.started_at).getTime())[0].completed_at 
          : null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating stats:', updateError);
      return res.status(500).json({ error: 'Failed to update stats' });
    }

    console.log('✅ Stats recalculated successfully');

    res.json({
      message: "Stats recalculated successfully",
      newStats: {
        totalSessions,
        totalRounds,
        totalMinutes
      },
      debug: {
        sessionsAnalyzed: sessions?.length || 0,
        firstFewSessions: sessions?.slice(0, 3).map(s => ({
          id: s.id,
          exerciseId: s.exercise_id,
          roundsCompleted: s.rounds_completed,
          completed: s.completed
        }))
      }
    });

  } catch (error) {
    console.error('Recalculate Stats API Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    });
  }
}