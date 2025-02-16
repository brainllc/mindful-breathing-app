import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.3);
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private initialized = false;

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

      // Create audio element
      this.audioElement = new Audio('/meditation.mp3');
      this.audioElement.loop = true;

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

      // Fade in
      if (this.gainNode) {
        this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(
          this.volume.value,
          this.audioContext.currentTime + 2
        );
      }

      await this.audioElement.play();
      console.log('Started meditation music');
    } catch (error) {
      console.error('Failed to start meditation music:', error);
    }
  }

  stopMusic() {
    if (this.audioElement && this.audioContext) {
      // Fade out
      if (this.gainNode) {
        const currentTime = this.audioContext.currentTime;
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.5);
      }

      // Stop after fade out
      setTimeout(() => {
        if (this.audioElement) {
          this.audioElement.pause();
          this.audioElement.currentTime = 0;
        }
      }, 500);

      console.log('Music stopped successfully');
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