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

    // Get exercise ID from URL
    const exerciseId = req.query.id as string;
    if (!exerciseId) {
      return res.status(400).json({ error: "Exercise ID is required" });
    }

    // Create new exercise session using Supabase
    const { data: session, error: sessionError } = await supabase
      .from('exercise_sessions')
      .insert({
        user_id: user.id,
        exercise_id: exerciseId,
        rounds: req.body?.rounds || 5, // Default to 5 rounds
        started_at: new Date().toISOString(),
        mood_before: req.body?.moodBefore || null,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating exercise session:', sessionError);
      return res.status(500).json({ error: 'Failed to create exercise session' });
    }

    res.json({
      sessionId: session.id,
      exerciseId: session.exercise_id,
      startedAt: session.started_at,
      status: 'started'
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}