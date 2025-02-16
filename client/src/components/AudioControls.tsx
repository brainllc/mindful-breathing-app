import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";
import { audioService } from "@/lib/audio";

export function AudioControls() {
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
    <div className="w-full max-w-[300px] flex flex-col gap-2">
      <div className="text-sm text-muted-foreground mb-1">
        Background Music Volume
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="text-primary hover:text-primary/80"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
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
    </div>
  );
}