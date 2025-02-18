import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";
import { audioService } from '@/lib/audio';

interface AudioPlayerProps {
  isPlaying: boolean;
}

export function AudioPlayer({ isPlaying }: AudioPlayerProps) {
  const [volume, setVolume] = useState(audioService.getVolume());
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);

  // Subscribe to volume changes from the audio service
  useEffect(() => {
    const subscription = audioService.onVolumeChange((newVolume) => {
      setVolume(newVolume);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      audioService.playMusic().catch(error => {
        console.error('Failed to play audio:', error);
      });
    } else {
      audioService.stopMusic();
    }
  }, [isPlaying]);

  const toggleMute = () => {
    if (isMuted) {
      audioService.setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      audioService.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    audioService.setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg shadow-lg border flex items-center gap-4 z-50">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="h-8 w-8"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
      <div className="w-24">
        <Slider
          value={[volume * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          aria-label="Adjust volume"
        />
      </div>
    </div>
  );
}