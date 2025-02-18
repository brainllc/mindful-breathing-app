import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.5);
  private audioElement: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private isInitialized = false;
  private fadeInDuration = 1000; // 1 second fade in
  private fadeOutDuration = 1000; // 1 second fade out

  constructor() {
    // Create audio element immediately but don't play
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;

    try {
      console.log("Initializing audio service...");
      this.audioElement = new Audio('/meditation.mp3');
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create and connect nodes
      this.gainNode = this.audioContext.createGain();
      this.source = this.audioContext.createMediaElementSource(this.audioElement);
      this.source.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      // Set initial gain to 0 for fade in
      this.gainNode.gain.value = 0;

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

      this.isInitialized = true;
      console.log('Audio service initialized');
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
    }
  }

  private async fadeGain(start: number, end: number, duration: number): Promise<void> {
    if (!this.gainNode || !this.audioContext) return;

    const startTime = this.audioContext.currentTime;
    this.gainNode.gain.setValueAtTime(start, startTime);
    this.gainNode.gain.linearRampToValueAtTime(end, startTime + duration / 1000);

    // Return a promise that resolves when the fade is complete
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  async playMusic() {
    try {
      if (!this.isInitialized) {
        console.log('Reinitializing audio service...');
        this.initialize();
      }

      if (!this.audioElement || !this.gainNode || !this.audioContext) {
        throw new Error('Audio system not initialized');
      }

      // Resume AudioContext if it's suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Reset to beginning if it was previously played
      if (this.audioElement.currentTime > 0) {
        this.audioElement.currentTime = 0;
      }

      console.log('Attempting to play audio...');
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        await playPromise;
        // Fade in after successful play
        await this.fadeGain(0, this.volume.value, this.fadeInDuration);
        console.log('Audio playback started successfully with fade in');
      }
    } catch (error) {
      console.error('Audio playback failed:', error);
      throw error;
    }
  }

  async pauseMusic() {
    if (!this.audioElement || !this.gainNode) return;

    try {
      // Fade out before pausing
      await this.fadeGain(this.gainNode.gain.value, 0, this.fadeOutDuration);
      this.audioElement.pause();
      console.log('Audio playback paused with fade out');
    } catch (error) {
      console.error('Error pausing audio:', error);
      // If fade fails, pause immediately
      this.audioElement.pause();
    }
  }

  async resumeMusic() {
    if (!this.audioElement || !this.gainNode || !this.audioContext) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        await playPromise;
        // Fade in from current position
        await this.fadeGain(0, this.volume.value, this.fadeInDuration);
        console.log('Audio playback resumed with fade in');
      }
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  }

  async stopMusic() {
    if (!this.audioElement || !this.gainNode) return;

    try {
      // Fade out
      await this.fadeGain(this.gainNode.gain.value, 0, this.fadeOutDuration);
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      console.log('Audio playback stopped with fade out');
    } catch (error) {
      console.error('Error stopping audio:', error);
      // If fade fails, stop immediately
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }

  async setVolume(value: number) {
    const normalizedValue = Math.max(0, Math.min(1, value));
    this.volume.next(normalizedValue);

    if (this.gainNode && this.audioElement?.playing) {
      // Smoothly transition to new volume over 100ms
      await this.fadeGain(this.gainNode.gain.value, normalizedValue, 100);
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

// Add type guard for playing property
declare global {
  interface HTMLMediaElement {
    readonly playing: boolean;
  }
}

// Add playing property to HTMLMediaElement prototype
Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
  get: function(this: HTMLMediaElement) {
    return !!(this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2);
  }
});

export const audioService = new AudioService();