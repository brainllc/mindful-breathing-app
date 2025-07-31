import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { db, supabase } from "./db";
import { createClient } from "@supabase/supabase-js";
import { 
  users, 
  exerciseSessions, 
  exerciseUnlocks, 
  userStats, 
  emailCaptureLeads,
  insertUserSchema,
  insertEmailLeadSchema 
} from "../shared/schema.js";
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

export function registerRoutes(app: Express): Express {
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

  // Forgot password
  app.post("/api/auth/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Check if user exists in our database and if they're an OAuth user
      const [existingUser] = await db.select().from(users).where(eq(users.email, email));
      
      if (existingUser) {        
        // Check if user is OAuth (no hashed password means they use OAuth)
        if (!existingUser.hashedPassword) {
          return res.json({
            isOAuthUser: true,
            message: "This account uses Google Sign-In. Please use 'Continue with Google' on the login page instead of resetting your password."
          });
        }
      }
      
      // Always attempt to send reset email via Supabase (for both local DB users and Supabase-only users)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'https://breathwork.fyi'}/auth/reset-password`,
      });

      if (error) {
        // Handle rate limiting specifically
        if (error.message?.includes("rate limit") || error.message?.includes("too many")) {
          return res.status(429).json({ 
            error: "Too many password reset requests. Please wait a few minutes before trying again.",
            rateLimited: true
          });
        }
        console.error("Password reset error:", error.message);
      }

      // Always return success message for security (to prevent email enumeration)
      res.json({
        message: "If an account with that email exists, we've sent password reset instructions."
      });
    } catch (error) {
      next(error);
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res, next) => {
    try {
      const { password, accessToken, refreshToken } = req.body;
      
      if (!password || !accessToken || !refreshToken) {
        return res.status(400).json({ error: "Password and tokens are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      // Create a temporary Supabase client with the reset tokens
      const tempSupabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!
      );

      // Set the session with the reset tokens
      const { error: sessionError } = await tempSupabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        return res.status(400).json({ error: "Invalid or expired reset link" });
      }

      // Update the user's password
      const { error: updateError } = await tempSupabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }

      res.json({ message: "Password reset successfully" });
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
      let [userProfile] = await db.select().from(users).where(eq(users.id, data.user.id));

      // If user doesn't exist in our database, create them automatically
      if (!userProfile) {
        // Extract name from Supabase user metadata
        const displayName = data.user.user_metadata?.full_name || 
                           data.user.user_metadata?.name || 
                           data.user.email?.split('@')[0] || 
                           "User";
        
        const newUser = {
          id: data.user.id,
          email: data.user.email!,
          displayName: displayName,
          isAgeVerified: true, // Assume verified for existing auth users
          acceptedTermsAt: new Date(), // Auto-accept for existing auth users
          acceptedPrivacyAt: new Date(), // Auto-accept for existing auth users
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        try {
          [userProfile] = await db.insert(users).values(newUser).returning();
        } catch (dbError) {
          console.error("Failed to create user record:", dbError);
          return res.status(500).json({ error: "Failed to create user profile" });
        }
      }

      // Don't send sensitive data
      const { hashedPassword, ...safeProfile } = userProfile;
      
      res.json({
        session: data.session,
        user: safeProfile,
      });
    } catch (error) {
      console.error("Login error:", error);
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

  // Change password
  app.post("/api/auth/change-password", authenticateUser, async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters long" });
      }

      // Check if user is OAuth user (they won't have a password to verify)
      const isOAuthUser = req.user.app_metadata?.provider && req.user.app_metadata.provider !== 'email';
      
      if (isOAuthUser) {
        return res.status(400).json({ 
          error: `This account is authenticated through ${req.user.app_metadata.provider}. Please manage your password through your ${req.user.app_metadata.provider} account settings.` 
        });
      }

      // First verify the current password by attempting to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: req.user.email,
        password: currentPassword,
      });

      if (verifyError) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Change the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ message: "Password changed successfully" });
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

  // Update user profile
  app.put("/api/user/profile", authenticateUser, async (req, res, next) => {
    try {
      if (!req.user) throw new Error("User not authenticated");
      
      const { displayName, email } = req.body;
      
      // Validate input
      if (!displayName || displayName.trim().length === 0) {
        return res.status(400).json({ error: "Display name is required" });
      }
      
      if (displayName.length > 50) {
        return res.status(400).json({ error: "Display name must be 50 characters or less" });
      }

      // Update user profile in database
      const [updatedUser] = await db.update(users)
        .set({ 
          displayName: displayName.trim(),
          updatedAt: new Date()
        })
        .where(eq(users.id, req.user.id))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Don't send sensitive data
      const { hashedPassword, ...safeProfile } = updatedUser;
      res.json({
        message: "Profile updated successfully",
        user: safeProfile
      });
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
        
        // Get user info for joinedDate
        const [userInfo] = await db.select().from(users).where(eq(users.id, req.user.id));
        
        return res.json({
          ...newStats[0],
          joinedDate: userInfo?.createdAt?.toISOString() || new Date().toISOString(),
          lastSessionDate: null,
        });
      }

      // Get user info for joinedDate
      const [userInfo] = await db.select().from(users).where(eq(users.id, req.user.id));

      res.json({
        ...stats,
        joinedDate: userInfo?.createdAt?.toISOString() || new Date().toISOString(),
        lastSessionDate: stats.lastSessionAt?.toISOString() || null,
      });
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

  // Simple test endpoint for debugging
  app.get("/api/debug", (req, res) => {
    res.json({ 
      status: "API is working",
      timestamp: new Date().toISOString(),
      env: {
        hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    });
  });

  // For Vercel serverless, just return the app
  // For local development, the HTTP server will be created separately
  return app;
}