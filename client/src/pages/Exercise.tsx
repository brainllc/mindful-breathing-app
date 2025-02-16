import { useState } from "react";
import { useRoute } from "wouter";
import { exercises } from "@/lib/exercises";
import { RoundConfig } from "@/components/RoundConfig";
import { BreathingAnimation } from "@/components/BreathingAnimation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react";
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="relative">
                      <div className="bg-card p-6 rounded-lg border border-primary/10">
                        <h2 className="text-xl font-medium mb-6">Configure Session</h2>
                        <RoundConfig
                          defaultRounds={exercise.defaultRounds}
                          onStart={(rounds) => {
                            setTotalRounds(rounds);
                            setIsStarted(true);
                          }}
                          isStarted={isStarted}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h2 className="text-xl font-medium">Benefits</h2>
                      <ul className="space-y-4">
                        {exercise.benefits.map((benefit, index) => (
                          <motion.li 
                            key={index}
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <CheckCircle className="w-5 h-5 mt-0.5 text-primary/60 shrink-0" />
                            <span className="text-muted-foreground">{benefit}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button 
                    size="lg"
                    className="w-full max-w-md mx-auto block"
                    onClick={handleStart}
                  >
                    Start Breathing
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}