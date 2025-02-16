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
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const phaseStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      startTimeRef.current = null;
      phaseStartTimeRef.current = null;
      return;
    }

    const resetAnimation = () => {
      startTimeRef.current = null;
      phaseStartTimeRef.current = null;
      setPhase("inhale");
    };

    const { pattern } = exercise;
    const roundDuration = pattern.inhale + (pattern.hold || 0) + pattern.exhale + (pattern.holdEmpty || 0);

    const startAnimation = async () => {
      try {
        await audioService.playMusic();
      } catch (error) {
        console.error('Failed to start meditation music:', error);
      }

      const animate = (currentTime: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = currentTime;
          phaseStartTimeRef.current = currentTime;
        }

        const totalElapsed = (currentTime - startTimeRef.current) / 1000;
        const phaseElapsed = (currentTime - phaseStartTimeRef.current!) / 1000;

        // Calculate overall progress for the round
        const roundProgress = totalElapsed % roundDuration;
        onPhaseProgress(roundProgress);

        // Handle phase transitions
        const updatePhase = () => {
          let nextPhase: typeof phase = phase;
          let phaseDuration = 0;

          switch (phase) {
            case "inhale":
              phaseDuration = pattern.inhale;
              if (phaseElapsed >= phaseDuration) {
                nextPhase = pattern.hold ? "hold" : "exhale";
              }
              break;
            case "hold":
              phaseDuration = pattern.hold || 0;
              if (phaseElapsed >= phaseDuration) {
                nextPhase = "exhale";
              }
              break;
            case "exhale":
              phaseDuration = pattern.exhale;
              if (phaseElapsed >= phaseDuration) {
                nextPhase = pattern.holdEmpty ? "holdEmpty" : "inhale";
              }
              break;
            case "holdEmpty":
              phaseDuration = pattern.holdEmpty || 0;
              if (phaseElapsed >= phaseDuration) {
                nextPhase = "inhale";
              }
              break;
          }

          if (nextPhase !== phase) {
            setPhase(nextPhase);
            phaseStartTimeRef.current = currentTime;

            // If we're completing a round
            if (nextPhase === "inhale" && phase === (pattern.holdEmpty ? "holdEmpty" : "exhale")) {
              onRoundComplete();
              startTimeRef.current = currentTime;
            }
          }

          return { phaseDuration };
        };

        const { phaseDuration } = updatePhase();
        setPhaseTimeLeft(Math.ceil(phaseDuration - phaseElapsed));

        if (isActive) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      resetAnimation();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    startAnimation();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      audioService.stopMusic();
      resetAnimation();
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