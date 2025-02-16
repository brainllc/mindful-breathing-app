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
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      progressRef.current = 0;
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

      // Initialize phase
      let timeLeft = getCurrentPhaseDuration();
      setPhaseTimeLeft(timeLeft);

      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Start the timer that handles both countdown and phase transitions
      timerRef.current = setInterval(() => {
        timeLeft -= 1;
        setPhaseTimeLeft(timeLeft);

        // Update progress
        progressRef.current += 1;
        const totalDuration = pattern.inhale + (pattern.hold || 0) + pattern.exhale + (pattern.holdEmpty || 0);
        onPhaseProgress(progressRef.current % totalDuration);

        // Check for phase transition
        if (timeLeft <= 0) {
          const nextPhase = getNextPhase();
          setPhase(nextPhase);

          // If transitioning back to inhale, complete the round
          if (nextPhase === "inhale" && phase === (pattern.holdEmpty ? "holdEmpty" : "exhale")) {
            onRoundComplete();
            progressRef.current = 0;
          }

          // Set up next phase
          timeLeft = getCurrentPhaseDuration();
          setPhaseTimeLeft(timeLeft);
        }
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
          {phaseTimeLeft > 0 ? phaseTimeLeft : ""}
        </div>
      </div>
    </div>
  );
}