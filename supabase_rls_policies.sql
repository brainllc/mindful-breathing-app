-- Enable Row Level Security (RLS) for all tables
-- This prevents unauthorized access to user data

-- ============================================
-- USERS TABLE - Only users can see their own data
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile (performance optimized)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING ((select auth.uid()::text) = id);

-- Users can update their own profile (performance optimized)
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING ((select auth.uid()::text) = id);

-- Users can insert their own profile (performance optimized)
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK ((select auth.uid()::text) = id);

-- Users can delete their own profile (performance optimized)
CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE USING ((select auth.uid()::text) = id);

-- ============================================
-- EXERCISE_SESSIONS TABLE - Only users can see their own sessions
-- ============================================
ALTER TABLE public.exercise_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own exercise sessions (performance optimized)
CREATE POLICY "Users can view own exercise sessions" ON public.exercise_sessions
  FOR SELECT USING ((select auth.uid()::text) = user_id);

-- Users can create their own exercise sessions (performance optimized)
CREATE POLICY "Users can create own exercise sessions" ON public.exercise_sessions
  FOR INSERT WITH CHECK ((select auth.uid()::text) = user_id);

-- Users can update their own exercise sessions (performance optimized)
CREATE POLICY "Users can update own exercise sessions" ON public.exercise_sessions
  FOR UPDATE USING ((select auth.uid()::text) = user_id);

-- Users can delete their own exercise sessions (performance optimized)
CREATE POLICY "Users can delete own exercise sessions" ON public.exercise_sessions
  FOR DELETE USING ((select auth.uid()::text) = user_id);

-- ============================================
-- EXERCISE_UNLOCKS TABLE - Only users can see their own unlocks
-- ============================================
ALTER TABLE public.exercise_unlocks ENABLE ROW LEVEL SECURITY;

-- Users can view their own exercise unlocks (performance optimized)
CREATE POLICY "Users can view own exercise unlocks" ON public.exercise_unlocks
  FOR SELECT USING ((select auth.uid()::text) = user_id);

-- Users can create their own exercise unlocks (performance optimized)
CREATE POLICY "Users can create own exercise unlocks" ON public.exercise_unlocks
  FOR INSERT WITH CHECK ((select auth.uid()::text) = user_id);

-- Users can delete their own exercise unlocks (performance optimized)
CREATE POLICY "Users can delete own exercise unlocks" ON public.exercise_unlocks
  FOR DELETE USING ((select auth.uid()::text) = user_id);

-- ============================================
-- USER_STATS TABLE - Only users can see their own stats
-- ============================================
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Users can view their own stats (performance optimized)
CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING ((select auth.uid()::text) = user_id);

-- Users can create their own stats (performance optimized)
CREATE POLICY "Users can create own stats" ON public.user_stats
  FOR INSERT WITH CHECK ((select auth.uid()::text) = user_id);

-- Users can update their own stats (performance optimized)
CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING ((select auth.uid()::text) = user_id);

-- Users can delete their own stats (performance optimized)
CREATE POLICY "Users can delete own stats" ON public.user_stats
  FOR DELETE USING ((select auth.uid()::text) = user_id);

-- ============================================
-- EMAIL_CAPTURE_LEADS TABLE - Special case for lead generation
-- ============================================
ALTER TABLE public.email_capture_leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert leads (for lead capture forms)
CREATE POLICY "Anonymous users can submit lead capture" ON public.email_capture_leads
  FOR INSERT WITH CHECK (true);

-- Only authenticated admins/service accounts can view leads
-- Note: You'll need to create a service role or admin role for this
-- For now, no SELECT policy - you'll need to query this via service role key

-- Prevent public access to viewing leads
-- (No SELECT policy means no one can read unless using service role key)

-- ============================================
-- OPTIONAL: Create indexes for better performance
-- ============================================

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_user_id ON public.exercise_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_unlocks_user_id ON public.exercise_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);

-- Index for faster session queries
CREATE INDEX IF NOT EXISTS idx_exercise_sessions_created_at ON public.exercise_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_email_capture_leads_created_at ON public.email_capture_leads(captured_at);

-- ============================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================

-- Grant authenticated users access to their own data
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_unlocks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_stats TO authenticated;

-- Grant anonymous users ability to submit leads
GRANT INSERT ON public.email_capture_leads TO anon;

-- ============================================
-- SECURITY NOTES
-- ============================================

-- 1. These policies ensure users can only access their own data
-- 2. auth.uid() returns the authenticated user's ID from Supabase Auth
-- 3. Anonymous users can only submit email leads, not read them
-- 4. To access email_capture_leads for admin purposes, use the service role key
-- 5. All tables now have RLS enabled, preventing unauthorized access

-- To apply these policies, run this SQL in your Supabase SQL editor 