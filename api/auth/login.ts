import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Update last login time and get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id)
      .select()
      .single();

    if (profileError) {
      console.error("Failed to update user profile:", profileError);
      // Continue anyway, login succeeded
    }

    // If user doesn't exist in our database, create them automatically
    if (!userProfile) {
      const displayName = data.user.user_metadata?.full_name || 
                         data.user.user_metadata?.name || 
                         data.user.email?.split('@')[0] || 
                         "User";
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          display_name: displayName,
          is_age_verified: true,
          accepted_terms_at: new Date().toISOString(),
          accepted_privacy_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("Failed to create user record:", createError);
        return res.status(500).json({ error: "Failed to create user profile" });
      }

      // Initialize user stats
      await supabase.from('user_stats').insert({
        user_id: data.user.id,
      });

      return res.json({
        session: data.session,
        user: newUser,
      });
    }

    res.json({
      session: data.session,
      user: userProfile,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      error: "An error occurred while logging in. Please try again." 
    });
  }
}