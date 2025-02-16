import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Exercise } from "@/lib/exercises";
import { Info } from "lucide-react";
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

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-lg mb-2">How to Perform</h3>
            <div className="space-y-2 text-muted-foreground">
              {exercise.id === "box-breathing" && (
                <>
                  <p>1. Find a comfortable seated position with your back straight</p>
                  <p>2. Inhale slowly through your nose for 4 seconds, filling your lungs completely</p>
                  <p>3. Hold your breath for 4 seconds</p>
                  <p>4. Exhale steadily through your mouth for 4 seconds</p>
                  <p>5. Hold your breath out for 4 seconds</p>
                  <p>6. Repeat this cycle for the desired number of rounds</p>
                </>
              )}
              {exercise.id === "4-7-8" && (
                <>
                  <p>1. Sit comfortably with your back straight</p>
                  <p>2. Place the tip of your tongue against the ridge behind your upper front teeth</p>
                  <p>3. Exhale completely through your mouth, making a whoosh sound</p>
                  <p>4. Close your mouth and inhale quietly through your nose for 4 seconds</p>
                  <p>5. Hold your breath for 7 seconds</p>
                  <p>6. Exhale completely through your mouth for 8 seconds</p>
                  <p>7. Repeat this cycle for the recommended rounds</p>
                </>
              )}
              {/* Add instructions for other exercises */}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-2">Benefits</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {exercise.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-2">Safety Guidelines</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Start slowly and build up gradually</li>
              <li>Practice in a quiet, comfortable environment</li>
              <li>Stop if you feel lightheaded or dizzy</li>
              <li>Breathe at a pace that feels natural to you</li>
              <li>Do not force or strain your breathing</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-2">Pattern Details</h3>
            <div className="space-y-1 text-muted-foreground">
              <p>Inhale: {exercise.pattern.inhale} seconds</p>
              {exercise.pattern.hold && <p>Hold: {exercise.pattern.hold} seconds</p>}
              <p>Exhale: {exercise.pattern.exhale} seconds</p>
              {exercise.pattern.holdEmpty && <p>Hold Empty: {exercise.pattern.holdEmpty} seconds</p>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
