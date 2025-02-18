import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.5);
  private audioElement: HTMLAudioElement | null = null;
  private initialized = false;

  constructor() {
    console.log('Audio service created');
  }

  async init() {
    if (this.initialized && this.audioElement) {
      return;
    }

    try {
      // Create audio element with absolute path
      const audioPath = window.location.origin + '/meditation.mp3';
      console.log('Attempting to load audio from:', audioPath);

      this.audioElement = new Audio(audioPath);
      this.audioElement.loop = true;
      this.audioElement.volume = this.volume.value;
      this.audioElement.preload = 'auto';

      // Test audio format support
      const canPlay = this.audioElement.canPlayType('audio/mpeg');
      console.log('Browser can play MP3:', canPlay);

      await new Promise((resolve, reject) => {
        if (!this.audioElement) return reject('No audio element');

        const timeoutId = setTimeout(() => {
          console.error('Audio loading timed out');
          reject(new Error('Audio loading timed out'));
        }, 5000);

        const handleCanPlay = () => {
          clearTimeout(timeoutId);
          console.log('Audio file loaded and ready');
          this.audioElement?.removeEventListener('canplay', handleCanPlay);
          resolve(null);
        };

        const handleError = (e: Event) => {
          clearTimeout(timeoutId);
          const error = e instanceof ErrorEvent ? e.message : 'Unknown error';
          console.error('Audio loading error:', error);
          if (this.audioElement?.error) {
            console.error('MediaError code:', this.audioElement.error.code);
            console.error('MediaError message:', this.audioElement.error.message);
          }
          this.audioElement?.removeEventListener('error', handleError);
          reject(new Error('Failed to load audio file'));
        };

        this.audioElement.addEventListener('canplay', handleCanPlay);
        this.audioElement.addEventListener('error', handleError);
        this.audioElement.load();
      });

      this.initialized = true;
      console.log('Audio service initialized successfully');
    } catch (error) {
      console.error('Audio initialization failed:', error);
      this.initialized = false;
      throw error;
    }
  }

  async playMusic() {
    console.log('Attempting to play music...');
    try {
      if (!this.initialized) {
        await this.init();
      }

      if (!this.audioElement) {
        throw new Error('Audio element not initialized');
      }

      // Attempt to play with user interaction
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

  stopMusic(fadeOutDuration = 2) {
    if (!this.audioElement) {
      return;
    }

    // Simple fade out using volume
    const startVolume = this.audioElement.volume;
    const fadeSteps = 20;
    const fadeInterval = (fadeOutDuration * 1000) / fadeSteps;
    const volumeStep = startVolume / fadeSteps;

    const fade = setInterval(() => {
      if (!this.audioElement) {
        clearInterval(fade);
        return;
      }

      if (this.audioElement.volume > volumeStep) {
        this.audioElement.volume -= volumeStep;
      } else {
        clearInterval(fade);
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.audioElement.volume = this.volume.value; // Reset volume
      }
    }, fadeInterval);
  }

  prepareForCompletion(remainingSeconds: number) {
    if (remainingSeconds <= 2) {
      this.stopMusic(remainingSeconds);
    }
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