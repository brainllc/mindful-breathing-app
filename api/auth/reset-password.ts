import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password, accessToken, refreshToken } = req.body;
    
    if (!password || !accessToken || !refreshToken) {
      return res.status(400).json({ error: "Password and tokens are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    // Create a temporary Supabase client with the reset tokens
    const tempSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    // Set the session with the reset tokens
    const { error: sessionError } = await tempSupabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      console.error("Session error:", sessionError);
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    // Update the user's password
    const { error: updateError } = await tempSupabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      console.error("Password update error:", updateError);
      return res.status(400).json({ error: updateError.message });
    }

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ 
      error: "An error occurred while resetting your password. Please try again." 
    });
  }
}