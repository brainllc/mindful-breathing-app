import { useState } from "react";
import { useRoute } from "wouter";
import { exercises } from "@/lib/exercises";
import { RoundConfig } from "@/components/RoundConfig";
import { BreathingAnimation } from "@/components/BreathingAnimation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Plus, Minus } from "lucide-react";
import { Link } from "wouter";

export default function Exercise() {
  const [, params] = useRoute("/exercise/:id");
  const exercise = exercises.find(e => e.id === params?.id);

  const [isStarted, setIsStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(exercise?.defaultRounds || 4);

  if (!exercise) {
    return <div>Exercise not found</div>;
  }

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleRoundComplete = () => {
    if (currentRound + 1 >= totalRounds) {
      setIsStarted(false);
      setCurrentRound(0);
    } else {
      setCurrentRound(prev => prev + 1);
    }
  };

  const adjustRounds = (amount: number) => {
    setTotalRounds(prev => Math.min(Math.max(prev + amount, 1), 10));
  };

  const progress = (currentRound / totalRounds) * 100;
  const duration = exercise.pattern.inhale + (exercise.pattern.hold || 0) + 
                  exercise.pattern.exhale + (exercise.pattern.holdEmpty || 0);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background dark:from-primary/10">
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
              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <Clock className="w-4 h-4" />
                <span>{duration}s per round</span>
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
                    isActive={isStarted}
                    onRoundComplete={handleRoundComplete}
                  />

                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => adjustRounds(-1)}
                      className="rounded-full"
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
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button 
                    variant="ghost"
                    className="w-full max-w-sm mx-auto block"
                    onClick={() => setIsStarted(false)}
                  >
                    End Session
                  </Button>
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