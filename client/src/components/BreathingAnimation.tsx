import { motion } from "framer-motion";
import { Exercise } from "@/lib/exercises";
import { useEffect, useState, useRef } from "react";
import { audioService } from "@/lib/audio";

interface Props {
  exercise: Exercise;
  isActive: boolean;
  onRoundComplete: () => void;
  onPhaseProgress: (progress: number) => void;
}

export function BreathingAnimation({ exercise, isActive, onRoundComplete, onPhaseProgress }: Props) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(exercise.pattern.inhale);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalElapsedTimeRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      totalElapsedTimeRef.current = 0;
      setPhase("inhale");
      setPhaseTimeLeft(exercise.pattern.inhale);
      onPhaseProgress(0); // Reset progress when stopping
      return;
    }

    const startBreathing = async () => {
      try {
        await audioService.playMusic();
      } catch (error) {
        console.error('Failed to start meditation music:', error);
      }

      const { pattern } = exercise;

      // Calculate total duration of a single round
      const roundDuration = pattern.inhale + (pattern.hold || 0) + pattern.exhale;

      // Get next phase
      const getNextPhase = () => {
        switch (phase) {
          case "inhale": return pattern.hold ? "hold" : "exhale";
          case "hold": return "exhale";
          case "exhale": return "inhale";
          default: return "inhale";
        }
      };

      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Start the timer that handles both countdown and phase transitions
      timerRef.current = setInterval(() => {
        setPhaseTimeLeft(current => {
          const newTimeLeft = current - 1;

          // Increment total elapsed time
          totalElapsedTimeRef.current += 1;
          // Send overall progress
          onPhaseProgress(totalElapsedTimeRef.current);

          if (newTimeLeft <= 0) {
            const nextPhase = getNextPhase();
            setPhase(nextPhase);

            // If transitioning back to inhale, complete the round
            if (nextPhase === "inhale" && phase === "exhale") {
              onRoundComplete();
            }

            // Start new phase
            const nextPhaseDuration = (() => {
              switch (nextPhase) {
                case "inhale": return pattern.inhale;
                case "hold": return pattern.hold || 0;
                case "exhale": return pattern.exhale;
              }
            })();
            return nextPhaseDuration;
          }

          return newTimeLeft;
        });
      }, 1000);
    };

    startBreathing();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      audioService.stopMusic();
      totalElapsedTimeRef.current = 0;
      onPhaseProgress(0); // Reset progress when cleaning up
    };
  }, [isActive, exercise, phase, onRoundComplete, onPhaseProgress]);

  const circleVariants = {
    inhale: {
      scale: 1.5,
      opacity: 1,
      transition: { duration: exercise.pattern.inhale }
    },
    hold: {
      scale: 1.5,
      opacity: 1,
      transition: { duration: exercise.pattern.hold || 0 }
    },
    exhale: {
      scale: 1,
      opacity: 0.5,
      transition: { duration: exercise.pattern.exhale }
    }
  };

  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      <motion.div
        className="absolute w-64 h-64 bg-primary/20 rounded-full"
        animate={phase}
        variants={circleVariants}
      />
      <motion.div
        className="absolute w-64 h-64 border-4 border-primary rounded-full"
        animate={phase}
        variants={circleVariants}
      />
      <div className="absolute flex flex-col items-center space-y-2">
        <div className="text-2xl font-light text-primary">
          {phase.charAt(0).toUpperCase() + phase.slice(1)}
        </div>
        <div className="text-4xl font-medium text-primary">
          {phaseTimeLeft}
        </div>
      </div>
    </div>
  );
}
