import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.5);
  private audioElement: HTMLAudioElement | null = null;
  private isInitialized = false;

  constructor() {
    // Create audio element immediately but don't play
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    try {
      console.log("Initializing audio service...");
      // Use absolute path from server root
      this.audioElement = new Audio('/meditation.mp3');

      // Add comprehensive error handling
      this.audioElement.addEventListener('error', (e) => {
        const error = e.target as HTMLAudioElement;
        console.error('Audio element error:', {
          error: error.error,
          networkState: error.networkState,
          readyState: error.readyState,
          src: error.src
        });
      });

      this.audioElement.addEventListener('loadstart', () => {
        console.log('Audio file loading started');
      });

      this.audioElement.addEventListener('loadeddata', () => {
        console.log('Audio file loaded successfully');
      });

      this.audioElement.addEventListener('canplay', () => {
        console.log('Audio is ready to play');
      });

      // Enable looping
      this.audioElement.loop = true;
      // Set initial volume
      this.audioElement.volume = this.volume.value;

      this.isInitialized = true;
      console.log('Audio service initialized');
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
    }
  }

  async playMusic() {
    try {
      if (!this.isInitialized) {
        console.log('Reinitializing audio service...');
        this.initialize();
      }

      if (!this.audioElement) {
        throw new Error('Audio element not initialized');
      }

      // Reset to beginning if it was previously played
      if (this.audioElement.currentTime > 0) {
        this.audioElement.currentTime = 0;
      }

      console.log('Attempting to play audio...');
      // In Chrome, audio won't play until there's user interaction
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Audio playback started successfully');
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
      throw error;
    }
  }

  stopMusic() {
    if (!this.audioElement) return;
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    console.log('Audio playback stopped');
  }

  setVolume(value: number) {
    const normalizedValue = Math.max(0, Math.min(1, value));
    this.volume.next(normalizedValue);
    if (this.audioElement) {
      this.audioElement.volume = normalizedValue;
      console.log('Volume set to:', normalizedValue);
    }
  }

  getVolume(): number {
    return this.volume.value;
  }

  onVolumeChange(callback: (value: number) => void) {
    return this.volume.subscribe(callback);
  }
}

export const audioService = new AudioService();