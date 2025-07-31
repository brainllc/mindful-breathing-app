import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, userStats } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

// Initialize database connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Get user statistics
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, user.id));
    
    if (!stats) {
      // Initialize stats if they don't exist
      const newStats = await db.insert(userStats).values({
        userId: user.id,
      }).returning();
      
      // Get user info for joinedDate
      const [userInfo] = await db.select().from(users).where(eq(users.id, user.id));
      
      return res.json({
        ...newStats[0],
        joinedDate: userInfo?.createdAt?.toISOString() || new Date().toISOString(),
        lastSessionDate: null,
      });
    }

    // Get user info for joinedDate
    const [userInfo] = await db.select().from(users).where(eq(users.id, user.id));

    res.json({
      ...stats,
      joinedDate: userInfo?.createdAt?.toISOString() || new Date().toISOString(),
      lastSessionDate: stats.lastSessionAt?.toISOString() || null,
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 