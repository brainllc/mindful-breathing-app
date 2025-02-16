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

  // Use refs to track animation state
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (startTimeRef.current) startTimeRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const startAnimation = async () => {
      try {
        await audioService.playMusic();
      } catch (error) {
        console.error('Failed to start meditation music:', error);
      }

      const { pattern } = exercise;
      const totalDuration = pattern.inhale + 
                          (pattern.hold || 0) + 
                          pattern.exhale + 
                          (pattern.holdEmpty || 0);

      const animate = (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }

        const elapsedMs = timestamp - startTimeRef.current;
        const elapsedSecs = elapsedMs / 1000;
        const roundProgress = (elapsedSecs % totalDuration) / totalDuration;

        // Calculate overall progress for the round (0 to 1)
        onPhaseProgress(roundProgress * totalDuration);

        // Determine current phase and remaining time
        const timeIntoRound = elapsedSecs % totalDuration;

        if (timeIntoRound < pattern.inhale) {
          setPhase("inhale");
          setPhaseTimeLeft(Math.ceil(pattern.inhale - timeIntoRound));
        } else if (pattern.hold && timeIntoRound < (pattern.inhale + pattern.hold)) {
          setPhase("hold");
          setPhaseTimeLeft(Math.ceil(pattern.inhale + pattern.hold - timeIntoRound));
        } else if (timeIntoRound < (pattern.inhale + (pattern.hold || 0) + pattern.exhale)) {
          setPhase("exhale");
          setPhaseTimeLeft(Math.ceil(pattern.inhale + (pattern.hold || 0) + pattern.exhale - timeIntoRound));
        } else if (pattern.holdEmpty) {
          setPhase("holdEmpty");
          setPhaseTimeLeft(Math.ceil(totalDuration - timeIntoRound));
        }

        // Check for round completion
        if (timeIntoRound + 0.05 >= totalDuration) {
          onRoundComplete();
          startTimeRef.current = timestamp; // Reset timestamp for next round
        }

        // Continue animation if still active
        if (isActive) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      // Start animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    startAnimation();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      audioService.stopMusic();
      startTimeRef.current = null;
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