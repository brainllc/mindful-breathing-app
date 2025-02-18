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

      // Create calming meditation sounds using multiple oscillators
      const frequencies = [
        174.6, // F3 - grounding frequency
        261.6, // C4 - root frequency
        329.6, // E4 - harmonic
      ];

      // Stop any existing oscillators
      this.stopMusic();

      frequencies.forEach((freq, index) => {
        if (this.audioContext && this.gainNode) {
          const oscillator = this.audioContext.createOscillator();
          oscillator.type = index === 0 ? 'sine' : 'triangle';
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);

          // Create individual gain node for each oscillator
          const oscGain = this.audioContext.createGain();
          oscGain.gain.setValueAtTime(0, this.audioContext.currentTime);
          oscGain.gain.linearRampToValueAtTime(
            0.15 / frequencies.length, // Divide by number of oscillators for balanced volume
            this.audioContext.currentTime + 2
          );

          oscillator.connect(oscGain);
          oscGain.connect(this.gainNode);
          oscillator.start();
          this.oscillators.push(oscillator);
        }
      });

      console.log('Meditation sound started playing');
    } catch (error) {
      console.error('Failed to start meditation sound:', error);
    }
  }

  stopMusic() {
    if (this.audioContext) {
      const currentTime = this.audioContext.currentTime;

      // Fade out all oscillators
      this.oscillators.forEach(osc => {
        if (osc.frequency) {
          const gainNode = osc.connect(this.audioContext!.createGain());
          gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime);
          gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.5);
          osc.stop(currentTime + 0.5);
        }
      });

      // Clear oscillators array
      this.oscillators = [];
      console.log('Meditation sound stopped');
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