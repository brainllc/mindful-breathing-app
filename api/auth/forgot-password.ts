import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if user exists in our database and if they're an OAuth user
    const { data: existingUser } = await supabase
      .from('users')
      .select('email, display_name')
      .eq('email', email)
      .single();
    
    if (existingUser) {        
      // Check if this user was created via OAuth (they won't have a Supabase Auth account)
      const { data: authUser } = await supabase.auth.admin.getUserByEmail(email);
      
      if (authUser.user && authUser.user.app_metadata?.provider && authUser.user.app_metadata.provider !== 'email') {
        return res.json({
          isOAuthUser: true,
          message: "This account uses Google Sign-In. Please use 'Continue with Google' on the login page instead of resetting your password."
        });
      }
    }
    
    // Always attempt to send reset email via Supabase (for both local DB users and Supabase-only users)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'https://breathwork.fyi'}/auth/reset-password`,
    });

    if (error) {
      console.error("Password reset error:", error.message);
      
      // Handle rate limiting specifically
      if (error.message?.includes("rate limit") || error.message?.includes("too many")) {
        return res.status(429).json({ 
          error: "Too many password reset requests. Please wait a few minutes before trying again.",
          rateLimited: true
        });
      }
      
      // Don't expose other internal errors to prevent information leakage
    }

    // Always return success message for security (to prevent email enumeration)
    res.json({
      message: "If an account with that email exists, we've sent password reset instructions."
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ 
      error: "An error occurred while processing your request. Please try again." 
    });
  }
}