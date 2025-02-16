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

  useEffect(() => {
    // Clear animation when not active
    if (!isActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      startTimeRef.current = null;
      return;
    }

    // Start exercise
    const startExercise = async () => {
      try {
        await audioService.playMusic();
      } catch (error) {
        console.error('Failed to start meditation music:', error);
      }

      // Calculate total round duration
      const { pattern } = exercise;
      const totalDuration = pattern.inhale + 
                          (pattern.hold || 0) + 
                          pattern.exhale + 
                          (pattern.holdEmpty || 0);

      // Create timestamp markers for phase transitions
      const phaseTimestamps = {
        inhale: pattern.inhale,
        hold: pattern.hold ? pattern.inhale + pattern.hold : null,
        exhale: pattern.inhale + (pattern.hold || 0) + pattern.exhale,
        holdEmpty: pattern.holdEmpty ? 
          pattern.inhale + (pattern.hold || 0) + pattern.exhale + pattern.holdEmpty 
          : null
      };

      const animate = (timestamp: number) => {
        // Initialize start time if needed
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }

        // Calculate progress
        const elapsed = (timestamp - startTimeRef.current) / 1000;
        const progress = elapsed % totalDuration;

        // Update progress bar
        onPhaseProgress(progress);

        // Determine current phase and time remaining
        let currentPhase: typeof phase = "inhale";
        let timeLeft = 0;

        if (progress < pattern.inhale) {
          currentPhase = "inhale";
          timeLeft = Math.ceil(pattern.inhale - progress);
        } else if (pattern.hold && progress < phaseTimestamps.hold!) {
          currentPhase = "hold";
          timeLeft = Math.ceil(phaseTimestamps.hold! - progress);
        } else if (progress < phaseTimestamps.exhale) {
          currentPhase = "exhale";
          timeLeft = Math.ceil(phaseTimestamps.exhale - progress);
        } else if (pattern.holdEmpty) {
          currentPhase = "holdEmpty";
          timeLeft = Math.ceil(totalDuration - progress);
        }

        // Update phase and time left
        setPhase(currentPhase);
        setPhaseTimeLeft(Math.max(0, timeLeft));

        // Check for round completion
        if (progress + 0.1 >= totalDuration) {
          startTimeRef.current = timestamp;
          onRoundComplete();
        }

        // Continue animation
        if (isActive) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

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