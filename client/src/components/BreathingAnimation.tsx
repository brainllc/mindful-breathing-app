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

  // Use refs to track the animation
  const startTimeRef = useRef<number>();
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const startExercise = async () => {
      if (!isActive) return;

      try {
        await audioService.playMusic();
        console.log('Started meditation music');
      } catch (error) {
        console.error('Failed to start meditation music:', error);
      }

      const { pattern } = exercise;
      const totalTime = pattern.inhale + 
                       (pattern.hold || 0) + 
                       pattern.exhale + 
                       (pattern.holdEmpty || 0);

      const animate = (timestamp: number) => {
        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }

        const elapsed = (timestamp - startTimeRef.current) / 1000; // Convert to seconds
        const progress = elapsed % totalTime;

        // Report smooth progress to parent
        onPhaseProgress(progress);

        // Determine current phase and time left
        if (progress < pattern.inhale) {
          setPhase("inhale");
          setPhaseTimeLeft(Math.ceil(pattern.inhale - progress));
        } else if (pattern.hold && progress < (pattern.inhale + pattern.hold)) {
          setPhase("hold");
          setPhaseTimeLeft(Math.ceil(pattern.inhale + pattern.hold - progress));
        } else if (progress < (pattern.inhale + (pattern.hold || 0) + pattern.exhale)) {
          setPhase("exhale");
          setPhaseTimeLeft(Math.ceil(pattern.inhale + (pattern.hold || 0) + pattern.exhale - progress));
        } else if (pattern.holdEmpty) {
          setPhase("holdEmpty");
          setPhaseTimeLeft(Math.ceil(totalTime - progress));
        }

        // Check if round is complete
        if (progress + 0.1 >= totalTime) {
          startTimeRef.current = timestamp;
          onRoundComplete();
        }

        if (isActive) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    startExercise();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioService.stopMusic();
      startTimeRef.current = undefined;
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