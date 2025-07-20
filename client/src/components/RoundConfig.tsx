import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface Props {
  defaultRounds: number;
  onStart: (rounds: number) => void;
  isStarted: boolean;
}

export function RoundConfig({ defaultRounds, onStart, isStarted }: Props) {
  const handleValueChange = (value: number[]) => {
    // Ensure minimum value is 1
    const roundsValue = Math.max(1, value[0]);
    onStart(roundsValue);
  };

  // Ensure defaultRounds is never less than 1
  const safeDefaultRounds = Math.max(1, defaultRounds);

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-muted-foreground">Number of Rounds</Label>
          <span className="text-2xl font-medium text-primary">{safeDefaultRounds}</span>
        </div>
        <div 
          className="relative" 
          onClick={(e) => {
            if (isStarted) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const value = Math.max(1, Math.round(1 + pos * 49)); // Scale to 1-50 range, ensure min 1
            handleValueChange([value]);
          }}
        >
          <Slider
            defaultValue={[safeDefaultRounds]}
            value={[safeDefaultRounds]}
            min={1}
            max={50}
            step={1}
            disabled={isStarted}
            onValueChange={handleValueChange}
            className="w-full cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}