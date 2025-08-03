import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize Supabase - use service role key for admin operations
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, displayName, isAgeVerified, marketingConsent } = req.body;

    // Basic validation
    if (!email || !password || !displayName || typeof isAgeVerified !== 'boolean') {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      if (authError.message.includes('rate limit')) {
        return res.status(429).json({ 
          message: "Too many signup attempts. Please wait a few minutes and try again, or try signing in with Google.",
          rateLimited: true 
        });
      }
      return res.status(400).json({ message: authError.message });
    }

    if (!authData.user) {
      return res.status(400).json({ message: "Failed to create user" });
    }

    // Create user in local database
    const now = new Date();
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        display_name: displayName,
        is_age_verified: isAgeVerified,
        marketing_consent: marketingConsent || false,
        accepted_terms_at: now.toISOString(),
        accepted_privacy_at: now.toISOString(),
        marketing_consent_at: marketingConsent ? now.toISOString() : null,
        is_email_verified: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('User creation error:', insertError);
      return res.status(500).json({ 
        message: "Failed to create user account. Please try again.",
        error: insertError.message 
      });
    }

    // Initialize user stats
    const { error: statsError } = await supabase
      .from('user_stats')
      .insert({
        user_id: authData.user.id,
      });

    if (statsError) {
      console.error('User stats creation error:', statsError);
      // Continue even if stats creation fails
    }

    // Unlock exercises for registered users (premium exercises)
    const registrationUnlocks = [
      "wim-hof",
      "nadi-shodhana", 
      "kapalbhati",
      "lions-breath"
    ];

    for (const exerciseId of registrationUnlocks) {
      const { error: unlockError } = await supabase
        .from('exercise_unlocks')
        .insert({
          user_id: authData.user.id,
          exercise_id: exerciseId,
          unlocked_by: "registration"
        });

      if (unlockError) {
        console.error(`Failed to unlock exercise ${exerciseId}:`, unlockError);
        // Continue with other unlocks even if one fails
      }
    }

    res.status(201).json({
      message: "Registration successful! Please check your email to confirm your account.",
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.display_name,
        isAgeVerified: newUser.is_age_verified,
        isPremium: false,
      },
      requiresEmailConfirmation: true
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: "Registration failed", 
      error: error.message
    });
  }
} 