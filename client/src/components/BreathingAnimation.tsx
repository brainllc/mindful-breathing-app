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
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "holdEmpty">("inhale");
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(exercise.pattern.inhale);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      progressRef.current = 0;
      // Reset to initial phase and time when stopped
      setPhase("inhale");
      setPhaseTimeLeft(exercise.pattern.inhale);
      return;
    }

    const startBreathing = async () => {
      try {
        await audioService.playMusic();
      } catch (error) {
        console.error('Failed to start meditation music:', error);
      }

      const { pattern } = exercise;

      // Get duration for current phase
      const getCurrentPhaseDuration = () => {
        switch (phase) {
          case "inhale": return pattern.inhale;
          case "hold": return pattern.hold || 0;
          case "exhale": return pattern.exhale;
          case "holdEmpty": return pattern.holdEmpty || 0;
        }
      };

      // Get next phase
      const getNextPhase = () => {
        switch (phase) {
          case "inhale": return pattern.hold ? "hold" : "exhale";
          case "hold": return "exhale";
          case "exhale": return pattern.holdEmpty ? "holdEmpty" : "inhale";
          case "holdEmpty": return "inhale";
          default: return "inhale";
        }
      };

      // Initialize new phase
      const startNewPhase = () => {
        const nextPhase = getNextPhase();
        setPhase(nextPhase);
        const nextPhaseDuration = (() => {
          switch (nextPhase) {
            case "inhale": return pattern.inhale;
            case "hold": return pattern.hold || 0;
            case "exhale": return pattern.exhale;
            case "holdEmpty": return pattern.holdEmpty || 0;
          }
        })();
        setPhaseTimeLeft(nextPhaseDuration);
        return nextPhaseDuration;
      };

      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Start the timer that handles both countdown and phase transitions
      timerRef.current = setInterval(() => {
        setPhaseTimeLeft(current => {
          const newTimeLeft = current - 1;

          if (newTimeLeft <= 0) {
            const nextPhase = getNextPhase();
            setPhase(nextPhase);

            // If transitioning back to inhale, complete the round
            if (nextPhase === "inhale" && phase === (pattern.holdEmpty ? "holdEmpty" : "exhale")) {
              onRoundComplete();
              progressRef.current = 0;
            }

            // Start new phase
            const newPhaseDuration = (() => {
              switch (nextPhase) {
                case "inhale": return pattern.inhale;
                case "hold": return pattern.hold || 0;
                case "exhale": return pattern.exhale;
                case "holdEmpty": return pattern.holdEmpty || 0;
              }
            })();
            return newPhaseDuration;
          }

          // Update progress
          progressRef.current += 1;
          const totalDuration = pattern.inhale + (pattern.hold || 0) + pattern.exhale + (pattern.holdEmpty || 0);
          onPhaseProgress(progressRef.current % totalDuration);

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
      progressRef.current = 0;
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
    },
    holdEmpty: {
      scale: 1,
      opacity: 0.5,
      transition: { duration: exercise.pattern.holdEmpty || 0 }
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