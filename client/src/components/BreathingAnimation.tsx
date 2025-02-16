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
  const startTimeRef = useRef<number | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (phaseTimerRef.current) {
        clearInterval(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
      startTimeRef.current = null;
      return;
    }

    const startBreathing = async () => {
      try {
        await audioService.playMusic();
      } catch (error) {
        console.error('Failed to start meditation music:', error);
      }

      // Initialize start time if not set
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      // Progress timer - runs independently of phase changes
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = (now - (startTimeRef.current || now)) / 1000;
        onPhaseProgress(elapsedSeconds);
      }, 50); // Update progress every 50ms

      // Phase timer - handles breathing phase changes
      phaseTimerRef.current = setInterval(() => {
        setPhaseTimeLeft(current => {
          const newTimeLeft = current - 0.1; // Decrement by 0.1 seconds

          if (newTimeLeft <= 0) {
            const nextPhase = (() => {
              switch (phase) {
                case "inhale": return exercise.pattern.hold ? "hold" : "exhale";
                case "hold": return "exhale";
                case "exhale": return "inhale";
              }
            })();

            setPhase(nextPhase);

            // If transitioning back to inhale, complete the round
            if (nextPhase === "inhale" && phase === "exhale") {
              onRoundComplete();
            }

            // Return duration for next phase
            return (() => {
              switch (nextPhase) {
                case "inhale": return exercise.pattern.inhale;
                case "hold": return exercise.pattern.hold || 0;
                case "exhale": return exercise.pattern.exhale;
              }
            })();
          }

          return newTimeLeft;
        });
      }, 100); // Update phase timer every 100ms
    };

    startBreathing();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (phaseTimerRef.current) {
        clearInterval(phaseTimerRef.current);
        phaseTimerRef.current = null;
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