import { useState } from "react";
import { useRoute } from "wouter";
import { exercises } from "@/lib/exercises";
import { RoundConfig } from "@/components/RoundConfig";
import { BreathingAnimation } from "@/components/BreathingAnimation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
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

  const progress = (currentRound / totalRounds) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Link href="/" className="inline-block mb-8">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exercises
            </Button>
          </Link>

          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">
                {exercise.name}
              </h1>
              <p className="text-muted-foreground">
                {exercise.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Configure</h2>
                <RoundConfig
                  defaultRounds={exercise.defaultRounds}
                  onStart={(rounds) => {
                    setTotalRounds(rounds);
                    setIsStarted(true);
                  }}
                  isStarted={isStarted}
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Benefits</h2>
                <ul className="space-y-2">
                  {exercise.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      {benefit}
                    </li>
                  ))}
                </ul>
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
              ) : (
                <motion.div
                  key="start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <Button 
                    size="lg"
                    className="w-full max-w-md"
                    onClick={handleStart}
                  >
                    Start Breathing
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}