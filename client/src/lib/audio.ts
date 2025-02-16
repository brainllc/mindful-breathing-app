import { BehaviorSubject } from 'rxjs';

class AudioService {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private volume = new BehaviorSubject<number>(0.3); // Lower default volume

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.volume.subscribe(vol => {
        if (this.gainNode) {
          this.gainNode.gain.value = vol;
        }
      });
    } catch (error) {
      console.error('Web Audio API is not supported in this browser');
    }
  }

  playBreathingTone(frequency: number = 174) { // Lower base frequency for gentler sound
    if (!this.audioContext || !this.gainNode) return;

    // Stop any existing tone
    this.stopBreathingTone();

    // Create and configure oscillator
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // Create a low-pass filter for smoother sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    filter.Q.value = 1;

    // Add very subtle modulation for organic feel
    const modulator = this.audioContext.createOscillator();
    const modulatorGain = this.audioContext.createGain();
    modulator.frequency.setValueAtTime(0.8, this.audioContext.currentTime);
    modulatorGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    modulator.connect(modulatorGain);
    modulatorGain.connect(this.oscillator.frequency);

    // Connect through filter
    this.oscillator.connect(filter);
    filter.connect(this.gainNode);

    // Very gentle attack
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      this.volume.value * 0.3, // Reduce overall volume
      this.audioContext.currentTime + 0.5 // Longer fade-in
    );

    this.oscillator.start();
    modulator.start();
    this.isPlaying = true;
  }

  stopBreathingTone() {
    if (this.oscillator && this.gainNode && this.isPlaying) {
      // Gentle release
      this.gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + 0.5 // Longer fade-out
      );

      setTimeout(() => {
        this.oscillator?.stop();
        this.oscillator?.disconnect();
        this.oscillator = null;
      }, 500);

      this.isPlaying = false;
    }
  }

  playTransitionBell() {
    if (!this.audioContext || !this.gainNode) return;

    const bellOscillator = this.audioContext.createOscillator();
    const bellGain = this.audioContext.createGain();

    // Use a gentler frequency
    bellOscillator.type = 'sine';
    bellOscillator.frequency.setValueAtTime(196, this.audioContext.currentTime); // G3 - much lower and gentler

    // Very subtle volume
    bellGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    bellGain.gain.linearRampToValueAtTime(0.1 * this.volume.value, this.audioContext.currentTime + 0.1);
    bellGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);

    // Add a filter for softer sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    bellOscillator.connect(bellGain);
    bellGain.connect(filter);
    filter.connect(this.audioContext.destination);

    bellOscillator.start();
    bellOscillator.stop(this.audioContext.currentTime + 2);
  }

  setVolume(value: number) {
    this.volume.next(Math.max(0, Math.min(1, value)));
  }

  getVolume(): number {
    return this.volume.value;
  }

  resume() {
    this.audioContext?.resume();
  }
}

export const audioService = new AudioService();