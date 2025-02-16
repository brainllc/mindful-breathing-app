import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.3);
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicBuffer: AudioBuffer | null = null;
  private initialized = false;

  constructor() {
    // Don't initialize automatically, wait for user interaction
    console.log('Audio service created, waiting for initialization...');
  }

  async init() {
    if (this.initialized) return;

    try {
      console.log('Initializing audio context...');
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.volume.subscribe(vol => {
        if (this.gainNode) {
          this.gainNode.gain.value = vol;
        }
      });

      await this.loadMeditationMusic();
      this.initialized = true;
      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Web Audio API:', error);
      throw error;
    }
  }

  private async loadMeditationMusic() {
    if (!this.audioContext) return;

    try {
      console.log('Attempting to load meditation music...');
      const response = await fetch('/audio/meditation.mp3');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      this.musicBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      console.log('Meditation music loaded successfully');
    } catch (error) {
      console.error('Failed to load meditation music:', error);
      throw error;
    }
  }

  async playMusic() {
    try {
      if (!this.initialized) {
        await this.init();
      }

      if (!this.audioContext || !this.gainNode || !this.musicBuffer) {
        console.warn('Audio system not ready:', {
          context: !!this.audioContext,
          gainNode: !!this.gainNode,
          buffer: !!this.musicBuffer
        });
        return;
      }

      // Resume the audio context if it's suspended
      if (this.audioContext.state === 'suspended') {
        console.log('Resuming audio context...');
        await this.audioContext.resume();
      }

      // Stop any currently playing music
      this.stopMusic();

      console.log('Creating and starting new music source...');
      // Create and configure new source
      this.musicSource = this.audioContext.createBufferSource();
      this.musicSource.buffer = this.musicBuffer;
      this.musicSource.loop = true; // Enable looping

      // Apply volume
      this.musicSource.connect(this.gainNode);

      // Start playback
      this.musicSource.start();
      console.log('Music playback started successfully');
    } catch (error) {
      console.error('Failed to start music playback:', error);
    }
  }

  stopMusic() {
    if (this.musicSource) {
      try {
        this.musicSource.stop();
        this.musicSource.disconnect();
        console.log('Music stopped successfully');
      } catch (e) {
        // Ignore errors from stopping already stopped sources
        console.log('Note: Music was already stopped');
      }
      this.musicSource = null;
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