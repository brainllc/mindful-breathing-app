import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Exercise } from "@/lib/exercises";
import { Info, Timer, ListChecks, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  exercise: Exercise;
}

export function ExerciseInfoModal({ exercise }: Props) {
  const getTechniqueSteps = (exerciseId: string): string[] => {
    switch (exerciseId) {
      case "box-breathing":
        return [
          "Find a comfortable seated position with your back straight",
          "Inhale slowly through your nose for 4 seconds, filling your lungs completely",
          "Hold your breath for 4 seconds",
          "Exhale steadily through your mouth for 4 seconds",
          "Hold your breath out for 4 seconds",
          "Repeat this cycle for the desired number of rounds"
        ];
      case "4-7-8":
        return [
          "Sit comfortably with your back straight",
          "Place the tip of your tongue against the ridge behind your upper front teeth",
          "Exhale completely through your mouth, making a whoosh sound",
          "Close your mouth and inhale quietly through your nose for 4 seconds",
          "Hold your breath for 7 seconds",
          "Exhale completely through your mouth for 8 seconds",
          "Repeat this cycle for the recommended rounds"
        ];
      case "wim-hof":
        return [
          "Get into a comfortable position",
          "Take 30-40 deep breaths, inhaling through the nose and exhaling through the mouth",
          "On the last exhale, let all air out and hold for as long as possible",
          "When you need to breathe, take a deep breath and hold for 15 seconds",
          "Repeat for 3-4 rounds"
        ];
      default:
        return [
          "Find a quiet, comfortable place to sit or lie down",
          `Inhale for ${exercise.pattern.inhale} seconds`,
          exercise.pattern.hold ? `Hold your breath for ${exercise.pattern.hold} seconds` : null,
          `Exhale for ${exercise.pattern.exhale} seconds`,
          exercise.pattern.holdEmpty ? `Hold your breath out for ${exercise.pattern.holdEmpty} seconds` : null,
          "Repeat for the desired number of rounds"
        ].filter(Boolean) as string[];
    }
  };

  const techniqueSteps = getTechniqueSteps(exercise.id);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 gap-1">
          <Info className="w-4 h-4" />
          Learn about this exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {exercise.name}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {exercise.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 overflow-y-auto pr-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium text-primary">
              <ArrowRight className="w-5 h-5" />
              <h3>Technique</h3>
            </div>
            <div className="grid grid-cols-1 gap-3 pl-7">
              {techniqueSteps.map((step, index) => (
                <div key={index} className="p-3 rounded-lg border border-border/50 bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    {index + 1}. {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium text-primary">
              <ListChecks className="w-5 h-5" />
              <h3>Benefits</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 pl-7">
              {exercise.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-border/50 bg-muted/30 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  <p className="text-sm text-muted-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium text-primary">
              <Timer className="w-5 h-5" />
              <h3>Pattern Details</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pl-7">
              <div className="p-3 rounded-lg border border-border/50 bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground uppercase">Inhale</p>
                <p className="text-lg font-medium text-primary mt-1">{exercise.pattern.inhale}s</p>
              </div>
              {exercise.pattern.hold && (
                <div className="p-3 rounded-lg border border-border/50 bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground uppercase">Hold</p>
                  <p className="text-lg font-medium text-primary mt-1">{exercise.pattern.hold}s</p>
                </div>
              )}
              <div className="p-3 rounded-lg border border-border/50 bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground uppercase">Exhale</p>
                <p className="text-lg font-medium text-primary mt-1">{exercise.pattern.exhale}s</p>
              </div>
              {exercise.pattern.holdEmpty && (
                <div className="p-3 rounded-lg border border-border/50 bg-muted/30 text-center">
                  <p className="text-xs text-muted-foreground uppercase">Hold Empty</p>
                  <p className="text-lg font-medium text-primary mt-1">{exercise.pattern.holdEmpty}s</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}