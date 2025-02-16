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
    <div className="absolute top-4 right-4 flex items-center gap-2 w-32">
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
  );
}