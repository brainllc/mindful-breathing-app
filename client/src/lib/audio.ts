import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.3);
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
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
      // Create audio element first
      this.audioElement = new Audio();
      this.audioElement.src = '/meditation.mp3';
      this.audioElement.loop = true;

      // Wait for the audio to load
      await new Promise((resolve, reject) => {
        if (!this.audioElement) return reject('No audio element');

        const handleCanPlay = () => {
          console.log('Audio file loaded and can play');
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

      // Create Audio Context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      console.log('AudioContext created with state:', this.audioContext.state);

      // Resume context if needed
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('AudioContext resumed');
      }

      // Create gain node
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.volume.value;
      console.log('Gain node created with volume:', this.volume.value);

      // Connect audio element to gain node
      const source = this.audioContext.createMediaElementSource(this.audioElement);
      source.connect(this.gainNode);
      console.log('Audio source connected to gain node');

      this.initialized = true;
      console.log('Audio service initialized successfully');
    } catch (error) {
      console.error('Audio initialization failed:', error);
      this.initialized = false;
      throw new Error(`Failed to initialize audio: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async playMusic() {
    try {
      if (!this.initialized) {
        await this.init();
      }

      if (!this.audioContext || !this.audioElement || !this.gainNode) {
        throw new Error('Audio system not initialized');
      }

      // Resume context if needed
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Attempt to play
      try {
        await this.audioElement.play();
        console.log('Audio playback started');
      } catch (playError) {
        console.error('Play failed:', playError);
        throw new Error('Failed to start playback. Please interact with the page first.');
      }

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

    // Fade out
    this.gainNode.gain.cancelScheduledValues(currentTime);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);

    // Stop after fade
    setTimeout(() => {
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