import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from "@supabase/supabase-js";

// TEMPORARY ENDPOINT TO FIX ROUNDS - DELETE AFTER USE

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey || process.env.VITE_SUPABASE_ANON_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    // Get all COMPLETED sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('exercise_sessions')
      .select('rounds_completed')
      .eq('user_id', user.id)
      .eq('completed', true);

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }

    // Calculate the correct total
    const correctTotalRounds = sessions?.reduce((sum, session) => 
      sum + (Number(session.rounds_completed) || 0), 0) || 0;

    // Update user stats with correct value
    const { error: updateError } = await supabase
      .from('user_stats')
      .update({
        total_rounds: correctTotalRounds,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating stats:', updateError);
      return res.status(500).json({ error: 'Failed to update stats' });
    }

    res.json({
      message: "Rounds fixed successfully!",
      correctTotalRounds,
      sessionsAnalyzed: sessions?.length || 0
    });

  } catch (error) {
    console.error('Fix Rounds Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}