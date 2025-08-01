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

    // Get user statistics using Supabase
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (statsError && statsError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user stats:', statsError);
      return res.status(500).json({ error: 'Failed to fetch user stats' });
    }
    
    if (!stats) {
      // Initialize stats if they don't exist
      const { data: newStats, error: insertError } = await supabase
        .from('user_stats')
        .insert({
          user_id: user.id,
          total_sessions: 0,
          total_minutes: 0,
          longest_streak: 0,
          current_streak: 0,
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating user stats:', insertError);
        return res.status(500).json({ error: 'Failed to create user stats' });
      }
      
      // Get user info for joinedDate
      const { data: userInfo } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', user.id)
        .single();
      
      return res.json({
        id: newStats.id,
        userId: newStats.user_id,
        totalSessions: newStats.total_sessions,
        totalMinutes: newStats.total_minutes,
        totalRounds: newStats.total_rounds || 0,
        longestStreak: newStats.longest_streak,
        currentStreak: newStats.current_streak,
        favoriteExercise: newStats.favorite_exercise,
        joinedDate: userInfo?.created_at || new Date().toISOString(),
        lastSessionDate: null,
        lastSessionAt: null,
      });
    }

    // Get user info for joinedDate
    const { data: userInfo } = await supabase
      .from('users')
      .select('created_at')
      .eq('id', user.id)
      .single();

    res.json({
      id: stats.id,
      userId: stats.user_id,
      totalSessions: stats.total_sessions,
      totalMinutes: stats.total_minutes,
      totalRounds: stats.total_rounds || 0,
      longestStreak: stats.longest_streak,
      currentStreak: stats.current_streak,
      favoriteExercise: stats.favorite_exercise,
      joinedDate: userInfo?.created_at || new Date().toISOString(),
      lastSessionDate: stats.last_session_at || null,
      lastSessionAt: stats.last_session_at || null, // Both formats for compatibility
    });

  } catch (error) {
    console.error('User Stats API Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    });
  }
} 