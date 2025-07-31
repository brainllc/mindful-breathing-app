import type { VercelRequest, VercelResponse } from '@vercel/node';
import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

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
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const { provider, user } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    if (!user || !user.id || !user.email) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    // Check if user already exists in our database
    const existingUsers = await db.select().from(users).where(eq(users.id, user.id));
    const existingUser = existingUsers[0];

    if (existingUser) {
      // User exists, return login success
      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          displayName: existingUser.displayName,
          isAgeVerified: existingUser.isAgeVerified,
          isPremium: false,
        }
      });
    }

    // New user - create in our database
    const now = new Date();
    const displayName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0] || 
                       'User';

    const [newUser] = await db.insert(users).values({
      id: user.id,
      email: user.email,
      displayName: displayName,
      isAgeVerified: true, // Assume OAuth users are age verified
      marketingConsent: false,
      acceptedTermsAt: now,
      acceptedPrivacyAt: now,
      marketingConsentAt: null,
    }).returning();

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        isAgeVerified: newUser.isAgeVerified,
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