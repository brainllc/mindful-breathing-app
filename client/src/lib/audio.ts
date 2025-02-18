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
      // First verify the audio file is accessible
      const audioPath = '/meditation.mp3';
      console.log('Attempting to load audio from:', audioPath);

      const response = await fetch(audioPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.status} ${response.statusText}`);
      }
      console.log('Audio file is accessible');

      // Create new audio element
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = "anonymous";

      // Test if browser supports MP3
      const canPlayType = this.audioElement.canPlayType('audio/mpeg');
      console.log('Browser can play MP3:', canPlayType);
      if (!canPlayType) {
        throw new Error('Browser does not support MP3 audio');
      }

      // Set properties after testing support
      this.audioElement.src = audioPath;
      this.audioElement.loop = true;
      this.audioElement.volume = this.volume.value;
      this.audioElement.preload = 'auto';

      // Load the audio file
      await new Promise((resolve, reject) => {
        if (!this.audioElement) return reject('No audio element');

        this.audioElement.onerror = (e) => {
          const error = e instanceof ErrorEvent ? e.message : 'Unknown error';
          console.error('Audio error:', error);
          if (this.audioElement?.error) {
            console.error('MediaError code:', this.audioElement.error.code);
            console.error('MediaError message:', this.audioElement.error.message);
          }
          reject(new Error(`Failed to load audio file`));
        };

        this.audioElement.oncanplaythrough = () => {
          console.log('Audio file loaded and ready for playback');
          resolve(null);
        };

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

      // Attempt to play and handle autoplay restrictions
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

    const startVolume = this.audioElement.volume;
    const steps = 20;
    const interval = (fadeOutDuration * 1000) / steps;
    const volumeStep = startVolume / steps;

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
        this.audioElement.volume = this.volume.value;
      }
    }, interval);
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