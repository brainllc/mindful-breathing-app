import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.5);
  private audioElement: HTMLAudioElement | null = null;
  private initialized = false;

  constructor() {
    console.log('Audio service created');
  }

  async init() {
    if (this.initialized && this.audioElement) {
      return;
    }

    try {
      // Create a simple audio element
      this.audioElement = new Audio();
      this.audioElement.src = '/meditation.mp3';
      this.audioElement.loop = true;
      this.audioElement.volume = this.volume.value;

      // Wait for audio to be loaded
      await new Promise<void>((resolve, reject) => {
        if (!this.audioElement) return reject('No audio element');

        this.audioElement.oncanplaythrough = () => {
          this.initialized = true;
          resolve();
        };

        this.audioElement.onerror = () => {
          const errorMessage = this.audioElement?.error?.message || 'Unknown error';
          reject(new Error(`Audio initialization failed: ${errorMessage}`));
        };

        // Start loading
        this.audioElement.load();
      });

    } catch (error) {
      console.error('Audio initialization failed:', error);
      this.initialized = false;
      throw error;
    }
  }

  async playMusic() {
    try {
      if (!this.initialized || !this.audioElement) {
        await this.init();
      }

      await this.audioElement?.play();
    } catch (error) {
      console.error('Audio playback failed:', error);
      throw error;
    }
  }

  stopMusic(fadeOutDuration = 2) {
    if (!this.audioElement) return;

    const startVolume = this.audioElement.volume;
    const steps = 20;
    const interval = (fadeOutDuration * 1000) / steps;
    const volumeStep = startVolume / steps;

    const fade = setInterval(() => {
      if (!this.audioElement) {
        clearInterval(fade);
        return;
      }

      if (this.audioElement.volume > volumeStep) {
        this.audioElement.volume -= volumeStep;
      } else {
        clearInterval(fade);
        this.audioElement.pause();
        this.audioElement.volume = this.volume.value;
      }
    }, interval);
  }

  setVolume(value: number) {
    const normalizedValue = Math.max(0, Math.min(1, value));
    this.volume.next(normalizedValue);
    if (this.audioElement) {
      this.audioElement.volume = normalizedValue;
    }
  }

  getVolume(): number {
    return this.volume.value;
  }
}

export const audioService = new AudioService();