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
      this.audioElement = new Audio('/meditation.mp3');

      // Add event listeners for better debugging
      this.audioElement.addEventListener('error', (e) => {
        console.error('Audio element error:', e);
      });

      this.audioElement.addEventListener('loadeddata', () => {
        console.log('Audio file loaded successfully');
      });

      // Reset the playback rate to normal
      this.audioElement.playbackRate = 1.0;
      // Enable looping
      this.audioElement.loop = true;
      // Set initial volume
      this.audioElement.volume = this.volume.value;

      this.isInitialized = true;
      console.log('Audio service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
    }
  }

  async playMusic() {
    try {
      if (!this.isInitialized) {
        this.initialize();
      }

      if (!this.audioElement) {
        throw new Error('Audio element not initialized');
      }

      // Reset to beginning if it was previously played
      if (this.audioElement.currentTime > 0) {
        this.audioElement.currentTime = 0;
      }

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