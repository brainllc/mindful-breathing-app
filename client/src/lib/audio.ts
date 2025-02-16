import { BehaviorSubject } from 'rxjs';

class AudioService {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private volume = new BehaviorSubject<number>(0.5);

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

  playBreathingTone(frequency: number = 432) {
    if (!this.audioContext || !this.gainNode) return;

    // Stop any existing tone
    this.stopBreathingTone();

    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    // Add subtle modulation for a more organic sound
    const modulator = this.audioContext.createOscillator();
    const modulatorGain = this.audioContext.createGain();
    modulator.frequency.setValueAtTime(2, this.audioContext.currentTime);
    modulatorGain.gain.setValueAtTime(1, this.audioContext.currentTime);
    modulator.connect(modulatorGain);
    modulatorGain.connect(this.oscillator.frequency);
    
    this.oscillator.connect(this.gainNode);
    
    // Soft attack
    this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(
      this.volume.value,
      this.audioContext.currentTime + 0.1
    );
    
    this.oscillator.start();
    modulator.start();
    this.isPlaying = true;
  }

  stopBreathingTone() {
    if (this.oscillator && this.gainNode && this.isPlaying) {
      // Soft release
      this.gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + 0.1
      );
      
      setTimeout(() => {
        this.oscillator?.stop();
        this.oscillator?.disconnect();
        this.oscillator = null;
      }, 100);
      
      this.isPlaying = false;
    }
  }

  playTransitionBell() {
    if (!this.audioContext || !this.gainNode) return;

    const bellOscillator = this.audioContext.createOscillator();
    const bellGain = this.audioContext.createGain();
    
    bellOscillator.type = 'sine';
    bellOscillator.frequency.setValueAtTime(1318.51, this.audioContext.currentTime); // E6
    
    bellGain.gain.setValueAtTime(0, this.audioContext.currentTime);
    bellGain.gain.linearRampToValueAtTime(0.3 * this.volume.value, this.audioContext.currentTime + 0.01);
    bellGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);
    
    bellOscillator.connect(bellGain);
    bellGain.connect(this.audioContext.destination);
    
    bellOscillator.start();
    bellOscillator.stop(this.audioContext.currentTime + 1.5);
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
