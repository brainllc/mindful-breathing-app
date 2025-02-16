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
  const elapsedTimeRef = useRef(0);
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const startBreathing = async () => {
      try {
        await audioService.playMusic();
      } catch (error) {
        console.error('Failed to start meditation music:', error);
      }

      const { pattern } = exercise;

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

      // Start the timer with a shorter interval for smoother progress
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const deltaTime = (now - lastUpdateRef.current) / 1000; // Convert to seconds
        lastUpdateRef.current = now;

        // Update elapsed time and progress smoothly
        elapsedTimeRef.current += deltaTime;
        onPhaseProgress(elapsedTimeRef.current);

        // Update phase countdown
        setPhaseTimeLeft(current => {
          const newTimeLeft = current - deltaTime;

          if (newTimeLeft <= 0) {
            const nextPhase = getNextPhase();
            setPhase(nextPhase);

            // If transitioning back to inhale, complete the round
            if (nextPhase === "inhale" && phase === "exhale") {
              onRoundComplete();
            }

            // Set duration for next phase
            return (() => {
              switch (nextPhase) {
                case "inhale": return pattern.inhale;
                case "hold": return pattern.hold || 0;
                case "exhale": return pattern.exhale;
              }
            })();
          }

          return newTimeLeft;
        });
      }, 50); // Update every 50ms for smooth animation
    };

    startBreathing();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      audioService.stopMusic();
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
          {Math.ceil(phaseTimeLeft)}
        </div>
      </div>
    </div>
  );
}