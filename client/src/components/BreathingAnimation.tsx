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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      // Clear all intervals when not active
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const startExercise = async () => {
      try {
        await audioService.playMusic();
      } catch (error) {
        console.error('Failed to start meditation music:', error);
      }

      const { pattern } = exercise;
      let currentPhase = "inhale";
      let totalProgress = 0;

      // Set up progress updates (every 100ms)
      progressIntervalRef.current = setInterval(() => {
        const phaseDuration = (() => {
          switch (currentPhase) {
            case "inhale": return pattern.inhale;
            case "hold": return pattern.hold || 0;
            case "exhale": return pattern.exhale;
            case "holdEmpty": return pattern.holdEmpty || 0;
            default: return 0;
          }
        })();

        const totalDuration = pattern.inhale + 
                            (pattern.hold || 0) + 
                            pattern.exhale + 
                            (pattern.holdEmpty || 0);

        totalProgress = (totalProgress + 0.1) % totalDuration;
        onPhaseProgress(totalProgress);
      }, 100);

      // Function to schedule next phase
      const scheduleNextPhase = () => {
        const duration = (() => {
          switch (currentPhase) {
            case "inhale": return pattern.inhale;
            case "hold": return pattern.hold || 0;
            case "exhale": return pattern.exhale;
            case "holdEmpty": return pattern.holdEmpty || 0;
            default: return 0;
          }
        })() * 1000; // Convert to milliseconds

        // Update countdown every second
        let timeLeft = Math.ceil(duration / 1000);
        setPhaseTimeLeft(timeLeft);

        intervalRef.current = setInterval(() => {
          timeLeft--;
          setPhaseTimeLeft(Math.max(0, timeLeft));
        }, 1000);

        // Schedule phase transition
        phaseTimerRef.current = setTimeout(() => {
          if (intervalRef.current) clearInterval(intervalRef.current);

          // Determine next phase
          switch (currentPhase) {
            case "inhale":
              currentPhase = pattern.hold ? "hold" : "exhale";
              break;
            case "hold":
              currentPhase = "exhale";
              break;
            case "exhale":
              currentPhase = pattern.holdEmpty ? "holdEmpty" : "inhale";
              if (!pattern.holdEmpty) {
                onRoundComplete();
              }
              break;
            case "holdEmpty":
              currentPhase = "inhale";
              onRoundComplete();
              break;
          }

          setPhase(currentPhase);
          scheduleNextPhase();
        }, duration);
      };

      // Start the first phase
      setPhase(currentPhase);
      scheduleNextPhase();
    };

    startExercise();

    // Cleanup function
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
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