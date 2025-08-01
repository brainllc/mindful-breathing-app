import { motion } from "framer-motion";
import { Exercise } from "@/lib/exercises";
import { useEffect, useState, useRef } from "react";
import { audioService } from "@/lib/audio";

interface Props {
  exercise: Exercise;
  isActive: boolean;
  currentRound: number;
  onRoundComplete: () => void;
  onPhaseProgress: (progress: number) => void;
}

export function BreathingAnimation({ exercise, isActive, currentRound, onRoundComplete, onPhaseProgress }: Props) {
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(exercise.pattern.inhale);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const animationRef = useRef<{
    scale: number;
    opacity: number;
  }>({ scale: 1, opacity: 0.5 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Track if this is the first time the component becomes active (not a resume)
  const [hasStarted, setHasStarted] = useState(false);
  
  // Reset round completion when exercise starts or round changes
  useEffect(() => {
    if (isActive && !hasStarted) {
      // First time starting - reset everything
      setRoundCompleted(false);
      setPhase("inhale");
      setPhaseTimeLeft(exercise.pattern.inhale);
      setHasStarted(true);
    } else if (isActive && hasStarted) {
      // Resuming - don't reset state, just clear round completion if needed
      setRoundCompleted(false);
    }
  }, [isActive, hasStarted]);

  // Reset hasStarted when round changes (new round should start from beginning)
  useEffect(() => {
    setHasStarted(false);
    setRoundCompleted(false);
    setPhase("inhale");
    setPhaseTimeLeft(exercise.pattern.inhale);
  }, [currentRound, exercise.pattern.inhale]);

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
  const phaseSequenceDuration = exercise.pattern.inhale + 
    (exercise.pattern.hold || 0) + 
    exercise.pattern.exhale;

  useEffect(() => {
    if (!isActive || roundCompleted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const updateInterval = 50; // Update every 50ms
    const stepSize = updateInterval / 1000; // Convert to seconds

    intervalRef.current = setInterval(() => {
      setPhaseTimeLeft(current => {
        const newTimeLeft = Math.max(0, current - stepSize);

        // Calculate progress within the current phase
        const currentPhaseDuration = getPhaseDuration(phase);
        const elapsedInCurrentPhase = currentPhaseDuration - newTimeLeft;

        // Update animation reference based on the current phase
        if (phase === "inhale") {
          animationRef.current = {
            scale: 1 + (0.5 * (elapsedInCurrentPhase / exercise.pattern.inhale)),
            opacity: 0.5 + (0.5 * (elapsedInCurrentPhase / exercise.pattern.inhale))
          };
        } else if (phase === "hold") {
          animationRef.current = {
            scale: 1.5,
            opacity: 1
          };
        } else if (phase === "exhale") {
          animationRef.current = {
            scale: 1.5 - (0.5 * (elapsedInCurrentPhase / exercise.pattern.exhale)),
            opacity: 1 - (0.5 * (elapsedInCurrentPhase / exercise.pattern.exhale))
          };
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

        // Send normalized progress (0-1) only if round not completed
        if (!roundCompleted) {
          onPhaseProgress(progressThroughSequence / phaseSequenceDuration);
        }

        if (newTimeLeft === 0) {
          // Determine next phase
          const nextPhase = (() => {
            switch (phase) {
              case "inhale": return exercise.pattern.hold ? "hold" : "exhale";
              case "hold": return "exhale";
              case "exhale": return "inhale";
            }
          })();

          // If we're completing a full cycle (exhale -> inhale)
          if (nextPhase === "inhale" && phase === "exhale") {
            setRoundCompleted(true);
            // Send final progress as 1.0 (100% complete)
            onPhaseProgress(1.0);
            // Call round complete after a small delay to ensure progress is set
            setTimeout(() => {
              onRoundComplete();
            }, 10);
            return current; // Don't update the time, keep it at 0
          }

          setPhase(nextPhase);
          return getPhaseDuration(nextPhase);
        }

        return newTimeLeft;
      });
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, exercise, phase, onRoundComplete, onPhaseProgress, phaseSequenceDuration, roundCompleted]);

  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      <motion.div
        className="absolute w-64 h-64 bg-primary/20 rounded-full"
        animate={animationRef.current}
        transition={{ duration: 0 }}
      />
      <motion.div
        className="absolute w-64 h-64 border-4 border-primary rounded-full"
        animate={animationRef.current}
        transition={{ duration: 0 }}
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