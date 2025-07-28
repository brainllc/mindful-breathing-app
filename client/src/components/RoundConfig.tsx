import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface Props {
  defaultRounds: number;
  onStart: (rounds: number) => void;
  isStarted: boolean;
}

export function RoundConfig({ defaultRounds, onStart, isStarted }: Props) {
  const handleValueChange = (value: number[]) => {
    // Ensure value is between 1 and 50 (hard caps)
    const roundsValue = Math.max(1, Math.min(50, value[0]));
    onStart(roundsValue);
  };

  // Ensure defaultRounds is between 1 and 50
  const safeDefaultRounds = Math.max(1, Math.min(50, defaultRounds));

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
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); // Clamp position between 0 and 1
            const value = Math.max(1, Math.min(50, Math.round(1 + pos * 49))); // Scale to 1-50 range with hard caps
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