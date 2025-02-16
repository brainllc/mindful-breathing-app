import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.3);
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private musicBuffer: AudioBuffer | null = null;

  constructor() {
    this.initAudioContext();
    this.loadMeditationMusic();
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

  private async loadMeditationMusic() {
    try {
      const response = await fetch('/audio/meditation.mp3');
      const arrayBuffer = await response.arrayBuffer();
      this.musicBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Failed to load meditation music:', error);
    }
  }

  playMusic() {
    if (!this.audioContext || !this.gainNode || !this.musicBuffer) {
      console.warn('Audio system not ready');
      return;
    }

    // Stop any currently playing music
    this.stopMusic();

    // Create and configure new source
    this.musicSource = this.audioContext.createBufferSource();
    this.musicSource.buffer = this.musicBuffer;
    this.musicSource.loop = true; // Enable looping

    // Apply volume
    this.musicSource.connect(this.gainNode);

    // Start playback
    this.musicSource.start();
  }

  stopMusic() {
    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch (e) {
        // Ignore errors from stopping already stopped sources
      }
      this.musicSource.disconnect();
      this.musicSource = null;
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