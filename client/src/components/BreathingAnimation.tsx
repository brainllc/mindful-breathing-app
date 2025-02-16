import { motion } from "framer-motion";
import { Exercise } from "@/lib/exercises";
import { useEffect, useState, useRef } from "react";
import { audioService } from "@/lib/audio";

interface Props {
  exercise: Exercise;
  isActive: boolean;
  onRoundComplete: () => void;
}

export function BreathingAnimation({ exercise, isActive, onRoundComplete }: Props) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "holdEmpty">("inhale");
  const [progress, setProgress] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);

  // Use refs to track the interval ID and current step
  const intervalRef = useRef<number>();
  const currentStepRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;

    const { pattern } = exercise;
    const totalTime =
      pattern.inhale +
      (pattern.hold || 0) +
      pattern.exhale +
      (pattern.holdEmpty || 0);

    const interval = 1000; // 1 second intervals for counting
    const steps = totalTime;

    intervalRef.current = window.setInterval(() => {
      currentStepRef.current++;
      const progress = currentStepRef.current / steps;

      // Determine current phase and its duration
      const inhaleDuration = pattern.inhale;
      const holdDuration = pattern.hold || 0;
      const exhaleDuration = pattern.exhale;
      const holdEmptyDuration = pattern.holdEmpty || 0;

      const timeInPhase = currentStepRef.current;
      const previousPhase = phase;

      // Play the current number based on which phase we're in
      if (progress < pattern.inhale / totalTime) {
        setPhase("inhale");
        const timeLeft = Math.ceil(inhaleDuration - (timeInPhase));
        setPhaseTimeLeft(timeLeft);

        if (timeLeft <= 10) { // Only count the last 10 seconds
          audioService.playNumber(timeLeft);
        }
      } else if (progress < (pattern.inhale + (pattern.hold || 0)) / totalTime) {
        setPhase("hold");
        const timeLeft = Math.ceil(holdDuration - (timeInPhase - inhaleDuration));
        setPhaseTimeLeft(timeLeft);

        if (timeLeft <= 10) {
          audioService.playNumber(timeLeft);
        }
      } else if (progress < (pattern.inhale + (pattern.hold || 0) + pattern.exhale) / totalTime) {
        setPhase("exhale");
        const timeLeft = Math.ceil(exhaleDuration - (timeInPhase - inhaleDuration - holdDuration));
        setPhaseTimeLeft(timeLeft);

        if (timeLeft <= 10) {
          audioService.playNumber(timeLeft);
        }
      } else {
        setPhase("holdEmpty");
        const timeLeft = Math.ceil(holdEmptyDuration - (timeInPhase - inhaleDuration - holdDuration - exhaleDuration));
        setPhaseTimeLeft(timeLeft);

        if (timeLeft <= 10) {
          audioService.playNumber(timeLeft);
        }
      }

      if (currentStepRef.current >= steps) {
        currentStepRef.current = 0;
        onRoundComplete();
      }
    }, interval);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [isActive, exercise, onRoundComplete]);

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