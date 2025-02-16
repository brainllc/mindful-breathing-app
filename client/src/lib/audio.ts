import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.3);
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private oscillator: OscillatorNode | null = null;
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

      if (!this.audioContext || !this.gainNode) {
        console.warn('Audio system not ready');
        return;
      }

      // Resume the audio context if it's suspended
      if (this.audioContext.state === 'suspended') {
        console.log('Resuming audio context...');
        await this.audioContext.resume();
      }

      // Stop any currently playing sound
      this.stopMusic();

      // Create and configure oscillator for a soft, meditation-like tone
      this.oscillator = this.audioContext.createOscillator();
      this.oscillator.type = 'sine';
      this.oscillator.frequency.value = 432; // Frequency in Hz

      // Create a low-pass filter for a softer sound
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      // Connect the nodes
      this.oscillator.connect(filter);
      filter.connect(this.gainNode);

      // Start the oscillator
      this.oscillator.start();
      console.log('Started meditation sound');
    } catch (error) {
      console.error('Failed to start meditation sound:', error);
    }
  }

  stopMusic() {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
        console.log('Sound stopped successfully');
      } catch (e) {
        console.log('Note: Sound was already stopped');
      }
      this.oscillator = null;
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