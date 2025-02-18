import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.5);
  private audioElement: HTMLAudioElement | null = null;
  private initialized = false;

  constructor() {
    console.log('Audio service created');
  }

  init() {
    if (this.initialized && this.audioElement) {
      return;
    }

    this.audioElement = new Audio('/meditation.mp3');
    this.audioElement.loop = true;
    this.audioElement.volume = this.volume.value;
    this.initialized = true;
  }

  async playMusic() {
    try {
      if (!this.initialized || !this.audioElement) {
        this.init();
      }

      await this.audioElement?.play();
    } catch (error) {
      console.error('Audio playback failed:', error);
      throw error;
    }
  }

  stopMusic() {
    if (!this.audioElement) return;
    this.audioElement.pause();
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