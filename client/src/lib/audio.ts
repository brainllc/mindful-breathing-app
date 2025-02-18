import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.3);
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private oscillators: {
    osc: OscillatorNode;
    gain: GainNode;
  }[] = [];
  private lfoNode: OscillatorNode | null = null;
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

      // Stop any existing sounds
      this.stopMusic();

      const currentTime = this.audioContext.currentTime;

      // Create LFO for subtle modulation
      this.lfoNode = this.audioContext.createOscillator();
      this.lfoNode.frequency.setValueAtTime(0.1, currentTime); // Very slow modulation
      const lfoGain = this.audioContext.createGain();
      lfoGain.gain.setValueAtTime(0.02, currentTime); // Subtle modulation amount
      this.lfoNode.connect(lfoGain);

      // Create base frequencies using harmonious ratios
      const baseFreq = 136.1; // Root frequency (close to C#3)
      const frequencies = [
        baseFreq,            // Root note
        baseFreq * 1.5,      // Perfect fifth
        baseFreq * 1.681,    // Major sixth
        baseFreq * 2,        // Octave
        baseFreq * 3.0307,   // Just major third (two octaves up)
      ];

      frequencies.forEach((freq, index) => {
        if (this.audioContext && this.gainNode) {
          // Create main oscillator
          const osc = this.audioContext.createOscillator();
          const oscGain = this.audioContext.createGain();

          // Use different waveforms for richer texture
          if (index === 0) {
            osc.type = 'sine'; // Pure fundamental
          } else if (index === 1) {
            osc.type = 'triangle'; // Softer harmonics
          } else {
            osc.type = 'sine'; // Pure harmonics
          }

          osc.frequency.setValueAtTime(freq, currentTime);

          // Set initial gain to 0 for fade-in
          oscGain.gain.setValueAtTime(0, currentTime);

          // Fade in gradually with different timing for each frequency
          const baseVolume = 0.1 / frequencies.length; // Balanced volume
          const fadeInTime = 2 + (index * 0.5); // Staggered fade-ins
          oscGain.gain.linearRampToValueAtTime(
            baseVolume * (index === 0 ? 1.2 : 1), // Slightly stronger fundamental
            currentTime + fadeInTime
          );

          // Connect modulation if not the root note
          if (index > 0) {
            lfoGain.connect(oscGain.gain);
          }

          // Connect everything
          osc.connect(oscGain);
          oscGain.connect(this.gainNode);
          osc.start();

          // Store references for cleanup
          this.oscillators.push({ osc, gain: oscGain });
        }
      });

      // Start LFO
      this.lfoNode.start();

      console.log('Meditation sound started playing');
    } catch (error) {
      console.error('Failed to start meditation sound:', error);
    }
  }

  stopMusic() {
    if (this.audioContext) {
      const currentTime = this.audioContext.currentTime;

      // Fade out oscillators
      this.oscillators.forEach(({ osc, gain }) => {
        gain.gain.setValueAtTime(gain.gain.value, currentTime);
        gain.gain.linearRampToValueAtTime(0, currentTime + 1.5);
        osc.stop(currentTime + 1.5);
      });

      // Stop and clear LFO
      if (this.lfoNode) {
        this.lfoNode.stop(currentTime + 1.5);
        this.lfoNode = null;
      }

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