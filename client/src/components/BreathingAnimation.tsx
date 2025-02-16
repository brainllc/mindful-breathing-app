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
  const startTimeRef = useRef<number>(0);
  const phaseStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const roundRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const { pattern } = exercise;
    const totalDuration = pattern.inhale + (pattern.hold || 0) + pattern.exhale + (pattern.holdEmpty || 0);

    const getPhaseDuration = (currentPhase: typeof phase) => {
      switch (currentPhase) {
        case "inhale": return pattern.inhale;
        case "hold": return pattern.hold || 0;
        case "exhale": return pattern.exhale;
        case "holdEmpty": return pattern.holdEmpty || 0;
        default: return 0;
      }
    };

    const getNextPhase = (currentPhase: typeof phase): typeof phase => {
      switch (currentPhase) {
        case "inhale": return pattern.hold ? "hold" : "exhale";
        case "hold": return "exhale";
        case "exhale": return pattern.holdEmpty ? "holdEmpty" : "inhale";
        case "holdEmpty": return "inhale";
        default: return "inhale";
      }
    };

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        phaseStartTimeRef.current = timestamp;
      }

      const elapsedInPhase = (timestamp - phaseStartTimeRef.current) / 1000;
      const totalElapsed = (timestamp - startTimeRef.current) / 1000;
      const currentPhaseDuration = getPhaseDuration(phase);

      // Update phase time left
      const timeLeft = Math.max(0, Math.ceil(currentPhaseDuration - elapsedInPhase));
      setPhaseTimeLeft(timeLeft);

      // Calculate and update overall progress
      const progress = totalElapsed % totalDuration;
      onPhaseProgress(progress);

      // Check for phase transition
      if (elapsedInPhase >= currentPhaseDuration) {
        const nextPhase = getNextPhase(phase);
        setPhase(nextPhase);
        phaseStartTimeRef.current = timestamp;

        // If we're completing a round
        if (nextPhase === "inhale" && phase === (pattern.holdEmpty ? "holdEmpty" : "exhale")) {
          roundRef.current += 1;
          onRoundComplete();
          startTimeRef.current = timestamp;
        }
      }

      // Continue animation
      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Start exercise
    const startExercise = async () => {
      try {
        await audioService.playMusic();
      } catch (error) {
        console.error('Failed to start meditation music:', error);
      }

      // Reset state
      startTimeRef.current = 0;
      phaseStartTimeRef.current = 0;
      roundRef.current = 0;
      setPhase("inhale");

      // Start animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    startExercise();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioService.stopMusic();
    };
  }, [isActive, exercise, onRoundComplete, onPhaseProgress]);

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