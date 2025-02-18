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

  private async waitForUserInteraction(): Promise<void> {
    // Return immediately if the document is already interacted with
    if (document.querySelector('body')?.classList.contains('user-interacted')) {
      return;
    }

    return new Promise((resolve) => {
      const handleInteraction = () => {
        document.querySelector('body')?.classList.add('user-interacted');
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
        resolve();
      };

      document.addEventListener('click', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);
    });
  }

  async init() {
    if (this.initialized) {
      return;
    }

    try {
      // Wait for user interaction before creating AudioContext
      await this.waitForUserInteraction();

      // Create AudioContext
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create and configure audio element
      this.audioElement = new Audio();
      this.audioElement.src = '/meditation.mp3';
      this.audioElement.loop = true;

      // Create gain node
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0; // Start silent

      // Create media source
      this.mediaSource = this.audioContext.createMediaElementSource(this.audioElement);
      this.mediaSource.connect(this.gainNode);

      this.initialized = true;
      console.log('Audio service initialized successfully');
    } catch (error) {
      console.error('Audio initialization failed:', error);
      this.initialized = false;
      throw new Error(`Failed to initialize audio: ${error.message}`);
    }
  }

  async playMusic() {
    try {
      if (!this.initialized) {
        await this.init();
      }

      if (!this.audioContext || !this.audioElement || !this.gainNode) {
        throw new Error('Audio system not fully initialized');
      }

      // Ensure context is running
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Cancel any existing fade out
      if (this.fadeOutTimeout) {
        clearTimeout(this.fadeOutTimeout);
        this.fadeOutTimeout = null;
      }

      // Play audio
      await this.audioElement.play();

      // Fade in
      this.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
      this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(
        this.volume.value,
        this.audioContext.currentTime + 2
      );

      console.log('Audio playback started successfully');
    } catch (error) {
      console.error('Audio playback failed:', error);
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