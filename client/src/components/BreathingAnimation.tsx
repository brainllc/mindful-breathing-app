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
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);

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

      // Determine current phase and its duration
      const inhaleDuration = pattern.inhale;
      const holdDuration = pattern.hold || 0;
      const exhaleDuration = pattern.exhale;
      const holdEmptyDuration = pattern.holdEmpty || 0;

      const timeInPhase = (currentStep * interval) / 1000; // Current time in seconds

      if (progress < pattern.inhale / totalTime) {
        setPhase("inhale");
        setPhaseTimeLeft(Math.ceil(inhaleDuration - timeInPhase));
      } else if (progress < (pattern.inhale + (pattern.hold || 0)) / totalTime) {
        setPhase("hold");
        setPhaseTimeLeft(Math.ceil(holdDuration - (timeInPhase - inhaleDuration)));
      } else if (progress < (pattern.inhale + (pattern.hold || 0) + pattern.exhale) / totalTime) {
        setPhase("exhale");
        setPhaseTimeLeft(Math.ceil(exhaleDuration - (timeInPhase - inhaleDuration - holdDuration)));
      } else {
        setPhase("holdEmpty");
        setPhaseTimeLeft(Math.ceil(holdEmptyDuration - (timeInPhase - inhaleDuration - holdDuration - exhaleDuration)));
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
        <div className="text-4xl font-medium text-primary">
          {phaseTimeLeft}
        </div>
      </div>
    </div>
  );
}