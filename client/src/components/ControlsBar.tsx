import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Minus, Plus } from "lucide-react";
import { audioService } from "@/lib/audio";
import { useState } from "react";

interface Props {
  rounds: number;
  onRoundsChange: (rounds: number) => void;
  onPause: () => void;
  onEndSession: () => void;
}

export function ControlsBar({ rounds, onRoundsChange, onPause, onEndSession }: Props) {
  const [volume, setVolume] = useState(audioService.getVolume());
  const [isMuted, setIsMuted] = useState(false);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    audioService.setVolume(isMuted ? 0 : newVolume);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    audioService.setVolume(isMuted ? volume : 0);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border/50">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRoundsChange(Math.max(1, rounds - 1))}
          className="h-8 w-8"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-lg font-medium min-w-[4ch] text-center">{rounds}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRoundsChange(Math.min(10, rounds + 1))}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-8 w-px bg-border/50" />

      <div className="flex items-center gap-2 w-[140px]">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="text-primary hover:text-primary/80"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <Slider
          defaultValue={[volume]}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="flex-1"
        />
      </div>

      <div className="h-8 w-px bg-border/50" />

      <div className="flex items-center gap-4">
        <Button 
          variant="outline"
          size="sm"
          onClick={onPause}
        >
          Pause
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onEndSession}
        >
          End Session
        </Button>
      </div>
    </div>
  );
}
