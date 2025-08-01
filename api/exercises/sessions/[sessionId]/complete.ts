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

const supabase = createClient(supabaseUrl, supabaseServiceKey!);

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

    // Get session ID from URL
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const { roundsCompleted, durationSeconds } = req.body;
    if (typeof roundsCompleted !== 'number' || typeof durationSeconds !== 'number') {
      return res.status(400).json({ error: "roundsCompleted and durationSeconds are required" });
    }

    // Verify session belongs to user and get session details
    const { data: session, error: sessionError } = await supabase
      .from('exercise_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      console.error('Error fetching session:', sessionError);
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update the session with completion data
    const { error: updateError } = await supabase
      .from('exercise_sessions')
      .update({
        completed_at: new Date().toISOString(),
        rounds_completed: roundsCompleted,
        duration_seconds: durationSeconds,
        completed: true
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
      return res.status(500).json({ error: 'Failed to complete session' });
    }

    // Update user stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Error fetching user stats:', statsError);
      return res.status(500).json({ error: 'Failed to fetch user stats' });
    }

    const minutes = Math.floor(durationSeconds / 60);
    const newTotalSessions = (stats?.total_sessions || 0) + 1;
    const newTotalMinutes = (stats?.total_minutes || 0) + minutes;

    if (!stats) {
      // Create new stats record
      const { error: insertStatsError } = await supabase
        .from('user_stats')
        .insert({
          user_id: user.id,
          total_sessions: newTotalSessions,
          total_minutes: newTotalMinutes,
          longest_streak: 1,
          current_streak: 1,
          last_session_at: new Date().toISOString()
        });

      if (insertStatsError) {
        console.error('Error creating user stats:', insertStatsError);
        return res.status(500).json({ error: 'Failed to create user stats' });
      }
    } else {
      // Update existing stats
      const { error: updateStatsError } = await supabase
        .from('user_stats')
        .update({
          total_sessions: newTotalSessions,
          total_minutes: newTotalMinutes,
          last_session_at: new Date().toISOString(),
          // Note: Streak calculation could be more sophisticated
          current_streak: (stats.current_streak || 0) + 1,
          longest_streak: Math.max(stats.longest_streak || 0, (stats.current_streak || 0) + 1)
        })
        .eq('user_id', user.id);

      if (updateStatsError) {
        console.error('Error updating user stats:', updateStatsError);
        return res.status(500).json({ error: 'Failed to update user stats' });
      }
    }

    res.json({
      success: true,
      sessionId: sessionId,
      roundsCompleted,
      durationSeconds,
      completedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Session Completion API Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    });
  }
}