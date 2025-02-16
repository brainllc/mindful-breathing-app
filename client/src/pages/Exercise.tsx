import { useState } from "react";
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

  if (!exercise) {
    return <div>Exercise not found</div>;
  }

  const handleStart = async () => {
    if (!hasAcceptedDisclaimer) {
      setShowDisclaimer(true);
      return;
    }

    try {
      await audioService.init();
      setIsStarted(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      toast({
        title: "Audio Error",
        description: "Failed to initialize audio. You may need to allow audio playback in your browser settings.",
        variant: "destructive",
      });
      setIsStarted(true);
      setIsPaused(false);
    }
  };

  const handleDisclaimerAccept = async () => {
    setHasAcceptedDisclaimer(true);
    setShowDisclaimer(false);

    try {
      await audioService.init();
      setIsStarted(true);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      toast({
        title: "Audio Error",
        description: "Failed to initialize audio. You may need to allow audio playback in your browser settings.",
        variant: "destructive",
      });
      setIsStarted(true);
    }
  };

  const handleDisclaimerDecline = () => {
    setShowDisclaimer(false);
    toast({
      title: "Safety First",
      description: "Please consult with a healthcare provider before starting any breathing exercises.",
    });
  };

  const handleEmergencyStop = () => {
    setIsStarted(false);
    setIsPaused(false);
    setCurrentRound(0);
    setPhaseProgress(0);
    toast({
      title: "Exercise Stopped",
      description: "Take a moment to rest. If you experience any discomfort, please seek medical attention.",
      variant: "destructive",
    });
  };

  const handleRoundComplete = () => {
    if (currentRound + 1 >= totalRounds) {
      setIsStarted(false);
      setIsPaused(false);
      setCurrentRound(0);
      setPhaseProgress(0);
    } else {
      setCurrentRound(prev => prev + 1);
      setPhaseProgress(0);
    }
  };

  // Calculate total duration of a single round in seconds
  const roundDuration = exercise.pattern.inhale + 
                       (exercise.pattern.hold || 0) + 
                       exercise.pattern.exhale;

  // Calculate total duration of all rounds in seconds
  const totalDuration = roundDuration * totalRounds;

  // Calculate progress based on elapsed time
  const totalProgress = Math.min((phaseProgress / totalDuration) * 100, 100);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background dark:from-primary/10">
      <SafetyDisclaimer 
        isOpen={showDisclaimer} 
        onAccept={handleDisclaimerAccept}
        onDecline={handleDisclaimerDecline}
      />

      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-40 dark:opacity-20" />

      <div className="container relative mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-block mb-12">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exercises
            </Button>
          </Link>

          {!isStarted && (
            <div className="flex justify-center">
              <Alert className="mb-8 border-yellow-500/50 bg-yellow-500/10 inline-flex w-auto">
                <AlertDescription className="text-sm text-yellow-500">
                  <AlertTriangle className="h-4 w-4" />
                  Please stop immediately if you experience any discomfort. 
                  These exercises are not a substitute for medical advice.
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
              <h1 className="text-4xl font-bold bg-gradient-to-b from-primary/90 to-primary/70 bg-clip-text text-transparent">
                {exercise.name}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {exercise.description}
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="flex items-center text-primary">
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
                      onPhaseProgress={setPhaseProgress}
                    />

                    {isStarted && (
                      <ControlsBar
                        rounds={totalRounds}
                        onRoundsChange={setTotalRounds}
                        onPause={() => setIsPaused(!isPaused)}
                        onEndSession={() => {
                          setIsStarted(false);
                          setCurrentRound(0);
                          setPhaseProgress(0);
                        }}
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