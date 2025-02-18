import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.3);
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private initialized = false;
  private fadeOutTimeout: NodeJS.Timeout | null = null;

  constructor() {
    console.log('Audio service created, waiting for initialization...');
  }

  async init() {
    if (this.initialized) return;

    try {
      console.log('Initializing audio context...');
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.volume.value;

      // Create audio element with looping enabled
      this.audioElement = new Audio('/meditation.mp3');
      this.audioElement.loop = true; // Enable seamless looping
      this.audioElement.crossOrigin = 'anonymous';

      // Connect audio element to Web Audio API
      this.mediaSource = this.audioContext.createMediaElementSource(this.audioElement);
      this.mediaSource.connect(this.gainNode);

      this.volume.subscribe(vol => {
        if (this.gainNode) {
          this.gainNode.gain.value = vol;
        }
      });

      this.initialized = true;
      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Web Audio API:', error);
      throw error;
    }
  }

  async playMusic() {
    try {
      if (!this.initialized) {
        await this.init();
      }

      if (!this.audioContext || !this.audioElement) {
        console.warn('Audio system not ready');
        return;
      }

      // Resume the audio context if it's suspended
      if (this.audioContext.state === 'suspended') {
        console.log('Resuming audio context...');
        await this.audioContext.resume();
      }

      // Cancel any existing fade out
      if (this.fadeOutTimeout) {
        clearTimeout(this.fadeOutTimeout);
        this.fadeOutTimeout = null;
      }

      console.log('Attempting to play audio...');
      const playPromise = this.audioElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio started playing successfully');
            // Gradual fade in over 2 seconds
            if (this.gainNode && this.audioContext) {
              this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
              this.gainNode.gain.linearRampToValueAtTime(
                this.volume.value,
                this.audioContext.currentTime + 2
              );
            }
          })
          .catch(error => {
            console.error('Error playing audio:', error);
          });
      }
    } catch (error) {
      console.error('Failed to start meditation music:', error);
    }
  }

  stopMusic(fadeOutDuration = 2) {
    if (this.audioElement && this.audioContext && this.gainNode) {
      const currentTime = this.audioContext.currentTime;
      const currentGain = this.gainNode.gain.value;

      // Start fade out
      this.gainNode.gain.setValueAtTime(currentGain, currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);

      // Stop audio after fade out
      this.fadeOutTimeout = setTimeout(() => {
        if (this.audioElement) {
          this.audioElement.pause();
          this.audioElement.currentTime = 0;
        }
      }, fadeOutDuration * 1000);

      console.log('Music fade out initiated');
    }
  }

  // Start fade out process for exercise completion
  prepareForCompletion(remainingSeconds: number) {
    if (remainingSeconds <= 2 && this.audioElement && this.audioContext && this.gainNode) {
      this.stopMusic(remainingSeconds);
    }
  }

  setVolume(value: number) {
    this.volume.next(Math.max(0, Math.min(1, value)));
  }

  getVolume(): number {
    return this.volume.value;
  }
}

export const audioService = new AudioService();