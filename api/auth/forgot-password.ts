import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
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

    // Check if user exists in our database and if they're an OAuth user
    const { data: existingUser } = await supabase
      .from('users')
      .select('email, display_name')
      .eq('email', email)
      .single();
    
    if (existingUser) {        
      // Check if this user was created via OAuth by looking at Supabase auth users
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const authUser = authUsers.users?.find(user => user.email === email);
      
      if (authUser && authUser.app_metadata?.provider && authUser.app_metadata.provider !== 'email') {
        return res.json({
          isOAuthUser: true,
          message: "This account uses Google Sign-In. Please use 'Continue with Google' on the login page instead of resetting your password."
        });
      }
    }
    
    // Always attempt to send reset email via Supabase (for both local DB users and Supabase-only users)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.VITE_FRONTEND_URL || 'https://breathwork.fyi'}/auth/reset-password`,
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
      // For other errors, return a generic message for security
      return res.status(500).json({ 
        error: "Failed to send reset email. Please try again later.",
        details: error.message // For internal debugging
      });
    }

    // Always return success message for security (to prevent email enumeration)
    res.json({
      message: "If an account with that email exists, we've sent password reset instructions."
    });
  } catch (error: any) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ error: "An unexpected error occurred. Please try again." });
  }
}