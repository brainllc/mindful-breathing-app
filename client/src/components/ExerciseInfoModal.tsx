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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          <Info className="w-4 h-4 mr-2" />
          Learn about this exercise
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {exercise.name}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {exercise.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-medium text-primary">
              <ArrowRight className="w-5 h-5" />
              <h3>Technique</h3>
            </div>
            <div className="grid grid-cols-1 gap-3 pl-7">
              {exercise.id === "box-breathing" && (
                <>
                  <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-sm text-muted-foreground">1. Find a comfortable seated position with your back straight</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-sm text-muted-foreground">2. Inhale slowly through your nose for 4 seconds, filling your lungs completely</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-sm text-muted-foreground">3. Hold your breath for 4 seconds</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-sm text-muted-foreground">4. Exhale steadily through your mouth for 4 seconds</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-sm text-muted-foreground">5. Hold your breath out for 4 seconds</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-sm text-muted-foreground">6. Repeat this cycle for the desired number of rounds</p>
                  </div>
                </>
              )}
              {exercise.id === "4-7-8" && (
                <>
                  <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-sm text-muted-foreground">1. Sit comfortably with your back straight</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-sm text-muted-foreground">2. Place the tip of your tongue against the ridge behind your upper front teeth</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-sm text-muted-foreground">3. Exhale completely through your mouth, making a whoosh sound</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-sm text-muted-foreground">4. Close your mouth and inhale quietly through your nose for 4 seconds</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-sm text-muted-foreground">5. Hold your breath for 7 seconds</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-sm text-muted-foreground">6. Exhale completely through your mouth for 8 seconds</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                    <p className="text-sm text-muted-foreground">7. Repeat this cycle for the recommended rounds</p>
                  </div>
                </>
              )}
              {/* Add instructions for other exercises */}
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
              <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                <p className="text-xs text-muted-foreground uppercase">Inhale</p>
                <p className="text-lg font-medium text-primary mt-1">{exercise.pattern.inhale}s</p>
              </div>
              {exercise.pattern.hold && (
                <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                  <p className="text-xs text-muted-foreground uppercase">Hold</p>
                  <p className="text-lg font-medium text-primary mt-1">{exercise.pattern.hold}s</p>
                </div>
              )}
              <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                <p className="text-xs text-muted-foreground uppercase">Exhale</p>
                <p className="text-lg font-medium text-primary mt-1">{exercise.pattern.exhale}s</p>
              </div>
              {exercise.pattern.holdEmpty && (
                <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
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