import type { VercelRequest, VercelResponse } from '@vercel/node';
import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with service role for database operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

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
    const { provider, user } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    if (!user || !user.id || !user.email) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    console.log('OAuth callback - User data:', { id: user.id, email: user.email, provider });

    // Check if user already exists in our database using Supabase
    const { data: existingUsers, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .limit(1);

    if (selectError) {
      console.error('Database select error:', selectError);
      return res.status(500).json({ 
        message: "Database error. Please try again.",
        error: selectError.message 
      });
    }

    const existingUser = existingUsers?.[0];

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
    // New user - create in our database using Supabase (only essential columns)
    const displayName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0] || 
                       'User';

    const { data: newUsers, error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        display_name: displayName,
        is_age_verified: true, // Assume OAuth users are age verified
        marketing_consent: false,
        // Only include essential columns that definitely exist
      })
      .select()
      .limit(1);

    if (insertError) {
      console.error('Database insert error:', insertError);
      return res.status(500).json({ 
        message: "Failed to create user account. Please try again.",
        error: insertError.message 
      });
    }

    const newUser = newUsers?.[0];
    console.log('OAuth callback - New user created:', newUser?.id);

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