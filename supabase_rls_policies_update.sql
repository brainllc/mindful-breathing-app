-- UPDATE EXISTING RLS POLICIES FOR PERFORMANCE
-- This script drops existing policies and recreates them with performance optimizations
-- Run this INSTEAD of the original supabase_rls_policies.sql

-- ============================================
-- DROP EXISTING POLICIES FIRST
-- ============================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;

-- Exercise sessions policies
DROP POLICY IF EXISTS "Users can view own exercise sessions" ON public.exercise_sessions;
DROP POLICY IF EXISTS "Users can create own exercise sessions" ON public.exercise_sessions;
DROP POLICY IF EXISTS "Users can update own exercise sessions" ON public.exercise_sessions;
DROP POLICY IF EXISTS "Users can delete own exercise sessions" ON public.exercise_sessions;

-- Exercise unlocks policies
DROP POLICY IF EXISTS "Users can view own exercise unlocks" ON public.exercise_unlocks;
DROP POLICY IF EXISTS "Users can create own exercise unlocks" ON public.exercise_unlocks;
DROP POLICY IF EXISTS "Users can delete own exercise unlocks" ON public.exercise_unlocks;

-- User stats policies
DROP POLICY IF EXISTS "Users can view own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can create own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.user_stats;
DROP POLICY IF EXISTS "Users can delete own stats" ON public.user_stats;

-- ============================================
-- CREATE PERFORMANCE-OPTIMIZED POLICIES
-- ============================================

-- USERS TABLE - Performance optimized policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING ((select auth.uid()::text) = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING ((select auth.uid()::text) = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK ((select auth.uid()::text) = id);

CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE USING ((select auth.uid()::text) = id);

-- EXERCISE_SESSIONS TABLE - Performance optimized policies
CREATE POLICY "Users can view own exercise sessions" ON public.exercise_sessions
  FOR SELECT USING ((select auth.uid()::text) = user_id);

CREATE POLICY "Users can create own exercise sessions" ON public.exercise_sessions
  FOR INSERT WITH CHECK ((select auth.uid()::text) = user_id);

CREATE POLICY "Users can update own exercise sessions" ON public.exercise_sessions
  FOR UPDATE USING ((select auth.uid()::text) = user_id);

CREATE POLICY "Users can delete own exercise sessions" ON public.exercise_sessions
  FOR DELETE USING ((select auth.uid()::text) = user_id);

-- EXERCISE_UNLOCKS TABLE - Performance optimized policies
CREATE POLICY "Users can view own exercise unlocks" ON public.exercise_unlocks
  FOR SELECT USING ((select auth.uid()::text) = user_id);

CREATE POLICY "Users can create own exercise unlocks" ON public.exercise_unlocks
  FOR INSERT WITH CHECK ((select auth.uid()::text) = user_id);

CREATE POLICY "Users can delete own exercise unlocks" ON public.exercise_unlocks
  FOR DELETE USING ((select auth.uid()::text) = user_id);

-- USER_STATS TABLE - Performance optimized policies
CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING ((select auth.uid()::text) = user_id);

CREATE POLICY "Users can create own stats" ON public.user_stats
  FOR INSERT WITH CHECK ((select auth.uid()::text) = user_id);

CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING ((select auth.uid()::text) = user_id);

CREATE POLICY "Users can delete own stats" ON public.user_stats
  FOR DELETE USING ((select auth.uid()::text) = user_id);

-- ============================================
-- PERFORMANCE NOTES
-- ============================================
-- These optimized policies use (select auth.uid()) instead of auth.uid()
-- This prevents the function from being re-evaluated for each row
-- Resulting in significantly better query performance at scale 