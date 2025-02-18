import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.5);
  private audioElement: HTMLAudioElement | null = null;

  constructor() {
    console.log('Audio service created');
    // Create audio element immediately but don't play
    this.audioElement = new Audio('/meditation.mp3');
    this.audioElement.loop = true;
    this.audioElement.volume = this.volume.value;
  }

  async playMusic() {
    try {
      if (!this.audioElement) {
        this.audioElement = new Audio('/meditation.mp3');
        this.audioElement.loop = true;
        this.audioElement.volume = this.volume.value;
      }

      await this.audioElement.play();
    } catch (error) {
      console.error('Audio playback failed:', error);
      throw error;
    }
  }

  stopMusic() {
    if (!this.audioElement) return;
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
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