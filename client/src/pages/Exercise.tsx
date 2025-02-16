import { useState } from "react";
import { useRoute } from "wouter";
import { exercises } from "@/lib/exercises";
import { RoundConfig } from "@/components/RoundConfig";
import { BreathingAnimation } from "@/components/BreathingAnimation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Plus, Minus, AlertTriangle, Pause, Play } from "lucide-react";
import { Link } from "wouter";
import { SafetyDisclaimer } from "@/components/SafetyDisclaimer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ExerciseInfoModal } from "@/components/ExerciseInfoModal";
import { AudioControls } from "@/components/AudioControls";
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
    } else {
      setCurrentRound(prev => prev + 1);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const adjustRounds = (amount: number) => {
    setTotalRounds(prev => {
      const newValue = prev + amount;
      return Math.min(Math.max(newValue, 1), 50);
    });
  };

  const progress = (currentRound / totalRounds) * 100;
  const duration = exercise.pattern.inhale + (exercise.pattern.hold || 0) + 
                  exercise.pattern.exhale + (exercise.pattern.holdEmpty || 0);

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
            <Alert className="mb-8 border-yellow-500/50 bg-yellow-500/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-sm text-yellow-500 flex-1 text-center">
                Please stop immediately if you experience any discomfort. 
                These exercises are not a substitute for medical advice.
              </AlertDescription>
            </Alert>
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
                  <span>{duration}s per round</span>
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
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Round {currentRound + 1} of {totalRounds}</span>
                      <span>{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>

                  <BreathingAnimation
                    exercise={exercise}
                    isActive={isStarted && !isPaused}
                    onRoundComplete={handleRoundComplete}
                  />

                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => adjustRounds(-1)}
                      className="rounded-full"
                      disabled={totalRounds <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-medium text-primary">
                      {totalRounds} Rounds
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => adjustRounds(1)}
                      className="rounded-full"
                      disabled={totalRounds >= 50}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex justify-center gap-4 items-center">
                    <AudioControls />
                    <Button
                      variant="outline"
                      onClick={togglePause}
                      className="w-32"
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => setIsStarted(false)}
                      className="w-32"
                    >
                      End Session
                    </Button>
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