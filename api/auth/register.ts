import type { VercelRequest, VercelResponse } from '@vercel/node';
import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, insertUserSchema } from "../../shared/schema.js";

// Initialize database
const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

// Initialize Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { email, password, displayName, isAgeVerified, marketingConsent } = req.body;

    // Basic validation
    if (!email || !password || !displayName || typeof isAgeVerified !== 'boolean') {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
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
    }).returning();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        isAgeVerified: newUser.isAgeVerified,
        hashedPassword: null // Don't expose password info
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
} 