import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { exercises } from "@/lib/exercises";
import { RoundConfig } from "@/components/RoundConfig";
import { BreathingAnimation } from "@/components/BreathingAnimation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { SafetyDisclaimer } from "@/components/SafetyDisclaimer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ExerciseInfoModal } from "@/components/ExerciseInfoModal";
import { ControlsBar } from "@/components/ControlsBar";
import { audioService } from "@/lib/audio";
import ThemeToggle from "@/components/ThemeToggle";

export default function Exercise() {
  const [, params] = useRoute("/exercise/:id");
  const exercise = exercises.find(e => e.id === params?.id);
  const { toast } = useToast();

  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(exercise?.defaultRounds || 4);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isStarted && containerRef.current) {
      containerRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [isStarted]);

  if (!exercise) {
    return <div>Exercise not found</div>;
  }

  const handleStart = async () => {
    if (!hasAcceptedDisclaimer) {
      setShowDisclaimer(true);
      return;
    }

    try {
      console.log('Starting exercise...');
      setIsStarted(true);
      setIsPaused(false);
      await audioService.playMusic();
    } catch (error) {
      console.error('Exercise start error:', error);
      // Continue exercise even if audio fails, but don't prompt for clicking
      setIsStarted(true);
      setIsPaused(false);
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

  const handleDisclaimerAccept = () => {
    setHasAcceptedDisclaimer(true);
    setShowDisclaimer(false);
    handleStart();
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
    await audioService.stopMusic();
    toast({
      title: "Exercise Stopped",
      description: "Take a moment to rest. If you experience any discomfort, please seek medical attention.",
      variant: "destructive",
    });
  };

  const handleRoundComplete = async () => {
    if (currentRound + 1 >= totalRounds) {
      setIsStarted(false);
      setIsPaused(false);
      setCurrentRound(0);
      setPhaseProgress(0);
      await audioService.stopMusic();
    } else {
      setCurrentRound(prev => prev + 1);
      setPhaseProgress(0);
    }
  };

  const handlePhaseProgress = (progress: number) => {
    setPhaseProgress(progress);
  };

  const roundDuration = exercise.pattern.inhale + 
                       (exercise.pattern.hold || 0) + 
                       exercise.pattern.exhale +
                       (exercise.pattern.holdEmpty || 0);

  const totalDuration = roundDuration * totalRounds;

  const totalProgress = ((currentRound / totalRounds) + (phaseProgress / totalRounds)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50/40 to-slate-50 dark:from-primary/10 dark:via-background dark:to-background">
      <ThemeToggle />
      <SafetyDisclaimer 
        isOpen={showDisclaimer} 
        onAccept={handleDisclaimerAccept}
        onDecline={handleDisclaimerDecline}
      />

      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-25 dark:opacity-20 will-change-transform" role="presentation" aria-hidden="true" />
      <div ref={containerRef} className="container relative mx-auto px-4 pt-12 pb-[140px]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <Link href="/" className="inline-block">
              <Button
                variant="ghost"
                className="text-primary hover:text-primary/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Exercises
              </Button>
            </Link>
          </div>

          {!isStarted && (
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
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-primary/90">
                {exercise.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {exercise.description}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{roundDuration}s per round</span>
                </div>
                <ExerciseInfoModal exercise={exercise} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isStarted ? (
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

                    <BreathingAnimation
                      exercise={exercise}
                      isActive={isStarted && !isPaused}
                      onRoundComplete={handleRoundComplete}
                      onPhaseProgress={handlePhaseProgress}
                    />

                    {isStarted && (
                      <ControlsBar
                        rounds={totalRounds}
                        onRoundsChange={(newRounds) => {
                          // Prevent setting rounds below current round
                          if (newRounds >= currentRound + 1) {
                            setTotalRounds(newRounds);
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
                        setTotalRounds(rounds);
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
    </div>
  );
}