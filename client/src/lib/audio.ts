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
      this.audioElement.loop = true;
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

      await this.audioElement.play();
      console.log('Audio playback started');
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

  // Subscribe to volume changes
  onVolumeChange(callback: (value: number) => void) {
    return this.volume.subscribe(callback);
  }
}

export const audioService = new AudioService();