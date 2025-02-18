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
  const [currentScale, setCurrentScale] = useState(1);
  const [currentOpacity, setCurrentOpacity] = useState(0.5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get the duration for a given phase
  const getPhaseDuration = (phase: string) => {
    switch (phase) {
      case "inhale": return exercise.pattern.inhale;
      case "hold": return exercise.pattern.hold || 0;
      case "exhale": return exercise.pattern.exhale;
      default: return 0;
    }
  };

  // Calculate total duration of the current phase sequence
  const phaseSequenceDuration = (() => {
    let duration = exercise.pattern.inhale;
    if (exercise.pattern.hold) duration += exercise.pattern.hold;
    duration += exercise.pattern.exhale;
    return duration;
  })();

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const startBreathing = async () => {
      try {
        await audioService.init();
        await audioService.playMusic();
      } catch (error) {
        console.error('Failed to start meditation music:', error);
      }

      timerRef.current = setInterval(() => {
        setPhaseTimeLeft(current => {
          const newTimeLeft = Math.max(0, current - 0.05);

          // Calculate progress within the current phase
          const currentPhaseDuration = getPhaseDuration(phase);
          const elapsedInCurrentPhase = currentPhaseDuration - newTimeLeft;

          // Update scale and opacity based on the current phase
          if (phase === "inhale") {
            setCurrentScale(1 + (0.5 * (elapsedInCurrentPhase / exercise.pattern.inhale)));
            setCurrentOpacity(0.5 + (0.5 * (elapsedInCurrentPhase / exercise.pattern.inhale)));
          } else if (phase === "exhale") {
            setCurrentScale(1.5 - (0.5 * (elapsedInCurrentPhase / exercise.pattern.exhale)));
            setCurrentOpacity(1 - (0.5 * (elapsedInCurrentPhase / exercise.pattern.exhale)));
          }

          // Calculate total progress through the phase sequence
          let progressThroughSequence = (() => {
            switch (phase) {
              case "inhale": 
                return elapsedInCurrentPhase;
              case "hold": 
                return exercise.pattern.inhale + elapsedInCurrentPhase;
              case "exhale": 
                return exercise.pattern.inhale + (exercise.pattern.hold || 0) + elapsedInCurrentPhase;
              default: 
                return 0;
            }
          })();

          // Send normalized progress (0-1)
          onPhaseProgress(progressThroughSequence / phaseSequenceDuration);

          if (newTimeLeft === 0) {
            const nextPhase = (() => {
              switch (phase) {
                case "inhale": return exercise.pattern.hold ? "hold" : "exhale";
                case "hold": return "exhale";
                case "exhale": return "inhale";
              }
            })();

            setPhase(nextPhase);

            if (nextPhase === "inhale" && phase === "exhale") {
              onRoundComplete();
            }

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
  }, [isActive, exercise, phase, onRoundComplete, onPhaseProgress, phaseSequenceDuration]);

  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      <motion.div
        className="absolute w-64 h-64 bg-primary/20 rounded-full"
        animate={{
          scale: currentScale,
          opacity: currentOpacity,
        }}
        transition={{
          duration: isActive ? getPhaseDuration(phase) : 0
        }}
      />
      <motion.div
        className="absolute w-64 h-64 border-4 border-primary rounded-full"
        animate={{
          scale: currentScale,
          opacity: currentOpacity,
        }}
        transition={{
          duration: isActive ? getPhaseDuration(phase) : 0
        }}
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