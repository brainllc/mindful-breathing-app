import { useState } from "react";
import { useRoute } from "wouter";
import { exercises } from "@/lib/exercises";
import { RoundConfig } from "@/components/RoundConfig";
import { BreathingAnimation } from "@/components/BreathingAnimation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";

export default function Exercise() {
  const [, params] = useRoute("/exercise/:id");
  const exercise = exercises.find(e => e.id === params?.id);
  
  const [isStarted, setIsStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);

  if (!exercise) {
    return <div>Exercise not found</div>;
  }

  const handleStart = (rounds: number) => {
    setTotalRounds(rounds);
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

  const progress = (currentRound / totalRounds) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-center mb-8">
            {exercise.name}
          </h1>

          <AnimatePresence mode="wait">
            {!isStarted ? (
              <RoundConfig
                key="config"
                defaultRounds={exercise.defaultRounds}
                onStart={handleStart}
              />
            ) : (
              <motion.div
                key="exercise"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Round {currentRound + 1} of {totalRounds}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>

                <BreathingAnimation
                  exercise={exercise}
                  isActive={isStarted}
                  onRoundComplete={handleRoundComplete}
                />

                <Button 
                  variant="secondary"
                  className="w-full"
                  onClick={() => setIsStarted(false)}
                >
                  End Session
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
