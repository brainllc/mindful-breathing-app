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
    console.log('Audio service created');
  }

  private async createAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('AudioContext created:', this.audioContext.state);
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
      console.log('AudioContext resumed');
    }
  }

  async init() {
    if (this.initialized) {
      console.log('Audio service already initialized');
      return;
    }

    try {
      await this.createAudioContext();
      console.log('Setting up audio nodes...');

      this.gainNode = this.audioContext!.createGain();
      this.gainNode.connect(this.audioContext!.destination);
      this.gainNode.gain.value = 0; // Start silent

      this.audioElement = new Audio();
      this.audioElement.src = '/meditation.mp3';
      this.audioElement.loop = true;

      this.mediaSource = this.audioContext!.createMediaElementSource(this.audioElement);
      this.mediaSource.connect(this.gainNode);

      this.initialized = true;
      console.log('Audio service initialized');

    } catch (error) {
      console.error('Audio initialization failed:', error);
      this.initialized = false;
      throw error;
    }
  }

  async playMusic() {
    if (!this.initialized || !this.audioElement || !this.audioContext || !this.gainNode) {
      console.error('Cannot play: Audio system not initialized');
      return;
    }

    try {
      // Ensure context is running
      if (this.audioContext.state !== 'running') {
        await this.audioContext.resume();
      }

      // Cancel any existing fade out
      if (this.fadeOutTimeout) {
        clearTimeout(this.fadeOutTimeout);
        this.fadeOutTimeout = null;
      }

      // Start playing
      await this.audioElement.play();

      // Fade in
      this.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
      this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(
        this.volume.value,
        this.audioContext.currentTime + 2
      );

      console.log('Audio playback started');
    } catch (error) {
      console.error('Playback failed:', error);
      throw error;
    }
  }

  stopMusic(fadeOutDuration = 2) {
    if (!this.audioElement || !this.audioContext || !this.gainNode) {
      return;
    }

    const currentTime = this.audioContext.currentTime;

    // Start fade out
    this.gainNode.gain.cancelScheduledValues(currentTime);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);

    // Stop after fade
    this.fadeOutTimeout = setTimeout(() => {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      }
    }, fadeOutDuration * 1000);
  }

  prepareForCompletion(remainingSeconds: number) {
    if (remainingSeconds <= 2) {
      this.stopMusic(remainingSeconds);
    }
  }

  setVolume(value: number) {
    this.volume.next(Math.max(0, Math.min(1, value)));
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setValueAtTime(
        this.volume.value,
        this.audioContext.currentTime
      );
    }
  }

  getVolume(): number {
    return this.volume.value;
  }
}

export const audioService = new AudioService();