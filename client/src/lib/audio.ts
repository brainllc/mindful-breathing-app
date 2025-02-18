import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.5);
  private audioElement: HTMLAudioElement | null = null;
  private initialized = false;

  constructor() {
    console.log('Audio service created');
  }

  async init() {
    if (this.initialized) {
      return;
    }

    try {
      // Create audio element
      this.audioElement = new Audio('/meditation.mp3');
      this.audioElement.loop = true;
      this.audioElement.volume = this.volume.value;

      // Wait for the audio to load
      await new Promise((resolve, reject) => {
        if (!this.audioElement) return reject('No audio element');

        const handleCanPlay = () => {
          console.log('Audio file loaded successfully');
          this.audioElement?.removeEventListener('canplay', handleCanPlay);
          resolve(null);
        };

        const handleError = (e: Event) => {
          console.error('Audio loading error:', e);
          this.audioElement?.removeEventListener('error', handleError);
          reject(new Error('Failed to load audio file'));
        };

        this.audioElement.addEventListener('canplay', handleCanPlay);
        this.audioElement.addEventListener('error', handleError);

        // If already loaded, resolve immediately
        if (this.audioElement.readyState >= 3) {
          console.log('Audio already loaded');
          resolve(null);
        }
      });

      this.initialized = true;
      console.log('Audio service initialized successfully');
    } catch (error) {
      console.error('Audio initialization failed:', error);
      this.initialized = false;
      throw error;
    }
  }

  async playMusic() {
    try {
      if (!this.initialized) {
        await this.init();
      }

      if (!this.audioElement) {
        throw new Error('Audio element not initialized');
      }

      // Attempt to play with user interaction
      try {
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log('Audio playback started successfully');
        }
      } catch (playError) {
        console.error('Playback failed:', playError);
        throw new Error('Failed to start playback. Please interact with the page first.');
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
      throw error;
    }
  }

  stopMusic(fadeOutDuration = 2) {
    if (!this.audioElement) {
      return;
    }

    // Simple fade out using volume
    const startVolume = this.audioElement.volume;
    const fadeSteps = 20;
    const fadeInterval = (fadeOutDuration * 1000) / fadeSteps;
    const volumeStep = startVolume / fadeSteps;

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
        this.audioElement.currentTime = 0;
        this.audioElement.volume = this.volume.value; // Reset volume
      }
    }, fadeInterval);
  }

  prepareForCompletion(remainingSeconds: number) {
    if (remainingSeconds <= 2) {
      this.stopMusic(remainingSeconds);
    }
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