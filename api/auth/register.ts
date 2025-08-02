import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, userStats, exerciseUnlocks } from "../../shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize database connection inside handler
  const client = postgres(process.env.DATABASE_URL!, {
    ssl: 'require'
  });
  const db = drizzle(client);

  // Initialize Supabase
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
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
    const [newUser] = await db.insert(users).values({
      id: authData.user.id,
      email: email,
      displayName: displayName,
      isAgeVerified: isAgeVerified,
      marketingConsent: marketingConsent || false,
      acceptedTermsAt: now,
      acceptedPrivacyAt: now,
      marketingConsentAt: marketingConsent ? now : null,
      isEmailVerified: false,
    }).returning();

    // Initialize user stats
    await db.insert(userStats).values({
      userId: authData.user.id,
    });

    // Unlock exercises for registered users (premium exercises)
    const registrationUnlocks = [
      "wim-hof",
      "nadi-shodhana", 
      "kapalbhati",
      "lions-breath"
    ];

    for (const exerciseId of registrationUnlocks) {
      await db.insert(exerciseUnlocks).values({
        userId: authData.user.id,
        exerciseId,
        unlockedBy: "registration"
      });
    }

    // Sign in the user to get a session
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError) {
      console.error('Auto sign-in error:', sessionError);
      // Still return success even if auto sign-in fails
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        isAgeVerified: newUser.isAgeVerified,
        isPremium: false,
      },
      session: sessionData?.session || authData.session
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: "Registration failed", 
      error: error.message
    });
  } finally {
    // Close database connection
    await client.end();
  }
} 