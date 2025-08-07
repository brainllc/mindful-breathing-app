import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { exercises } from "@/lib/exercises";
import { RoundConfig } from "@/components/RoundConfig";
import { BreathingAnimation } from "@/components/BreathingAnimation";
import { ExerciseCompletion } from "@/components/ExerciseCompletion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { SafetyDisclaimer } from "@/components/SafetyDisclaimer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ExerciseInfoModal } from "@/components/ExerciseInfoModal";
import { ControlsBar } from "@/components/ControlsBar";
import { audioService } from "@/lib/audio";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

export default function Exercise() {
  const [, params] = useRoute("/exercise/:id");
  const exercise = exercises.find(e => e.id === params?.id);
  const { toast } = useToast();
  const { user } = useAuth();

  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(Math.max(1, exercise?.defaultRounds || 4));
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  // Add countdown states
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  // Add completion state
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionData, setCompletionData] = useState<{
    roundsCompleted: number;
    durationSeconds: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const exerciseTitleRef = useRef<HTMLDivElement>(null);
  const breathingAnimationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (exercise) {
      document.title = `${exercise.name} - Mindful Breathing Exercise Guide`;

      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          `Learn and practice ${exercise.name}: ${exercise.description}. ${exercise.benefits.join('. ')}`
        );
      }

      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');

      if (ogTitle) {
        ogTitle.setAttribute('content', `${exercise.name} - Breathing Exercise Guide`);
      }
      if (ogDesc) {
        ogDesc.setAttribute('content', 
          `Learn ${exercise.name}: ${exercise.description}. Benefits include: ${exercise.benefits.join(', ')}`
        );
      }

      const structuredData = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": `${exercise.name} Breathing Exercise`,
        "description": exercise.description,
        "totalTime": `PT${Math.round(exercise.pattern.inhale + (exercise.pattern.hold || 0) + exercise.pattern.exhale)}S`,
        "step": [
          {
            "@type": "HowToStep",
            "name": "Inhale",
            "text": `Inhale for ${exercise.pattern.inhale} seconds`,
            "position": "1"
          },
          ...(exercise.pattern.hold ? [{
            "@type": "HowToStep",
            "name": "Hold",
            "text": `Hold breath for ${exercise.pattern.hold} seconds`,
            "position": "2"
          }] : []),
          {
            "@type": "HowToStep",
            "name": "Exhale",
            "text": `Exhale for ${exercise.pattern.exhale} seconds`,
            "position": exercise.pattern.hold ? "3" : "2"
          }
        ]
      };

      const scriptTag = document.querySelector('#structured-data');
      if (scriptTag) {
        scriptTag.textContent = JSON.stringify(structuredData);
      } else {
        const newScript = document.createElement('script');
        newScript.id = 'structured-data';
        newScript.type = 'application/ld+json';
        newScript.textContent = JSON.stringify(structuredData);
        document.head.appendChild(newScript);
      }
    }

    // Cleanup function to stop audio when leaving the page
    return () => {
      audioService.stopMusic();
    };
  }, [exercise]);

  // No need to scroll with navbar - page starts at top

  // Countdown effect
  useEffect(() => {
    if (showCountdown && countdownValue > 0) {
      const timer = setTimeout(() => {
        setCountdownValue(prev => prev - 1);
      }, 1500); // Slower countdown - 1.5 seconds per number
      return () => clearTimeout(timer);
    } else if (showCountdown && countdownValue === 0) {
      // Countdown finished, start the actual exercise
      setShowCountdown(false);
      setCountdownValue(3); // Reset for next time
      startExerciseImmediate().catch(error => {
        console.error('Error starting exercise after countdown:', error);
      });
    }
  }, [showCountdown, countdownValue]);

  // Function to start a session in the backend
  const startSession = async () => {
    if (!user || !exercise) return;

    try {
      const storedSession = localStorage.getItem('supabase.auth.token');
      if (!storedSession) return;
      
      const session = JSON.parse(storedSession);
      const response = await fetch(`/api/exercises/${exercise.id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          rounds: totalRounds
        })
      });

      if (response.ok) {
        const sessionData = await response.json();
        console.log('🎯 FRONTEND: Session start response:', sessionData);
        setCurrentSessionId(sessionData.id); // Use 'id' field, not 'sessionId'
        setSessionStartTime(new Date());
        console.log('🎯 FRONTEND: Set currentSessionId to:', sessionData.id);
      } else {
        console.error('Failed to start session:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  // Function to complete a session in the backend
  const completeSession = async () => {
    console.log('🎯 FRONTEND: completeSession called');
    console.log('🎯 FRONTEND: user:', !!user);
    console.log('🎯 FRONTEND: currentSessionId:', currentSessionId);
    console.log('🎯 FRONTEND: sessionStartTime:', sessionStartTime);
    
    if (!user || !currentSessionId || !sessionStartTime) {
      console.log('🎯 FRONTEND: Missing required data, returning early');
      return;
    }

    try {
      console.log('🎯 FRONTEND: Getting stored session');
      const storedSession = localStorage.getItem('supabase.auth.token');
      if (!storedSession) {
        console.log('🎯 FRONTEND: No stored session, returning');
        return;
      }
      
      console.log('🎯 FRONTEND: Parsing session and calculating duration');
      const session = JSON.parse(storedSession);
      const durationSeconds = Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000);
      
      console.log('🎯 FRONTEND: Making API call to complete session');
      console.log('🎯 FRONTEND: URL:', `/api/exercises/sessions/${currentSessionId}/complete`);
      console.log('🎯 FRONTEND: Body:', { roundsCompleted: currentRound + 1, durationSeconds });
      
      const response = await fetch(`/api/exercises/sessions/${currentSessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          roundsCompleted: currentRound + 1,
          durationSeconds
        })
      });

      console.log('🎯 FRONTEND: API response received');
      console.log('🎯 FRONTEND: Response status:', response.status);
      console.log('🎯 FRONTEND: Response ok:', response.ok);

      if (response.ok) {
        console.log('🎯 FRONTEND: Response OK, parsing JSON');
        const completionData = await response.json();
        console.log('🎯 FRONTEND: Session completed successfully:', completionData);
        
        // Trigger immediate dashboard refresh
        window.dispatchEvent(new CustomEvent('exerciseCompleted', { 
          detail: { 
            sessionId: completionData.sessionId, 
            exerciseId: completionData.exerciseId,
            durationSeconds 
          } 
        }));
        
        // Format duration display
        let durationText;
        if (durationSeconds < 60) {
          durationText = `${durationSeconds} seconds`;
        } else {
          const minutes = Math.floor(durationSeconds / 60);
          const remainingSeconds = durationSeconds % 60;
          if (remainingSeconds === 0) {
            const minuteText = minutes === 1 ? "minute" : "minutes";
            durationText = `${minutes} ${minuteText}`;
          } else {
            const minuteText = minutes === 1 ? "minute" : "minutes";
            durationText = `${minutes} ${minuteText} and ${remainingSeconds} seconds`;
          }
        }
        
        toast({
          title: "Great job!",
          description: `You completed ${currentRound + 1} rounds in ${durationText}.`,
        });
      } else {
        console.error('🎯 FRONTEND: Response NOT OK');
        const errorText = await response.text();
        console.error('🎯 FRONTEND: Error status:', response.status);
        console.error('🎯 FRONTEND: Error text:', errorText);
      }
    } catch (error) {
      console.error('🎯 FRONTEND: Exception in completeSession:', error);
      console.error('🎯 FRONTEND: Error stack:', error.stack);
    }
  };

  const handleStart = async () => {
    if (!hasAcceptedDisclaimer) {
      setShowDisclaimer(true);
      return;
    }

    await startExercise();
  };

  const startExercise = async () => {
    try {
      console.log('Starting countdown...');
      // Show countdown instead of starting immediately
      setShowCountdown(true);
      setCountdownValue(3);
      
      // Start session tracking
      await startSession();
      
      // Music will start when actual exercise begins, not during countdown
    } catch (error) {
      console.error('Exercise start error:', error);
      // Continue with countdown even if audio fails
      setShowCountdown(true);
      setCountdownValue(3);
    }
  };

  // Function to start the actual breathing exercise after countdown
  const startExerciseImmediate = async () => {
      setIsStarted(true);
      setIsPaused(false);
      
      // Start music now that the actual exercise is beginning
      try {
        await audioService.playMusic();
      } catch (error) {
        console.error('Failed to start music for exercise:', error);
        // Continue with exercise even if music fails
      }
  };

  const handlePause = async () => {
    if (isPaused) {
      // Resume the exercise
      await audioService.resumeMusic();
    } else {
      // Pause the exercise
      await audioService.pauseMusic();
    }
    setIsPaused(!isPaused);
  };

  const handleDisclaimerAccept = async () => {
    setHasAcceptedDisclaimer(true);
    setShowDisclaimer(false);
    // Start exercise directly without checking disclaimer state
    await startExercise();
  };

  const handleDisclaimerDecline = () => {
    setShowDisclaimer(false);
    toast({
      title: "Safety First",
      description: "Please consult with a healthcare provider before starting any breathing exercises.",
    });
  };

  const handleEmergencyStop = async () => {
    setIsStarted(false);
    setIsPaused(false);
    setCurrentRound(0);
    setPhaseProgress(0);
    setCurrentSessionId(null);
    setSessionStartTime(null);
    setShowCountdown(false);
    setCountdownValue(3);
    await audioService.stopMusic();
    toast({
      title: "Exercise Stopped",
      description: "Take a moment to rest. If you experience any discomfort, please seek medical attention.",
      variant: "destructive",
    });
  };

  const handleRoundComplete = async () => {
    if (currentRound + 1 >= totalRounds) {
      // Exercise completed
      await completeSession();
      
      // Calculate completion data in seconds for better granularity
      const durationSeconds = sessionStartTime 
        ? Math.round((Date.now() - sessionStartTime.getTime()) / 1000)
        : Math.round(totalRounds * roundDuration);
      
      // Set completion data and show completion screen
      setCompletionData({
        roundsCompleted: totalRounds,
        durationSeconds
      });
      setIsCompleted(true);
      
      await audioService.stopMusic();
    } else {
      setCurrentRound(prev => prev + 1);
      setPhaseProgress(0);
    }
  };

  const handlePhaseProgress = (progress: number) => {
    setPhaseProgress(progress);
  };

  const handleStartAgain = () => {
    // Reset all state to start the exercise again
    setIsCompleted(false);
    setCompletionData(null);
    setIsStarted(false);
    setIsPaused(false);
    setCurrentRound(0);
    setPhaseProgress(0);
    setCurrentSessionId(null);
    setSessionStartTime(null);
    setShowCountdown(false);
    setCountdownValue(3);
  };

  const roundDuration = exercise ? (
    exercise.pattern.inhale + 
    (exercise.pattern.hold || 0) + 
    exercise.pattern.exhale +
    (exercise.pattern.holdEmpty || 0)
  ) : 0;

  const totalDuration = roundDuration * totalRounds;

  const totalProgress = ((currentRound / totalRounds) + (phaseProgress / totalRounds)) * 100;

  // Scroll to top when completion screen is shown
  useEffect(() => {
    if (isCompleted && completionData && exercise) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isCompleted, completionData, exercise]);

  // Handle case where exercise is not found - after all hooks are called
  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background">
        <Navbar />
        <div className="relative container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-md mx-auto text-center mt-20">
            <h2 className="text-2xl font-bold mb-4">Exercise not found</h2>
            <p className="text-muted-foreground">The exercise you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show completion screen if exercise is completed
  if (isCompleted && completionData && exercise) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="completion"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
                      <ExerciseCompletion
              exercise={exercise}
              roundsCompleted={completionData.roundsCompleted}
              durationSeconds={completionData.durationSeconds}
              onStartAgain={handleStartAgain}
            />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="exercise"
        initial={{ opacity: 1 }}
        exit={{ 
          opacity: 0, 
          scale: 0.98,
          transition: { duration: 0.4, ease: "easeIn" }
        }}
        className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background"
      >
        <Navbar />
      <SafetyDisclaimer 
        isOpen={showDisclaimer} 
        onAccept={handleDisclaimerAccept}
        onDecline={handleDisclaimerDecline}
      />

      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-25 dark:opacity-20 will-change-transform" role="presentation" aria-hidden="true" />
        <div ref={containerRef} className={`container relative mx-auto px-4 pb-[180px] ${!isStarted && !showCountdown ? 'pt-32' : 'pt-20'}`}>
        <div className="max-w-4xl mx-auto">

          {!isStarted && !showCountdown && (
            <div className="flex justify-center">
              <Alert className="mb-8 border-yellow-600/50 bg-yellow-50/50 dark:bg-yellow-500/10 dark:border-yellow-500/50 inline-flex w-auto">
                <AlertDescription className="text-sm text-yellow-800 dark:text-yellow-500 flex flex-col sm:flex-row items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-center sm:text-left">
                    Please stop immediately if you experience any discomfort. 
                    These exercises are not a substitute for medical advice.
                  </span>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div ref={exerciseTitleRef} className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-primary/90">
                {exercise.name}
              </h1>
              {!isStarted && !showCountdown && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {exercise.description}
                </p>
              )}
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{roundDuration}s per round</span>
                </div>
                <ExerciseInfoModal exercise={exercise} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showCountdown ? (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center space-y-8"
                >
                  <h2 className="text-xl text-muted-foreground/80">
                    Take a deep breath and relax...
                  </h2>
                  <div className="relative w-64 h-64 mx-auto">
                    {/* Outer breathing circle */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-100/40 to-indigo-100/40 dark:from-blue-900/20 dark:to-indigo-900/20"
                      animate={{ 
                        scale: [1, 1.15, 1],
                        opacity: [0.4, 0.7, 0.4]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    {/* Middle breathing circle */}
                    <motion.div
                      className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-200/30 to-indigo-200/30 dark:from-blue-800/15 dark:to-indigo-800/15"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }}
                    />
                    {/* Inner circle */}
                    <motion.div
                      className="absolute inset-8 rounded-full border-2 border-primary/30"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="text-5xl font-light text-primary/90"
                        key={countdownValue}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      >
                        {countdownValue}
                      </motion.div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-lg text-muted-foreground/70">
                      Starting in {countdownValue}...
                    </p>
                    <p className="text-sm text-muted-foreground/60 max-w-md mx-auto leading-relaxed">
                      Find a comfortable position and prepare to breathe mindfully. 
                      Let your shoulders relax and your breath flow naturally.
                    </p>
                  </div>
                </motion.div>
              ) : isStarted ? (
                <motion.div
                  key="exercise"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Round {currentRound + 1} of {totalRounds}</span>
                        <span>{Math.round(totalProgress)}% Complete</span>
                      </div>
                      <Progress value={totalProgress} className="h-1" />
                    </div>

                    <div ref={breathingAnimationRef} className="pt-2">
                    <BreathingAnimation
                      exercise={exercise}
                      isActive={isStarted && !isPaused}
                      currentRound={currentRound}
                      onRoundComplete={handleRoundComplete}
                      onPhaseProgress={handlePhaseProgress}
                    />
                    </div>

                    {isStarted && (
                      <ControlsBar
                        rounds={totalRounds}
                        onRoundsChange={(newRounds) => {
                          // Ensure minimum 1 round and prevent setting below current round
                          const validRounds = Math.max(1, newRounds);
                          if (validRounds >= currentRound + 1) {
                            setTotalRounds(validRounds);
                          }
                        }}
                        onPause={handlePause}
                        onEndSession={() => {
                          setIsStarted(false);
                          setCurrentRound(0);
                          setPhaseProgress(0);
                        }}
                        isPaused={isPaused}
                        currentRound={currentRound}
                      />
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="config"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-16"
                >
                  <div className="max-w-xl mx-auto space-y-12">
                    <RoundConfig
                      defaultRounds={totalRounds}
                      onStart={(rounds) => {
                        setTotalRounds(Math.max(1, rounds));
                      }}
                      isStarted={isStarted}
                    />

                    <Button 
                      size="lg"
                      className="w-full"
                      onClick={handleStart}
                    >
                      Start Breathing
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        

      </div>
      </motion.div>
    </AnimatePresence>
  );
}