import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface Props {
  defaultRounds: number;
  onStart: (rounds: number) => void;
  isStarted: boolean;
}

export function RoundConfig({ defaultRounds, onStart, isStarted }: Props) {
  const handleValueChange = (value: number[]) => {
    onStart(value[0]);
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-muted-foreground">Number of Rounds</Label>
          <span className="text-2xl font-medium text-primary">{defaultRounds}</span>
        </div>
        <div 
          className="relative" 
          onClick={(e) => {
            if (isStarted) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const value = Math.round(1 + pos * 9); // Scale to 1-10 range
            handleValueChange([value]);
          }}
        >
          <Slider
            defaultValue={[defaultRounds]}
            min={1}
            max={10}
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