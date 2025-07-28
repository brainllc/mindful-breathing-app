import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db, supabase } from "./db";
import { 
  users, 
  exerciseSessions, 
  exerciseUnlocks, 
  userStats, 
  emailCaptureLeads,
  insertUserSchema,
  insertEmailLeadSchema 
} from "@shared/schema";
import { eq, desc, count, sum, and } from "drizzle-orm";
import fs from "fs";
import path from "path";
// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any; // Supabase User type
    }
  }
}

// Middleware to verify authentication
const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header is missing" });
    }
    
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Bearer token is missing" });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Free exercises that don't require registration
const FREE_EXERCISES = [
  "box-breathing",
  "4-7-8", 
  "diaphragmatic",
  "sama-vritti",
  "pursed-lip",
  "2-to-1",
  "coherent-breathing"
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Sitemap route handler
  app.get("/sitemap.xml", (req, res) => {
    const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
    const readStream = fs.createReadStream(sitemapPath);

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Content-Disposition", "inline; filename=sitemap.xml");

    readStream.pipe(res);

    readStream.on("error", (err) => {
      console.error("Error reading sitemap:", err);
      res.status(500).send("Error reading sitemap");
    });
  });

  // ============================================================================
  // AUTHENTICATION ROUTES
  // ============================================================================

  // Enhanced user registration with all required fields
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationResult.error.issues 
        });
      }

      const { email, displayName, isAgeVerified, marketingConsent } = validationResult.data;
      const { password } = req.body;

      if (!password || password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password 
      });

      if (authError) {
        return res.status(400).json({ error: authError.message });
      }

      if (!authData.user) {
        return res.status(400).json({ error: "Failed to create user" });
      }

      // Create user in our database with extended profile
      const newUser = await db.insert(users).values({
        id: authData.user.id,
        email,
        displayName,
        isAgeVerified,
        acceptedTermsAt: new Date(),
        acceptedPrivacyAt: new Date(),
        marketingConsent,
        marketingConsentAt: marketingConsent ? new Date() : null,
        isEmailVerified: false,
      }).returning();

      // Initialize user stats
      await db.insert(userStats).values({
        userId: authData.user.id,
      });

      // Unlock exercises for registered users (half of premium exercises)
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

      res.status(201).json({
        message: "User registered successfully",
        user: newUser[0],
        session: authData.session
      });
    } catch (error) {
      next(error);
    }
  });

  // Enhanced login
  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ error: error.message });
      }

      // Update last login time
      await db.update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, data.user.id));

      // Get user profile
      const [userProfile] = await db.select().from(users).where(eq(users.id, data.user.id));

      res.json({
        message: "Login successful",
        user: userProfile,
        session: data.session
      });
    } catch (error) {
      next(error);
    }
  });

  // Logout
  app.post("/api/auth/logout", authenticateUser, async (req, res, next) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      res.json({ message: "Logout successful" });
    } catch (error) {
      next(error);
    }
  });

  // OAuth callback handler
  app.post("/api/auth/oauth-callback", async (req, res, next) => {
    try {
      const { provider, user } = req.body;
      
      if (!user || !user.email) {
        return res.status(400).json({ error: "Invalid user data from OAuth provider" });
      }

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, user.email));
      
      if (existingUser.length > 0) {
        // User exists, update last login
        await db.update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, existingUser[0].id));
          
        return res.json({
          message: "Login successful",
          user: existingUser[0]
        });
      }

      // New user - create profile
      // Extract display name from OAuth user data
      const displayName = user.user_metadata?.full_name || user.email.split('@')[0] || 'User';

      // Create user in our database
      const newUser = await db.insert(users).values({
        id: user.id,
        email: user.email,
        displayName,
        isAgeVerified: true, // OAuth users are assumed to be verified adults through their provider
        acceptedTermsAt: new Date(),
        acceptedPrivacyAt: new Date(),
        marketingConsent: req.body.marketingConsent === 'true',
        marketingConsentAt: req.body.marketingConsent === 'true' ? new Date() : null,
        isEmailVerified: true, // OAuth providers verify emails
      }).returning();

      // Initialize user stats
      await db.insert(userStats).values({
        userId: user.id,
      });

      // Unlock exercises for OAuth users (same as registration)
      const registrationUnlocks = [
        "wim-hof",
        "nadi-shodhana", 
        "kapalbhati",
        "lions-breath"
      ];

      for (const exerciseId of registrationUnlocks) {
        await db.insert(exerciseUnlocks).values({
          userId: user.id,
          exerciseId,
          unlockedBy: "registration"
        });
      }

      res.status(201).json({
        message: "OAuth registration successful",
        user: newUser[0]
      });
    } catch (error) {
      next(error);
    }
  });

  // ============================================================================
  // USER ROUTES
  // ============================================================================

  // Get current user profile
  app.get("/api/user/profile", authenticateUser, async (req, res, next) => {
    try {
      if (!req.user) throw new Error("User not authenticated");
      const [userProfile] = await db.select().from(users).where(eq(users.id, req.user.id));
      
      if (!userProfile) {
        return res.status(404).json({ error: "User profile not found" });
      }

      // Don't send sensitive data
      const { hashedPassword, ...safeProfile } = userProfile;
      res.json(safeProfile);
    } catch (error) {
      next(error);
    }
  });

  // Get user statistics
  app.get("/api/user/stats", authenticateUser, async (req, res, next) => {
    try {
      const [stats] = await db.select().from(userStats).where(eq(userStats.userId, req.user.id));
      
      if (!stats) {
        // Initialize stats if they don't exist
        const newStats = await db.insert(userStats).values({
          userId: req.user.id,
        }).returning();
        return res.json(newStats[0]);
      }

      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // ============================================================================
  // EXERCISE ROUTES
  // ============================================================================

  // Get user's unlocked exercises
  app.get("/api/exercises/unlocked", authenticateUser, async (req, res, next) => {
    try {
      const unlocks = await db.select()
        .from(exerciseUnlocks)
        .where(eq(exerciseUnlocks.userId, req.user.id));
      
      const unlockedExercises = unlocks.map(unlock => unlock.exerciseId);
      const allUnlocked = [...FREE_EXERCISES, ...unlockedExercises];
      
      res.json({ unlockedExercises: allUnlocked });
    } catch (error) {
      next(error);
    }
  });

  // Check if exercise is unlocked for user
  app.get("/api/exercises/:exerciseId/unlock-status", async (req, res, next) => {
    try {
      const { exerciseId } = req.params;
      
      // Free exercises are always unlocked
      if (FREE_EXERCISES.includes(exerciseId)) {
        return res.json({ isUnlocked: true, reason: "free" });
      }
      
      // Check if user is authenticated
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.json({ isUnlocked: false, reason: "registration_required" });
      }
      
      const token = authHeader.split(" ")[1];
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return res.json({ isUnlocked: false, reason: "registration_required" });
      }
      
      // Check if user has unlocked this exercise
      const [unlock] = await db.select()
        .from(exerciseUnlocks)
        .where(and(
          eq(exerciseUnlocks.userId, user.id),
          eq(exerciseUnlocks.exerciseId, exerciseId)
        ));
      
      res.json({ 
        isUnlocked: !!unlock, 
        reason: unlock ? unlock.unlockedBy : "premium_required" 
      });
    } catch (error) {
      next(error);
    }
  });

  // Start exercise session
  app.post("/api/exercises/:exerciseId/start", authenticateUser, async (req, res, next) => {
    try {
      const { exerciseId } = req.params;
      const { rounds, moodBefore } = req.body;
      
      const session = await db.insert(exerciseSessions).values({
        userId: req.user.id,
        exerciseId,
        rounds: rounds || 5,
        moodBefore
      }).returning();
      
      res.json(session[0]);
    } catch (error) {
      next(error);
    }
  });

  // Complete exercise session
  app.post("/api/exercises/sessions/:sessionId/complete", authenticateUser, async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const { roundsCompleted, durationSeconds, moodAfter, notes } = req.body;
      
      const [session] = await db.update(exerciseSessions)
        .set({
          roundsCompleted,
          durationSeconds,
          moodAfter,
          notes,
          completed: true,
          completedAt: new Date()
        })
        .where(and(
          eq(exerciseSessions.id, parseInt(sessionId)),
          eq(exerciseSessions.userId, req.user.id)
        ))
        .returning();
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      // Update user stats with separate queries
      if (!req.user) throw new Error("User not authenticated");
      
      const [sessionCount] = await db.select({ count: count() })
        .from(exerciseSessions)
        .where(eq(exerciseSessions.userId, req.user.id));
      
      const [roundsTotal] = await db.select({ sum: sum(exerciseSessions.roundsCompleted) })
        .from(exerciseSessions)
        .where(eq(exerciseSessions.userId, req.user.id));
      
      const [minutesTotal] = await db.select({ sum: sum(exerciseSessions.durationSeconds) })
        .from(exerciseSessions)
        .where(eq(exerciseSessions.userId, req.user.id));
      
              await db.update(userStats)
        .set({
          totalSessions: sessionCount.count,
          totalRounds: Number(roundsTotal.sum) || 0,
          totalMinutes: Math.floor(Number(minutesTotal.sum) / 60) || 0,
          lastSessionAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(userStats.userId, req.user.id));
      
      res.json(session);
    } catch (error) {
      next(error);
    }
  });

  // Get user's exercise history
  app.get("/api/exercises/history", authenticateUser, async (req, res, next) => {
    try {
      const history = await db.select()
        .from(exerciseSessions)
        .where(eq(exerciseSessions.userId, req.user.id))
        .orderBy(desc(exerciseSessions.startedAt))
        .limit(50);
      
      res.json(history);
    } catch (error) {
      next(error);
    }
  });

  // ============================================================================
  // LEAD MAGNET ROUTES
  // ============================================================================

  // Email capture for stress guide
  app.post("/api/lead-magnet/capture", async (req, res, next) => {
    try {
      const validationResult = insertEmailLeadSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid email data", 
          details: validationResult.error.issues 
        });
      }

      const { email, source, utmSource, utmMedium, utmCampaign } = validationResult.data;
      
      // Check if email already exists for this source
      const [existingLead] = await db.select()
        .from(emailCaptureLeads)
        .where(and(
          eq(emailCaptureLeads.email, email),
          eq(emailCaptureLeads.source, source)
        ));
      
      if (existingLead) {
        return res.json({ 
          message: "Email already captured", 
          alreadyExists: true 
        });
      }
      
      // Capture email with metadata
      const lead = await db.insert(emailCaptureLeads).values({
        email,
        source,
        utmSource,
        utmMedium,
        utmCampaign,
        // Removed IP address and user agent tracking for privacy compliance
      }).returning();
      
      res.json({ 
        message: "Email captured successfully", 
        leadId: lead[0].id,
        alreadyExists: false
      });
    } catch (error) {
      next(error);
    }
  });

  // ============================================================================
  // ADMIN ROUTES (for future dashboard)
  // ============================================================================

  // Get lead magnet statistics
  app.get("/api/admin/leads/stats", async (req, res, next) => {
    try {
      // This would normally be protected with admin authentication
      const stats = await db.select({
        source: emailCaptureLeads.source,
        count: count()
      })
      .from(emailCaptureLeads)
      .groupBy(emailCaptureLeads.source);
      
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}