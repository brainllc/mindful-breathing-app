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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { provider, user } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    if (!user || !user.id || !user.email) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    console.log('OAuth callback - User data:', { id: user.id, email: user.email, provider });

    // Check if user already exists in our database
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Database select error:', selectError);
      return res.status(500).json({ 
        message: "Database error. Please try again.",
        error: selectError.message 
      });
    }

    if (existingUser) {
      console.log('OAuth callback - Existing user found');
      // User exists, return login success
      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          displayName: existingUser.display_name,
          isAgeVerified: existingUser.is_age_verified,
          isPremium: false,
        }
      });
    }

    console.log('OAuth callback - Creating new user');
    // New user - create in our database
    const now = new Date();
    const displayName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0] || 
                       'User';

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        display_name: displayName,
        is_age_verified: true, // Assume OAuth users are age verified
        marketing_consent: false,
        accepted_terms_at: now.toISOString(),
        accepted_privacy_at: now.toISOString(),
        marketing_consent_at: null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return res.status(500).json({ 
        message: "Failed to create user account. Please try again.",
        error: insertError.message 
      });
    }

    console.log('OAuth callback - New user created:', newUser.id);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.display_name,
        isAgeVerified: newUser.is_age_verified,
        isPremium: false,
      }
    });

  } catch (error: any) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ 
      message: "Something went wrong. Please try again.",
      error: error.message 
    });
  }
} 