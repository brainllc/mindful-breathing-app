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
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(exercise.pattern.inhale);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentRoundDurationRef = useRef(0);

  // Calculate phase duration
  const getPhaseDuration = (phase: string) => {
    switch (phase) {
      case "inhale": return exercise.pattern.inhale;
      case "hold": return exercise.pattern.hold || 0;
      case "exhale": return exercise.pattern.exhale;
      default: return 0;
    }
  };

  // Calculate total duration of a single round
  const roundDuration = exercise.pattern.inhale + 
    (exercise.pattern.hold || 0) + 
    exercise.pattern.exhale;

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      currentRoundDurationRef.current = 0;
      return;
    }

    const startBreathing = async () => {
      try {
        await audioService.playMusic();
      } catch (error) {
        console.error('Failed to start meditation music:', error);
      }

      timerRef.current = setInterval(() => {
        setPhaseTimeLeft(current => {
          const newTimeLeft = Math.max(0, current - 0.05);

          // Update progress based on completed duration within the current round
          const phaseDuration = getPhaseDuration(phase);
          const phaseProgress = phaseDuration - newTimeLeft;
          currentRoundDurationRef.current = (() => {
            switch (phase) {
              case "inhale": return phaseProgress;
              case "hold": return exercise.pattern.inhale + phaseProgress;
              case "exhale": return exercise.pattern.inhale + (exercise.pattern.hold || 0) + phaseProgress;
              default: return 0;
            }
          })();

          onPhaseProgress(currentRoundDurationRef.current / roundDuration);

          if (newTimeLeft === 0) {
            const nextPhase = (() => {
              switch (phase) {
                case "inhale": return exercise.pattern.hold ? "hold" : "exhale";
                case "hold": return "exhale";
                case "exhale": return "inhale";
              }
            })();

            setPhase(nextPhase);

            // If transitioning back to inhale, complete the round
            if (nextPhase === "inhale" && phase === "exhale") {
              currentRoundDurationRef.current = 0;
              onRoundComplete();
            }

            // Return duration for next phase
            return getPhaseDuration(nextPhase);
          }

          return newTimeLeft;
        });
      }, 50); // Update every 50ms for smooth animation
    };

    startBreathing();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      audioService.stopMusic();
    };
  }, [isActive, exercise, phase, onRoundComplete, onPhaseProgress, roundDuration]);

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
          {Math.ceil(phaseTimeLeft)}
        </div>
      </div>
    </div>
  );
}