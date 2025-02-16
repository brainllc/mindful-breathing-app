import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.3);
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
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

      // Create a master gain node for fade effects
      const masterGain = this.audioContext.createGain();
      masterGain.connect(this.gainNode);
      masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      masterGain.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + 2);

      // Create multiple oscillators for a rich meditation sound
      const frequencies = [
        256.87, // Root note (C4)
        384.87, // Perfect fifth
        512.87  // Octave
      ];

      frequencies.forEach((freq, index) => {
        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;

        // Create individual gain node for this oscillator
        const oscGain = this.audioContext.createGain();
        oscGain.gain.value = 0.15; // Reduce individual gains for better mixing

        // Create a lowpass filter for smoother sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1;

        // Connect the audio chain
        oscillator.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(masterGain);

        // Start the oscillator
        oscillator.start();
        this.oscillators.push(oscillator);
      });

      console.log('Started meditation sound');
    } catch (error) {
      console.error('Failed to start meditation sound:', error);
    }
  }

  stopMusic() {
    if (this.oscillators.length > 0) {
      try {
        // Fade out before stopping
        const stopTime = this.audioContext?.currentTime || 0;
        this.oscillators.forEach(osc => {
          const gain = osc.connect(this.gainNode).gain;
          gain.setValueAtTime(gain.value, stopTime);
          gain.linearRampToValueAtTime(0, stopTime + 0.5);
          setTimeout(() => {
            osc.stop();
            osc.disconnect();
          }, 500);
        });
        this.oscillators = [];
        console.log('Sound stopped successfully');
      } catch (e) {
        console.log('Note: Sound was already stopped');
      }
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