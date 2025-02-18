import { BehaviorSubject } from 'rxjs';

class AudioService {
  private volume = new BehaviorSubject<number>(0.3);
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private initialized = false;
  private fadeOutTimeout: NodeJS.Timeout | null = null;

  constructor() {
    console.log('Audio service created, waiting for initialization...');
  }

  async init() {
    if (this.initialized) {
      console.log('Audio service already initialized');
      return;
    }

    try {
      console.log('Creating new AudioContext...');
      this.audioContext = new AudioContext();

      console.log('Creating and connecting GainNode...');
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = this.volume.value;

      console.log('Creating audio element...');
      this.audioElement = new Audio();
      this.audioElement.src = '/meditation.mp3';
      this.audioElement.loop = true;
      this.audioElement.crossOrigin = 'anonymous';

      // Add event listeners for debugging
      this.audioElement.addEventListener('loadstart', () => console.log('Audio loading started'));
      this.audioElement.addEventListener('canplay', () => console.log('Audio can start playing'));
      this.audioElement.addEventListener('error', (e) => console.error('Audio loading error:', e));

      // Wait for the audio to be loaded
      console.log('Waiting for audio to load...');
      await new Promise((resolve, reject) => {
        if (!this.audioElement) return reject('No audio element');

        this.audioElement.addEventListener('canplay', resolve);
        this.audioElement.addEventListener('error', reject);

        // Also resolve if already loaded
        if (this.audioElement.readyState >= 3) resolve(null);
      });

      console.log('Audio loaded, creating MediaElementAudioSourceNode...');
      if (!this.audioContext || !this.audioElement) throw new Error('Audio context or element not initialized');

      this.mediaSource = this.audioContext.createMediaElementSource(this.audioElement);
      this.mediaSource.connect(this.gainNode);

      this.volume.subscribe(vol => {
        if (this.gainNode) {
          console.log(`Setting volume to ${vol}`);
          this.gainNode.gain.value = vol;
        }
      });

      this.initialized = true;
      console.log('Audio service successfully initialized');
    } catch (error) {
      console.error('Failed to initialize Web Audio API:', error);
      this.initialized = false;
      throw error;
    }
  }

  async playMusic() {
    try {
      if (!this.initialized) {
        console.log('Audio not initialized, initializing now...');
        await this.init();
      }

      if (!this.audioContext || !this.audioElement) {
        console.error('Audio system not ready');
        return;
      }

      // Resume the audio context if it's suspended
      if (this.audioContext.state === 'suspended') {
        console.log('Resuming suspended audio context...');
        await this.audioContext.resume();
      }

      // Cancel any existing fade out
      if (this.fadeOutTimeout) {
        clearTimeout(this.fadeOutTimeout);
        this.fadeOutTimeout = null;
      }

      console.log('Starting audio playback...');
      const playPromise = this.audioElement.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio playback started successfully');
            // Gradual fade in over 2 seconds
            if (this.gainNode && this.audioContext) {
              this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
              this.gainNode.gain.linearRampToValueAtTime(
                this.volume.value,
                this.audioContext.currentTime + 2
              );
            }
          })
          .catch(error => {
            console.error('Error playing audio:', error);
          });
      }
    } catch (error) {
      console.error('Failed to start meditation music:', error);
    }
  }

  stopMusic(fadeOutDuration = 2) {
    if (!this.audioElement || !this.audioContext || !this.gainNode) {
      console.log('Cannot stop music: audio system not initialized');
      return;
    }

    console.log(`Starting fade out over ${fadeOutDuration} seconds`);
    const currentTime = this.audioContext.currentTime;
    const currentGain = this.gainNode.gain.value;

    // Start fade out
    this.gainNode.gain.setValueAtTime(currentGain, currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0, currentTime + fadeOutDuration);

    // Stop audio after fade out
    this.fadeOutTimeout = setTimeout(() => {
      if (this.audioElement) {
        console.log('Stopping audio playback');
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      }
    }, fadeOutDuration * 1000);
  }

  prepareForCompletion(remainingSeconds: number) {
    if (remainingSeconds <= 2 && this.audioElement && this.audioContext && this.gainNode) {
      console.log(`Preparing for completion, ${remainingSeconds}s remaining`);
      this.stopMusic(remainingSeconds);
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