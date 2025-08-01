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

    // Get user profile from database using Supabase
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError || !userProfile) {
      console.log('User profile not found, creating new OAuth user:', user.id);
      
      // Create new OAuth user in database
      const displayName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         'User';
      
      const now = new Date();
      const { data: newUserProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          display_name: displayName,
          is_age_verified: true, // OAuth users assumed verified
          marketing_consent: false,
          accepted_terms_at: now.toISOString(),
          accepted_privacy_at: now.toISOString(),
          is_email_verified: true, // OAuth providers verify emails
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Failed to create user profile:', createError);
        return res.status(500).json({ error: "Failed to create user profile" });
      }
      
      console.log('✅ New OAuth user created:', newUserProfile.id);
      
      // Use the newly created profile
      const userProfile = newUserProfile;
      
      // Return user profile
      return res.json({
        id: userProfile.id,
        email: userProfile.email,
        displayName: userProfile.display_name,
        isPremium: userProfile.is_premium || false,
        createdAt: userProfile.created_at,
        isAgeVerified: userProfile.is_age_verified,
        marketingConsent: userProfile.marketing_consent,
        acceptedTermsAt: userProfile.accepted_terms_at,
        acceptedPrivacyAt: userProfile.accepted_privacy_at,
      });
    }

    // Return user profile
    res.json({
      id: userProfile.id,
      email: userProfile.email,
      displayName: userProfile.display_name,
      isPremium: userProfile.is_premium || false,
      createdAt: userProfile.created_at,
      isAgeVerified: userProfile.is_age_verified,
      marketingConsent: userProfile.marketing_consent,
      acceptedTermsAt: userProfile.accepted_terms_at,
      acceptedPrivacyAt: userProfile.accepted_privacy_at,
    });

  } catch (error) {
    console.error('User Profile API Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Internal server error', 
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    });
  }
}