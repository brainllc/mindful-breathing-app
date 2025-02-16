import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.3);
  private speechSynthesis: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    // Initialize speech synthesis
    this.initSpeechSynthesis();
  }

  private initSpeechSynthesis() {
    // Force load voices
    window.speechSynthesis.getVoices();
  }

  private getPreferredVoice(): SpeechSynthesisVoice | null {
    const voices = this.speechSynthesis.getVoices();
    // Try to find a natural-sounding English voice
    return (
      voices.find(
        (voice) =>
          voice.lang.startsWith('en') && voice.localService
      ) || voices[0]
    );
  }

  playNumber(number: number) {
    if (!this.speechSynthesis) return;

    // Cancel any ongoing speech
    if (this.currentUtterance) {
      this.speechSynthesis.cancel();
    }

    // Create new utterance
    this.currentUtterance = new SpeechSynthesisUtterance(number.toString());

    // Configure voice settings
    const voice = this.getPreferredVoice();
    if (voice) {
      this.currentUtterance.voice = voice;
    }

    // Set properties
    this.currentUtterance.volume = this.volume.value;
    this.currentUtterance.rate = 1.0;
    this.currentUtterance.pitch = 1.0;

    // Speak the number
    this.speechSynthesis.speak(this.currentUtterance);
  }

  setVolume(value: number) {
    this.volume.next(Math.max(0, Math.min(1, value)));
  }

  getVolume(): number {
    return this.volume.value;
  }

  resume() {
    if (this.speechSynthesis?.paused) {
      this.speechSynthesis.resume();
    }
  }
}

export const audioService = new AudioService();