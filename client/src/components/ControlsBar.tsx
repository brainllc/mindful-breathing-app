import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Minus, Plus, Settings2, Play, Pause } from "lucide-react";
import { audioService } from "@/lib/audio";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface Props {
  rounds: number;
  onRoundsChange: (rounds: number) => void;
  onPause: () => void;
  onEndSession: () => void;
  isPaused?: boolean;
  currentRound: number;
}

export function ControlsBar({ 
  rounds, 
  onRoundsChange, 
  onPause, 
  onEndSession, 
  isPaused = false,
  currentRound 
}: Props) {
  const [volume, setVolume] = useState(audioService.getVolume());
  const [isMuted, setIsMuted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    audioService.setVolume(isMuted ? 0 : newVolume);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    audioService.setVolume(isMuted ? volume : 0);
  };

  const handleRoundsIncrease = () => {
    if (rounds >= 50) {
      toast({
        title: "Maximum Rounds Reached",
        description: "Cannot set more than 50 rounds.",
        variant: "destructive",
      });
      return;
    }
    onRoundsChange(rounds + 1);
  };

  return (
    <>
      {/* Mobile View */}
      <div id="controls-bar" className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="icon" className="rounded-full shadow-lg">
              <Settings2 className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="px-4 py-6">
            <div className="space-y-6 w-full">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground text-center">Number of Rounds</div>
                <div className="flex items-center gap-4 w-full justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRoundsChange(rounds - 1)}
                    disabled={rounds <= currentRound}
                    className="h-8 w-8"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium min-w-[4ch] text-center">{rounds}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRoundsIncrease}
                    className="h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Volume</div>
                <div className="flex items-center gap-2 w-full justify-center">
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
              </div>

              <div className="flex items-center gap-4 w-full justify-center">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={onPause}
                >
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  )}
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
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop View */}
      <div id="controls-bar" className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 hidden md:block pointer-events-none">
        <div className="flex items-center gap-8 bg-card/50 backdrop-blur-sm px-6 py-3 rounded-full border border-border/50 pointer-events-auto">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground text-center">Rounds</div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRoundsChange(rounds - 1)}
                disabled={rounds <= currentRound}
                className="h-8 w-8"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium min-w-[4ch] text-center">{rounds}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRoundsIncrease}
                className="h-8 w-8"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
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
      </div>
    </>
  );
}