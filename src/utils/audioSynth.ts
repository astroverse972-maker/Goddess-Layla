// Web Audio API Synthesizer for Dark Ambient Drone and Audio Teaser tones
class AudioSynthManager {
  private ctx: AudioContext | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;
  private teaserOsc: OscillatorNode | null = null;
  private teaserGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleAmbient(play: boolean, volume: number = 0.15) {
    this.initCtx();
    if (!this.ctx) return;

    if (play) {
      if (this.isAmbientPlaying) return;

      const now = this.ctx.currentTime;
      // Low sub frequency drone (55Hz / A1)
      this.ambientOsc1 = this.ctx.createOscillator();
      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, now);

      // Low harmonic frequency (110Hz / A2 with slight detune for lush texture)
      this.ambientOsc2 = this.ctx.createOscillator();
      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(108.5, now);

      // Low pass filter for dark warm hum
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, now);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.01), now + 3);

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc1.start(now);
      this.ambientOsc2.start(now);
      this.isAmbientPlaying = true;
    } else {
      if (!this.isAmbientPlaying || !this.ambientGain) return;
      const now = this.ctx.currentTime;
      this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
      setTimeout(() => {
        try {
          this.ambientOsc1?.stop();
          this.ambientOsc2?.stop();
          this.ambientOsc1?.disconnect();
          this.ambientOsc2?.disconnect();
        } catch (e) {
          // Ignore
        }
        this.isAmbientPlaying = false;
      }, 1500);
    }
  }

  public setAmbientVolume(val: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(Math.max(val, 0.001), this.ctx.currentTime);
    }
  }

  public playTeaserTone(frequency: number = 220, durationMs: number = 3000, onEnded?: () => void) {
    this.initCtx();
    if (!this.ctx) return;

    this.stopTeaserTone();

    const now = this.ctx.currentTime;
    this.teaserOsc = this.ctx.createOscillator();
    this.teaserGain = this.ctx.createGain();

    this.teaserOsc.type = 'sine';
    this.teaserOsc.frequency.setValueAtTime(frequency, now);

    // Subtle pitch modulation for whisper-like dark vibe
    this.teaserOsc.frequency.exponentialRampToValueAtTime(frequency * 0.95, now + durationMs / 1000);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.Q.setValueAtTime(2, now);

    this.teaserGain.gain.setValueAtTime(0.001, now);
    this.teaserGain.gain.linearRampToValueAtTime(0.2, now + 0.3);
    this.teaserGain.gain.exponentialRampToValueAtTime(0.0001, now + (durationMs / 1000));

    this.teaserOsc.connect(filter);
    filter.connect(this.teaserGain);
    this.teaserGain.connect(this.ctx.destination);

    this.teaserOsc.start(now);
    this.teaserOsc.stop(now + (durationMs / 1000));

    setTimeout(() => {
      this.stopTeaserTone();
      if (onEnded) onEnded();
    }, durationMs);
  }

  public stopTeaserTone() {
    if (this.teaserOsc) {
      try {
        this.teaserOsc.stop();
        this.teaserOsc.disconnect();
      } catch (e) {
        // ignore
      }
      this.teaserOsc = null;
    }
  }

  public playChime() {
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
  }
}

export const audioSynth = new AudioSynthManager();
