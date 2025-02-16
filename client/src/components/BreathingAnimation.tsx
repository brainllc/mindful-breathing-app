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
  const lastProgressRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      startTimeRef.current = null;
      lastProgressRef.current = 0;
      return;
    }

    const { pattern } = exercise;
    const roundDuration = pattern.inhale + 
                        (pattern.hold || 0) + 
                        pattern.exhale + 
                        (pattern.holdEmpty || 0);

    const startAnimation = async () => {
      try {
        await audioService.playMusic();
      } catch (error) {
        console.error('Failed to start meditation music:', error);
      }

      const animate = (currentTime: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = currentTime;
        }

        const elapsedMs = currentTime - startTimeRef.current;
        const elapsedSecs = elapsedMs / 1000;

        // Calculate continuous progress (0 to roundDuration)
        const progress = elapsedSecs % roundDuration;

        // Only update if progress has changed significantly
        if (Math.abs(progress - lastProgressRef.current) > 0.01) {
          onPhaseProgress(progress);
          lastProgressRef.current = progress;
        }

        // Determine current phase
        let currentPhaseStart = 0;
        let currentPhaseEnd = pattern.inhale;
        let currentPhase: "inhale" | "hold" | "exhale" | "holdEmpty" = "inhale";

        if (progress >= currentPhaseEnd) {
          currentPhaseStart = currentPhaseEnd;
          currentPhaseEnd += pattern.hold || 0;
          currentPhase = "hold";
        }

        if (progress >= currentPhaseEnd) {
          currentPhaseStart = currentPhaseEnd;
          currentPhaseEnd += pattern.exhale;
          currentPhase = "exhale";
        }

        if (progress >= currentPhaseEnd && pattern.holdEmpty) {
          currentPhaseStart = currentPhaseEnd;
          currentPhaseEnd += pattern.holdEmpty;
          currentPhase = "holdEmpty";
        }

        setPhase(currentPhase);
        setPhaseTimeLeft(Math.ceil(currentPhaseEnd - progress));

        // Check for round completion
        if (progress + 0.05 >= roundDuration) {
          startTimeRef.current = currentTime;
          lastProgressRef.current = 0;
          onRoundComplete();
        }

        // Continue animation
        if (isActive) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    startAnimation();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      audioService.stopMusic();
      startTimeRef.current = null;
      lastProgressRef.current = 0;
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