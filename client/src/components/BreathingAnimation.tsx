import { motion, AnimatePresence } from "framer-motion";
import { Exercise } from "@/lib/exercises";
import { useEffect, useState } from "react";

interface Props {
  exercise: Exercise;
  isActive: boolean;
  onRoundComplete: () => void;
}

export function BreathingAnimation({ exercise, isActive, onRoundComplete }: Props) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "holdEmpty">("inhale");
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const { pattern } = exercise;
    const totalTime = 
      pattern.inhale + 
      (pattern.hold || 0) + 
      pattern.exhale + 
      (pattern.holdEmpty || 0);

    const interval = 50; // 50ms intervals for smooth animation
    const steps = totalTime * (1000 / interval);
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setProgress(progress);

      // Calculate seconds left
      const timeLeft = Math.ceil((steps - currentStep) * (interval / 1000));
      setSecondsLeft(timeLeft);

      // Determine current phase
      const inhaleDuration = pattern.inhale / totalTime;
      const holdDuration = (pattern.hold || 0) / totalTime;
      const exhaleDuration = pattern.exhale / totalTime;

      if (progress < inhaleDuration) {
        setPhase("inhale");
      } else if (progress < inhaleDuration + holdDuration) {
        setPhase("hold");
      } else if (progress < inhaleDuration + holdDuration + exhaleDuration) {
        setPhase("exhale");
      } else {
        setPhase("holdEmpty");
      }

      if (currentStep >= steps) {
        onRoundComplete();
        currentStep = 0;
      }
    }, interval);

    return () => clearInterval(timer);
  }, [exercise, isActive, onRoundComplete]);

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
        <div className="text-xl font-medium text-primary/80">
          {secondsLeft}s
        </div>
      </div>
    </div>
  );
}