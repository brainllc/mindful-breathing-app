import { BehaviorSubject } from 'rxjs';

class AudioService {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private volume = new BehaviorSubject<number>(0.3);
  private numberAudioBuffers: { [key: number]: AudioBuffer } = {};
  private currentSource: AudioBufferSourceNode | null = null;
  private isPlaying = false;

  constructor() {
    this.initAudioContext();
    this.loadNumberAudios();
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

  private async loadNumberAudios() {
    // In a real implementation, we would load pre-recorded number audio files
    // For now, we'll use a simple beep sound as a placeholder
    try {
      const sampleRate = 44100;
      const duration = 0.3; // seconds
      const numberOfSamples = sampleRate * duration;
      const buffer = this.audioContext!.createBuffer(1, numberOfSamples, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < numberOfSamples; i++) {
        // Generate a simple sine wave
        data[i] = Math.sin(440 * Math.PI * 2 * i / sampleRate) * 0.5;
      }

      // Use the same buffer for all numbers for now
      // In production, we would load different audio files for each number
      for (let i = 1; i <= 10; i++) {
        this.numberAudioBuffers[i] = buffer;
      }
    } catch (error) {
      console.error('Failed to load number audio:', error);
    }
  }

  playNumber(number: number) {
    if (!this.audioContext || !this.gainNode || !this.numberAudioBuffers[number]) return;

    try {
      // Stop any currently playing sound
      if (this.currentSource && this.isPlaying) {
        this.currentSource.stop();
        this.currentSource.disconnect();
        this.isPlaying = false;
      }

      // Create and configure new source
      this.currentSource = this.audioContext.createBufferSource();
      this.currentSource.buffer = this.numberAudioBuffers[number];

      // Add a slight reverb effect
      const convolver = this.audioContext.createConvolver();
      const reverbTime = 1;
      const decay = 0.1;
      const rate = 44100;
      const length = rate * reverbTime;
      const impulse = this.audioContext.createBuffer(2, length, rate);
      const left = impulse.getChannelData(0);
      const right = impulse.getChannelData(1);

      for (let i = 0; i < length; i++) {
        left[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        right[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }

      convolver.buffer = impulse;

      // Connect nodes
      this.currentSource.connect(convolver);
      convolver.connect(this.gainNode);

      // Play with slight fade in/out
      this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(
        this.volume.value,
        this.audioContext.currentTime + 0.05
      );
      this.gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + 0.3
      );

      // Set up ended callback to update playing state
      this.currentSource.onended = () => {
        this.isPlaying = false;
      };

      this.currentSource.start();
      this.isPlaying = true;
    } catch (error) {
      console.error('Error playing number audio:', error);
      this.isPlaying = false;
    }
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