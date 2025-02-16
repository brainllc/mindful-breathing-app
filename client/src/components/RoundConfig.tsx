import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface Props {
  defaultRounds: number;
  onStart: (rounds: number) => void;
  isStarted: boolean;
}

export function RoundConfig({ defaultRounds, onStart, isStarted }: Props) {
  const [rounds, setRounds] = useState(defaultRounds);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rounds" className="text-muted-foreground">
          Number of Rounds
        </Label>
        <Input
          id="rounds"
          type="number"
          value={rounds}
          onChange={(e) => setRounds(Number(e.target.value))}
          min={1}
          max={10}
          disabled={isStarted}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Choose between 1-10 rounds for your session
        </p>
      </div>
    </div>
  );
}