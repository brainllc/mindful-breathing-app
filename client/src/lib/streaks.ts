interface ExerciseSession {
  id: number;
  exerciseId: string;
  rounds: number;
  roundsCompleted: number | null;
  durationSeconds: number | null;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
  moodBefore: string | null;
  moodAfter: string | null;
  notes: string | null;
}

/**
 * Calculate current streak from completed sessions
 * Uses local timezone for date calculations to match user's calendar
 */
export function calculateCurrentStreak(sessions: ExerciseSession[]): number {
  // Helper function to format date in local timezone as YYYY-MM-DD
  const formatLocalDate = (date: Date): string => {
    return date.getFullYear() + '-' + 
           String(date.getMonth() + 1).padStart(2, '0') + '-' + 
           String(date.getDate()).padStart(2, '0');
  };
  
  if (sessions.length === 0) {
    console.log('🔥 STREAK DEBUG: No sessions, returning 0');
    return 0;
  }
  
  const completedSessions = sessions
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
  
  // Group sessions by date to handle multiple sessions per day (UTC to local conversion)
  const sessionsByDate = new Map<string, number>();
  for (let i = 0; i < completedSessions.length; i++) {
    const session = completedSessions[i];
    try {
      // CRITICAL FIX: Database returns UTC timestamps without 'Z' suffix
      // JavaScript incorrectly interprets these as local time
      // Force parsing as UTC by adding 'Z' if missing
      let timestamp = session.completedAt!;
      
      // Check if timestamp has timezone info (Z, +XX:XX, or -XX:XX at the end)
      const hasTimezone = timestamp.endsWith('Z') || 
                         timestamp.match(/[+-]\d{2}:\d{2}$/) || 
                         timestamp.match(/[+-]\d{4}$/);
      
      // DETAILED DEBUG: Check what's happening with date parsing (only for first session to avoid spam)
      if (i === 0) {
        console.log('🔥 STREAK DEBUG: Raw timestamp (first session):', session.completedAt);
        console.log('🔥 STREAK DEBUG: Timestamp type:', typeof timestamp);
        console.log('🔥 STREAK DEBUG: Ends with Z?', timestamp.endsWith('Z'));
        console.log('🔥 STREAK DEBUG: Has timezone offset?', timestamp.match(/[+-]\d{2}:\d{2}$/) || timestamp.match(/[+-]\d{4}$/));
        console.log('🔥 STREAK DEBUG: Has any timezone indicator?', hasTimezone);
      }
      
      if (!hasTimezone) {
        timestamp = timestamp + 'Z';
        if (i === 0) {
          console.log('🔥 STREAK DEBUG: Added Z suffix!');
        }
      } else {
        if (i === 0) {
          console.log('🔥 STREAK DEBUG: Did NOT add Z suffix');
        }
      }
      
      const sessionDate = new Date(timestamp);
      
      if (i === 0) {
        console.log('🔥 STREAK DEBUG: Corrected timestamp:', timestamp);
        console.log('🔥 STREAK DEBUG: Parsed Date object (first session):', sessionDate);
        console.log('🔥 STREAK DEBUG: Local time string:', sessionDate.toString());
        console.log('🔥 STREAK DEBUG: ISO string:', sessionDate.toISOString());
      }
      
      // IMPORTANT: Convert UTC timestamp to user's local calendar day for streak calculation
      // sessionDate is now correctly parsed as UTC, convert to local components
      const year = sessionDate.getFullYear();
      const month = sessionDate.getMonth() + 1; // getMonth() returns 0-11, so add 1  
      const day = sessionDate.getDate();
      
      if (i === 0) {
        console.log('🔥 STREAK DEBUG: Extracted LOCAL components (first session):', { year, month: sessionDate.getMonth(), monthPlusOne: month, day });
      }
      
      const dateString = year + '-' + 
                        String(month).padStart(2, '0') + '-' + 
                        String(day).padStart(2, '0');
      
      if (i === 0) {
        console.log('🔥 STREAK DEBUG: Session date conversion (LOCAL):', session.completedAt, '→', dateString);
      }
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
  
  // Use LOCAL time for today to match user's calendar
  const today = new Date();
  
  // DETAILED DEBUG: Check today calculation
  console.log('🔥 STREAK DEBUG: Today Date object:', today);
  console.log('🔥 STREAK DEBUG: Today local string:', today.toString());
  
  // Calculate today's date in LOCAL timezone to match session dates
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  
  console.log('🔥 STREAK DEBUG: Today LOCAL components:', { year: todayYear, month: today.getMonth(), monthPlusOne: todayMonth, day: todayDay });
  
  const todayString = todayYear + '-' + 
                     String(todayMonth).padStart(2, '0') + '-' + 
                     String(todayDay).padStart(2, '0');
  
  console.log('🔥 STREAK DEBUG: Today is:', todayString, '(calculated from LOCAL timezone)');

  let streak = 0;
  let currentDate = new Date(today);
  
  for (const dateString of uniqueDates) {
    // Calculate current date string using LOCAL time to match session dates
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    const currentDateString = currentYear + '-' + 
                             String(currentMonth).padStart(2, '0') + '-' + 
                             String(currentDay).padStart(2, '0');
    
    console.log(`🔥 STREAK DEBUG: Checking ${dateString} === ${currentDateString}?`);
    
    if (dateString === currentDateString) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
      
      // Calculate next date for debug output
      const nextYear = currentDate.getFullYear();
      const nextMonth = currentDate.getMonth() + 1;
      const nextDay = currentDate.getDate();
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
}