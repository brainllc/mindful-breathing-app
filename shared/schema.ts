import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Extended users table with full profile and compliance support
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  hashedPassword: text("hashed_password"), // For direct auth (optional with Supabase)
  isEmailVerified: boolean("is_email_verified").default(false),
  
  // Privacy and compliance
  acceptedTermsAt: timestamp("accepted_terms_at").notNull(),
  acceptedPrivacyAt: timestamp("accepted_privacy_at").notNull(),
  marketingConsent: boolean("marketing_consent").default(false),
  marketingConsentAt: timestamp("marketing_consent_at"),
  
  // User preferences
  preferredTheme: text("preferred_theme").default("dark"),
  preferredLanguage: text("preferred_language").default("en"),
  
  // Account status
  isActive: boolean("is_active").default(true),
  isPremium: boolean("is_premium").default(false),
  
  // Tracking
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at"),
  
  // Legacy fields (keep for compatibility)
  currentExercise: text("current_exercise"),
  completedRounds: integer("completed_rounds").default(0),
});

// Exercise sessions for tracking user progress
export const exerciseSessions = pgTable("exercise_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  exerciseId: text("exercise_id").notNull(),
  rounds: integer("rounds").notNull(),
  roundsCompleted: integer("rounds_completed").default(0),
  durationSeconds: integer("duration_seconds"),
  completed: boolean("completed").default(false),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  moodBefore: text("mood_before"),
  moodAfter: text("mood_after"),
  notes: text("notes"),
});

// Exercise unlocks for freemium model
export const exerciseUnlocks = pgTable("exercise_unlocks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  exerciseId: text("exercise_id").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  unlockedBy: text("unlocked_by").notNull(), // 'registration', 'premium', 'trial', etc.
});

// User statistics and achievements
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  totalSessions: integer("total_sessions").default(0),
  totalMinutes: integer("total_minutes").default(0),
  totalRounds: integer("total_rounds").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  favoriteExercise: text("favorite_exercise"),
  lastSessionAt: timestamp("last_session_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Email capture for lead magnet
export const emailCaptureLeads = pgTable("email_capture_leads", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  source: text("source").notNull(), // 'stress-guide', 'newsletter', etc.
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  consentGiven: boolean("consent_given").default(true),
  capturedAt: timestamp("captured_at").defaultNow().notNull(),
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
});

// Validation schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  }, "You must be 18 or older"),
}).pick({
  email: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  marketingConsent: true,
});

export const insertExerciseSessionSchema = createInsertSchema(exerciseSessions).pick({
  userId: true,
  exerciseId: true,
  rounds: true,
  moodBefore: true,
});

export const insertEmailLeadSchema = createInsertSchema(emailCaptureLeads, {
  email: z.string().email(),
  source: z.string().min(1),
}).pick({
  email: true,
  source: true,
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertExerciseSession = z.infer<typeof insertExerciseSessionSchema>;
export type InsertEmailLead = z.infer<typeof insertEmailLeadSchema>;
export type User = typeof users.$inferSelect;
export type ExerciseSession = typeof exerciseSessions.$inferSelect;
export type ExerciseUnlock = typeof exerciseUnlocks.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type EmailLead = typeof emailCaptureLeads.$inferSelect;

// Legacy exports for compatibility
export const sessions = exerciseSessions;
export const insertSessionSchema = insertExerciseSessionSchema;
export type InsertSession = InsertExerciseSession;
export type Session = ExerciseSession;
