import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Activity, Target, Star, Trophy, Flame, Zap, Clock, ChevronRight, Award, BarChart3, Play, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Link } from "wouter";
import { exercises } from "@/lib/exercises";

interface UserStats {
  totalSessions: number;
  totalRounds: number;
  totalMinutes: number;
  lastSessionAt: string | null;
  currentStreak: number;
  longestStreak: number;
}

interface ExerciseSession {
  id: number;
  exerciseId: string;
  rounds: number;
  roundsCompleted: number;
  durationSeconds: number;
  startedAt: string;
  completedAt: string | null;
  completed: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  
  // Always call hooks in the same order - no early returns!
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentSessions, setRecentSessions] = useState<ExerciseSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievementsExpanded, setAchievementsExpanded] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      const storedSession = localStorage.getItem('supabase.auth.token');
      if (!storedSession) return;
      
      const session = JSON.parse(storedSession);
      const headers = {
        'Authorization': `Bearer ${session.access_token}`
      };

      // Fetch user stats and exercise history in parallel
      const [statsResponse, historyResponse] = await Promise.all([
        fetch('/api/user/stats', { headers }),
        fetch('/api/exercises/history', { headers })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('Fetched stats:', statsData);
        setStats(statsData);
      } else {
        console.warn('Failed to fetch user stats:', statsResponse.status);
      }

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        console.log('Fetched history:', historyData);
        // Ensure historyData is an array and filter out invalid sessions
        const validSessions = Array.isArray(historyData) ? historyData.filter(session => 
          session && typeof session === 'object' && session.id
        ) : [];
        setRecentSessions(validSessions);
      } else {
        console.warn('Failed to fetch exercise history:', historyResponse.status);
        setRecentSessions([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh dashboard data every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, fetchDashboardData]);

  // Listen for immediate refresh events from completed exercises
  useEffect(() => {
    if (!user) return;

    const handleExerciseCompleted = () => {
      console.log('🔄 Exercise completed - refreshing dashboard immediately');
      fetchDashboardData();
    };

    // Listen for custom event
    window.addEventListener('exerciseCompleted', handleExerciseCompleted);
    
    return () => {
      window.removeEventListener('exerciseCompleted', handleExerciseCompleted);
    };
  }, [user, fetchDashboardData]);

  // Calculate current streak (consecutive days with sessions) - using useMemo to prevent recalculation
  const currentStreak = useMemo(() => {
    console.log('🔥 STREAK DEBUG: Starting calculation with', recentSessions.length, 'sessions');
    
    // Helper function to format date in local timezone as YYYY-MM-DD
    const formatLocalDate = (date: Date): string => {
      return date.getFullYear() + '-' + 
             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
             String(date.getDate()).padStart(2, '0');
    };
    
    if (recentSessions.length === 0) {
      console.log('🔥 STREAK DEBUG: No sessions, returning 0');
      return 0;
    }
    
    const completedSessions = recentSessions
      .filter(s => s.completed && s.completedAt)
      .sort((a, b) => {
        try {
          return new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime();
        } catch (error) {
          console.warn('Invalid date in streak calculation:', a.completedAt, b.completedAt);
          return 0;
        }
      });
    
    console.log('🔥 STREAK DEBUG: Completed sessions:', completedSessions.length, completedSessions.map(s => ({ completed: s.completed, completedAt: s.completedAt })));
    
    if (completedSessions.length === 0) {
      console.log('🔥 STREAK DEBUG: No completed sessions, returning 0');
      return 0;
    }
    
                    // Group sessions by date to handle multiple sessions per day (use UTC for consistency)
                const sessionsByDate = new Map<string, number>();
                for (const session of completedSessions) {
                  try {
                    const sessionDate = new Date(session.completedAt!);
                    
                    // IMPORTANT: Use UTC dates for consistency since sessions are stored in UTC
                    const year = sessionDate.getUTCFullYear();
                    const month = sessionDate.getUTCMonth() + 1; // getUTCMonth() returns 0-11, so add 1
                    const day = sessionDate.getUTCDate();
                    
                    const dateString = year + '-' + 
                                      String(month).padStart(2, '0') + '-' + 
                                      String(day).padStart(2, '0');
                    
                    console.log('🔥 STREAK DEBUG: Session date conversion (UTC):', session.completedAt, '→', dateString);
                    sessionsByDate.set(dateString, (sessionsByDate.get(dateString) || 0) + 1);
                  } catch (error) {
                    console.warn('Invalid date in session:', session.completedAt);
                    continue;
                  }
                }
                
                // Get unique dates and sort them (newest first)
                const uniqueDates = Array.from(sessionsByDate.keys()).sort().reverse();
                
                console.log('🔥 STREAK DEBUG: Sessions by date:', Object.fromEntries(sessionsByDate));
                console.log('🔥 STREAK DEBUG: Unique dates (sorted newest first):', uniqueDates);
                
                if (uniqueDates.length === 0) {
                  console.log('🔥 STREAK DEBUG: No unique dates, returning 0');
                  return 0;
                }
                
                // Use UTC for today as well to match session date format
                const today = new Date();
                
                // Calculate today's date in UTC to match session dates
                const todayYear = today.getUTCFullYear();
                const todayMonth = today.getUTCMonth() + 1;
                const todayDay = today.getUTCDate();
                const todayString = todayYear + '-' + 
                                   String(todayMonth).padStart(2, '0') + '-' + 
                                   String(todayDay).padStart(2, '0');
                
                console.log('🔥 STREAK DEBUG: Today is:', todayString, '(calculated from UTC)');
    
                    let streak = 0;
                let currentDate = new Date(today);
                
                for (const dateString of uniqueDates) {
                  // Calculate current date string using UTC to match session dates
                  const currentYear = currentDate.getUTCFullYear();
                  const currentMonth = currentDate.getUTCMonth() + 1;
                  const currentDay = currentDate.getUTCDate();
                  const currentDateString = currentYear + '-' + 
                                           String(currentMonth).padStart(2, '0') + '-' + 
                                           String(currentDay).padStart(2, '0');
                  
                  console.log(`🔥 STREAK DEBUG: Checking ${dateString} === ${currentDateString}?`);
                  
                  if (dateString === currentDateString) {
                    streak++;
                    currentDate.setUTCDate(currentDate.getUTCDate() - 1);
                    
                    // Calculate next date for debug output
                    const nextYear = currentDate.getUTCFullYear();
                    const nextMonth = currentDate.getUTCMonth() + 1;
                    const nextDay = currentDate.getUTCDate();
                    const nextDateString = nextYear + '-' + 
                                          String(nextMonth).padStart(2, '0') + '-' + 
                                          String(nextDay).padStart(2, '0');
                    
                    console.log(`🔥 STREAK DEBUG: Match! Streak now ${streak}, next check date: ${nextDateString}`);
                  } else {
                    console.log('🔥 STREAK DEBUG: No match, breaking streak');
                    break;
                  }
                }
    
    console.log('🔥 STREAK DEBUG: Final streak:', streak);
    return streak;
  }, [recentSessions]);

  // Calculate highest streak ever achieved
  const highestStreak = useMemo(() => {
    if (recentSessions.length === 0) {
      return 0;
    }
    
    const completedSessions = recentSessions
      .filter(s => s.completed && s.completedAt)
      .sort((a, b) => {
        try {
          return new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime(); // Sort oldest first for highest streak calculation
        } catch (error) {
          console.warn('Invalid date in highest streak calculation:', a.completedAt, b.completedAt);
          return 0;
        }
      });
    
    if (completedSessions.length === 0) {
      return 0;
    }
    
    // Group sessions by date (use UTC for consistency)
    const sessionsByDate = new Map<string, number>();
    for (const session of completedSessions) {
      try {
        const sessionDate = new Date(session.completedAt!);
        const year = sessionDate.getUTCFullYear();
        const month = sessionDate.getUTCMonth() + 1;
        const day = sessionDate.getUTCDate();
        const dateString = year + '-' + 
                          String(month).padStart(2, '0') + '-' + 
                          String(day).padStart(2, '0');
        sessionsByDate.set(dateString, (sessionsByDate.get(dateString) || 0) + 1);
      } catch (error) {
        console.warn('Invalid date in highest streak session:', session.completedAt);
        continue;
      }
    }
    
    // Get unique dates and sort them (oldest first)
    const uniqueDates = Array.from(sessionsByDate.keys()).sort();
    
    if (uniqueDates.length === 0) {
      return 0;
    }
    
    // Calculate all possible streaks to find the highest one
    let maxStreak = 0;
    let currentStreakInLoop = 0;
    let expectedDate = null;
    
    for (const dateString of uniqueDates) {
      const currentDate = new Date(dateString + 'T00:00:00.000Z');
      
      if (expectedDate === null) {
        // First date - start a streak
        currentStreakInLoop = 1;
        expectedDate = new Date(currentDate);
        expectedDate.setUTCDate(expectedDate.getUTCDate() + 1);
      } else {
        // Check if this date is consecutive to the previous one
        const expectedDateString = expectedDate.getUTCFullYear() + '-' + 
                                  String(expectedDate.getUTCMonth() + 1).padStart(2, '0') + '-' + 
                                  String(expectedDate.getUTCDate()).padStart(2, '0');
        
        if (dateString === expectedDateString) {
          // Consecutive date - extend streak
          currentStreakInLoop++;
          expectedDate.setUTCDate(expectedDate.getUTCDate() + 1);
        } else {
          // Non-consecutive date - save current streak and start new one
          maxStreak = Math.max(maxStreak, currentStreakInLoop);
          currentStreakInLoop = 1;
          expectedDate = new Date(currentDate);
          expectedDate.setUTCDate(expectedDate.getUTCDate() + 1);
        }
      }
    }
    
    // Don't forget to check the last streak
    maxStreak = Math.max(maxStreak, currentStreakInLoop);
    
    return maxStreak;
  }, [recentSessions]);

  // Calculate this week's sessions
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekSessions = recentSessions.filter(session => {
    try {
      return session.completed && session.completedAt && new Date(session.completedAt) > oneWeekAgo;
    } catch (error) {
      return false;
    }
  }).length;

  // Calculate average daily sessions (smarter calculation for new vs established users)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30DaysSessions = recentSessions.filter(session => {
    try {
      return session.completed && session.completedAt && new Date(session.completedAt) > thirtyDaysAgo;
    } catch (error) {
      return false;
    }
  }).length;
  
  // For more meaningful daily average calculation
  const getAvgDailySessions = () => {
    if (last30DaysSessions === 0) return "0.0";
    
    // Find the first session date
    const allCompletedSessions = recentSessions.filter(s => s.completed && s.completedAt);
    if (allCompletedSessions.length === 0) return "0.0";
    
    // Get the earliest session date
    const firstSessionDate = allCompletedSessions.reduce((earliest, session) => {
      try {
        const sessionDate = new Date(session.completedAt!);
        return sessionDate < earliest ? sessionDate : earliest;
      } catch (error) {
        return earliest;
      }
    }, new Date());
    
    // Calculate days since first session (minimum 1 day)
    const today = new Date();
    const daysSinceFirst = Math.max(1, Math.ceil((today.getTime() - firstSessionDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Use the smaller of 30 days or actual days since first session for more accurate average
    const daysToAverage = Math.min(30, daysSinceFirst);
    
    return (last30DaysSessions / daysToAverage).toFixed(1);
  };
  
  const avgDailySessions = getAvgDailySessions();

  // Get most practiced exercises
  const exerciseCount = recentSessions.reduce((acc, session) => {
    if (session.completed && session.exerciseId) {
      acc[session.exerciseId] = (acc[session.exerciseId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedExercises = Object.entries(exerciseCount)
    .filter(([exerciseId]) => exerciseId) // Filter out undefined/null exercise IDs
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get weekly practice data for chart
  const getWeeklyData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        sessions: 0,
        date: date.toISOString().split('T')[0]
      };
    });

    recentSessions.forEach(session => {
      if (session.completed && session.completedAt && session.completedAt !== null) {
        try {      
          const sessionDate = new Date(session.completedAt).toISOString().split('T')[0];
          const dayData = last7Days.find(d => d.date === sessionDate);
          if (dayData) {
            dayData.sessions++;
          }
        } catch (error) {
          console.warn('Invalid date in session:', session.completedAt);
        }
      }
    });

    return last7Days;
  };

  // Calculate achievements (50 total achievements)
  const getAchievements = () => {
    const achievements = [];
    const totalSessions = stats?.totalSessions || 0;
    const totalMinutes = stats?.totalMinutes || 0;
    const totalRounds = stats?.totalRounds || 0;

    // Session Milestones (10 achievements)
    if (totalSessions >= 1) achievements.push({ name: "First Breath", description: "Completed your first session", icon: "🎯" });
    if (totalSessions >= 5) achievements.push({ name: "Getting Started", description: "Completed 5 sessions", icon: "🌱" });
    if (totalSessions >= 10) achievements.push({ name: "Consistent Breather", description: "Completed 10 sessions", icon: "🌟" });
    if (totalSessions >= 25) achievements.push({ name: "Quarter Century", description: "Completed 25 sessions", icon: "💎" });
    if (totalSessions >= 50) achievements.push({ name: "Mindful Master", description: "Completed 50 sessions", icon: "🏆" });
    if (totalSessions >= 100) achievements.push({ name: "Centurion", description: "Completed 100 sessions", icon: "👑" });
    if (totalSessions >= 200) achievements.push({ name: "Breathing Legend", description: "Completed 200 sessions", icon: "🏛️" });
    if (totalSessions >= 365) achievements.push({ name: "Year of Breath", description: "Completed 365 sessions", icon: "📅" });
    if (totalSessions >= 500) achievements.push({ name: "Elite Practitioner", description: "Completed 500 sessions", icon: "🏅" });
    if (totalSessions >= 1000) achievements.push({ name: "Breathing Sage", description: "Completed 1000 sessions", icon: "🧙‍♂️" });

    // Streak Achievements (10 achievements)
    if (currentStreak >= 2) achievements.push({ name: "Duo", description: "2-day streak", icon: "🔥" });
    if (currentStreak >= 3) achievements.push({ name: "Building Habits", description: "3-day streak", icon: "🎯" });
    if (currentStreak >= 7) achievements.push({ name: "Week Warrior", description: "7-day streak", icon: "⚡" });
    if (currentStreak >= 14) achievements.push({ name: "Fortnight Focus", description: "14-day streak", icon: "🎪" });
    if (currentStreak >= 21) achievements.push({ name: "Habit Former", description: "21-day streak", icon: "🧠" });
    if (currentStreak >= 30) achievements.push({ name: "Monthly Master", description: "30-day streak", icon: "📆" });
    if (currentStreak >= 50) achievements.push({ name: "Unstoppable", description: "50-day streak", icon: "🚀" });
    if (currentStreak >= 100) achievements.push({ name: "Centurion Streak", description: "100-day streak", icon: "🌟" });
    if (currentStreak >= 200) achievements.push({ name: "Legendary Consistency", description: "200-day streak", icon: "🏆" });
    if (currentStreak >= 365) achievements.push({ name: "Year-Round Breather", description: "365-day streak", icon: "🎊" });

    // Time-Based Achievements (10 achievements)
    if (totalMinutes >= 5) achievements.push({ name: "First Five", description: "5 minutes practiced", icon: "⏱️" });
    if (totalMinutes >= 30) achievements.push({ name: "Half Hour", description: "30 minutes practiced", icon: "🕐" });
    if (totalMinutes >= 60) achievements.push({ name: "Hour of Calm", description: "60 minutes practiced", icon: "⏰" });
    if (totalMinutes >= 120) achievements.push({ name: "Two Hour Zen", description: "2 hours practiced", icon: "🧘" });
    if (totalMinutes >= 300) achievements.push({ name: "Five Hour Flow", description: "5 hours practiced", icon: "🌊" });
    if (totalMinutes >= 600) achievements.push({ name: "Ten Hour Tranquil", description: "10 hours practiced", icon: "🏔️" });
    if (totalMinutes >= 1200) achievements.push({ name: "Twenty Hour Peace", description: "20 hours practiced", icon: "☮️" });
    if (totalMinutes >= 2400) achievements.push({ name: "Forty Hour Focus", description: "40 hours practiced", icon: "🎯" });
    if (totalMinutes >= 4800) achievements.push({ name: "Eighty Hour Expert", description: "80 hours practiced", icon: "🏅" });
    if (totalMinutes >= 6000) achievements.push({ name: "Hundred Hour Hero", description: "100 hours practiced", icon: "🦸" });

    // Round-Based Achievements (10 achievements)
    if (totalRounds >= 10) achievements.push({ name: "Ten Rounds", description: "Completed 10 breathing rounds", icon: "🔄" });
    if (totalRounds >= 50) achievements.push({ name: "Fifty Flows", description: "Completed 50 breathing rounds", icon: "🌀" });
    if (totalRounds >= 100) achievements.push({ name: "Hundred Cycles", description: "Completed 100 breathing rounds", icon: "💨" });
    if (totalRounds >= 250) achievements.push({ name: "Quarter Thousand", description: "Completed 250 breathing rounds", icon: "🌪️" });
    if (totalRounds >= 500) achievements.push({ name: "Five Hundred Flows", description: "Completed 500 breathing rounds", icon: "🌊" });
    if (totalRounds >= 1000) achievements.push({ name: "Thousand Breaths", description: "Completed 1000 breathing rounds", icon: "✨" });
    if (totalRounds >= 2000) achievements.push({ name: "Two Thousand Zen", description: "Completed 2000 breathing rounds", icon: "🏔️" });
    if (totalRounds >= 5000) achievements.push({ name: "Five Thousand Force", description: "Completed 5000 breathing rounds", icon: "⚡" });
    if (totalRounds >= 10000) achievements.push({ name: "Ten Thousand Tranquil", description: "Completed 10,000 breathing rounds", icon: "🏆" });
    if (totalRounds >= 20000) achievements.push({ name: "Twenty Thousand Thunder", description: "Completed 20,000 breathing rounds", icon: "⚡" });

    // Weekly Goal Achievements (10 achievements)
    if (thisWeekSessions >= 1) achievements.push({ name: "Weekly Starter", description: "1 session this week", icon: "🌅" });
    if (thisWeekSessions >= 3) achievements.push({ name: "Consistent Week", description: "3 sessions this week", icon: "📈" });
    if (thisWeekSessions >= 5) achievements.push({ name: "Goal Crusher", description: "5 sessions this week", icon: "🎯" });
    if (thisWeekSessions >= 7) achievements.push({ name: "Daily Devotee", description: "7 sessions this week", icon: "⭐" });
    if (thisWeekSessions >= 10) achievements.push({ name: "Over Achiever", description: "10 sessions this week", icon: "🚀" });
    if (thisWeekSessions >= 14) achievements.push({ name: "Double Daily", description: "14 sessions this week", icon: "💪" });
    if (thisWeekSessions >= 21) achievements.push({ name: "Triple Threat", description: "21 sessions this week", icon: "🔥" });
    
    // Calculate sessions by day of week
    const daySessionCounts = Array(7).fill(0);
    recentSessions.forEach(session => {
      if (session.completed && session.completedAt) {
        const dayOfWeek = new Date(session.completedAt).getDay();
        daySessionCounts[dayOfWeek]++;
      }
    });
    
    if (daySessionCounts.every(count => count > 0)) achievements.push({ name: "Every Day Warrior", description: "Practiced on every day of the week", icon: "📅" });
    if (daySessionCounts[0] >= 5) achievements.push({ name: "Sunday Sanctuary", description: "5 Sunday sessions", icon: "☀️" });
    if (daySessionCounts[6] >= 5) achievements.push({ name: "Saturday Serenity", description: "5 Saturday sessions", icon: "🌙" });

    return achievements;
  };

  const formatExerciseName = (id: string) => {
    if (!id) return 'Unknown Exercise';
    const exercise = exercises.find(ex => ex.id === id);
    return exercise ? exercise.name : id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Unknown date';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Use user's local timezone
      });
    } catch (error) {
      console.warn('Invalid date format:', dateStr);
      return 'Invalid date';
    }
  };

  const weeklyData = getWeeklyData();
  const achievements = getAchievements();
  const weeklyGoal = 5; // Could be user-configurable later
  const goalProgress = (thisWeekSessions / weeklyGoal) * 100;

  // Handle null user case after all hooks are called
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background">
        <Navbar />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-25 dark:opacity-20" role="presentation" aria-hidden="true" />
        <div className="relative container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-md mx-auto text-center mt-20">
            <h2 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h2>
            <p className="text-muted-foreground">Track your breathing journey and see your progress.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background">
      <Navbar />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-25 dark:opacity-20" role="presentation" aria-hidden="true" />
      
      <main className="relative">
        <div className="container mx-auto px-4 pt-24 pb-16">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h1 className="text-5xl font-bold tracking-tight mb-4 text-primary/90">
              Welcome back, {user.displayName}!
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Here's your breathing journey progress
            </p>
          </motion.header>

          <div className="max-w-7xl mx-auto space-y-12">
            {/* Quick Start & Streak Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Quick Start */}
              <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" />
                    Quick Start
                  </CardTitle>
                  <CardDescription>
                    Jump back in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sortedExercises.length > 0 ? (
                      <Link href={`/exercise/${sortedExercises[0][0]}`}>
                        <Button className="w-full justify-between" size="lg">
                          <span className="truncate">{formatExerciseName(sortedExercises[0][0])}</span>
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/exercise/box-breathing">
                        <Button className="w-full justify-between" size="lg">
                          <span className="truncate">Box Breathing</span>
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        </Button>
                      </Link>
                    )}
                    <Link href="/">
                      <Button variant="outline" className="w-full justify-between" size="lg">
                        <span className="truncate">Choose by mood</span>
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Streak Counter */}
              <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Current Streak
                  </CardTitle>
                  <CardDescription>
                    Consecutive days of practice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                    </div>
                    {currentStreak > 0 ? (
                      <p className="text-sm text-muted-foreground mb-2">
                        Keep it going! 🔥
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-2">
                        Start your streak today! 💪
                      </p>
                    )}
                    {/* Show highest streak if user has had broken streaks */}
                    {recentSessions.filter(s => s.completed).length > 0 && highestStreak > currentStreak && (
                      <div className="text-sm text-muted-foreground bg-orange-50 dark:bg-orange-950/20 rounded-lg px-3 py-2 border border-orange-200 dark:border-orange-800/30">
                        <span className="text-orange-700 dark:text-orange-300 font-medium">
                          🏆 Best streak: {highestStreak} {highestStreak === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            {/* Stats Overview */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <Card className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
                  <Activity className="h-5 w-5 text-primary/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats?.totalSessions || 0}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats?.totalMinutes || 0} total minutes
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
                  <Calendar className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{thisWeekSessions}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    sessions completed
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Rounds</CardTitle>
                  <Target className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats?.totalRounds || 0}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    breathing rounds
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Daily Average</CardTitle>
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{avgDailySessions}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    sessions per day
                  </p>
                </CardContent>
              </Card>
            </motion.section>

            {/* Weekly Progress - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Weekly Progress
                  </CardTitle>
                  <CardDescription>
                    Your practice this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Goal Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Weekly Goal</span>
                        <span>{thisWeekSessions}/{weeklyGoal} sessions</span>
                      </div>
                      <Progress value={Math.min(goalProgress, 100)} className="h-2" />
                    </div>
                    
                    {/* Daily bars with max height to prevent overflow */}
                    <div className="flex items-end justify-between h-24 gap-2">
                      {weeklyData.map((day, index) => (
                        <div key={day.day} className="flex flex-col items-center flex-1">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-sm min-h-[4px] flex flex-col justify-end">
                            <div 
                              className="w-full bg-primary rounded-t-sm transition-all duration-300"
                              style={{ 
                                height: `${Math.min(Math.max(day.sessions * 20, day.sessions > 0 ? 8 : 0), 80)}px` 
                              }}
                              title={`${day.sessions} session${day.sessions !== 1 ? 's' : ''}`}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">{day.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Sessions & Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Sessions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Card className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Recent Sessions
                    </CardTitle>
                    <CardDescription>
                      Your latest breathing exercises
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : recentSessions.length === 0 ? (
                      <div className="text-center py-12">
                        <Activity className="h-16 w-16 mx-auto mb-4 text-primary/20" />
                        <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
                        <p className="text-muted-foreground">Complete your first breathing exercise to see your progress!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentSessions.slice(0, 5).map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-primary/5 hover:border-primary/10 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className="w-3 h-3 rounded-full bg-primary/80"></div>
                              <div>
                                <p className="font-medium text-sm">{formatExerciseName(session.exerciseId)}</p>
                                <p className="text-sm text-muted-foreground">
                                  {session.roundsCompleted} rounds • {Math.floor(session.durationSeconds / 60)}m {session.durationSeconds % 60}s
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                {session.completedAt ? formatDate(session.completedAt) : 'In progress'}
                              </p>
                              {session.completed && (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                                  Completed
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Achievements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <Card className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Achievements ({achievements.length}/50)
                    </CardTitle>
                    <CardDescription>
                      Your mindfulness milestones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {achievements.length > 0 ? (
                      <div className="space-y-3">
                        {(achievementsExpanded ? achievements : achievements.slice(0, 6)).map((achievement, index) => (
                          <div key={achievement.name} className="flex items-center gap-3 p-2 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg">
                            <span className="text-2xl">{achievement.icon}</span>
                            <div>
                              <p className="font-medium text-sm">{achievement.name}</p>
                              <p className="text-xs text-muted-foreground">{achievement.description}</p>
                            </div>
                          </div>
                        ))}
                        {achievements.length > 6 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAchievementsExpanded(!achievementsExpanded)}
                            className="w-full text-xs text-muted-foreground hover:text-foreground mt-4 mb-2 py-3 flex items-center justify-center gap-1"
                          >
                            {achievementsExpanded ? (
                              <>
                                Show less
                                <ChevronUp className="h-3 w-3" />
                              </>
                            ) : (
                              <>
                                +{achievements.length - 6} more unlocked
                                <ChevronDown className="h-3 w-3" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Trophy className="h-16 w-16 mx-auto mb-4 text-primary/20" />
                        <h3 className="text-lg font-medium mb-2">Start Your Journey</h3>
                        <p className="text-muted-foreground text-sm">Complete your first session to unlock achievements!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Favorite Exercises */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Card className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Favorite Exercises
                  </CardTitle>
                  <CardDescription>
                    Your most practiced breathing techniques
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : sortedExercises.length === 0 ? (
                    <div className="text-center py-12">
                      <Target className="h-16 w-16 mx-auto mb-4 text-primary/20" />
                      <h3 className="text-lg font-medium mb-2">No data yet</h3>
                      <p className="text-muted-foreground text-sm">Try a few exercises to see your preferences!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sortedExercises.map(([exerciseId, count], index) => (
                        <Link key={exerciseId} href={`/exercise/${exerciseId}`}>
                          <Card className="hover:border-primary/20 transition-colors cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-primary/60'}`}></div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <h3 className="font-medium text-sm mb-1">{formatExerciseName(exerciseId)}</h3>
                              <p className="text-xs text-muted-foreground mb-3">
                                {count} session{count > 1 ? 's' : ''}
                              </p>
                              <Progress 
                                value={Math.min((count / Math.max(...Object.values(exerciseCount))) * 100, 100)} 
                                className="h-1" 
                              />
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
} 