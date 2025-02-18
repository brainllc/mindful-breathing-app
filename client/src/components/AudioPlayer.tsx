import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  isPlaying: boolean;
}

export function AudioPlayer({ isPlaying }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Audio playback failed:", error);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg shadow-lg border flex items-center gap-4 z-50">
      <audio
        ref={audioRef}
        src="/meditation.mp3"
        loop
        preload="auto"
        controls={false}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMute}
        className="h-8 w-8"
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
      <div className="w-24">
        <Slider
          value={[volume * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={(value) => setVolume(value[0] / 100)}
        />
      </div>
    </div>
  );
}
