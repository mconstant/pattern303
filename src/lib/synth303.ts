import { getFrequency } from './constants';

export class Synth303 {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private filterEnvelope: GainNode | null = null;
  private vca: GainNode | null = null;
  private masterGain: GainNode | null = null;

  private waveform: OscillatorType = 'sawtooth';
  private cutoff = 50;
  private resonance = 50;
  private envMod = 50;
  private decay = 50;
  private accentLevel = 50;

  private currentFrequency = 220;
  private isSliding = false;

  constructor() {
    // Audio context will be created on first user interaction
  }

  private ensureAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  private setupNodes() {
    const ctx = this.ensureAudioContext();

    // Create oscillator
    this.oscillator = ctx.createOscillator();
    this.oscillator.type = this.waveform;
    this.oscillator.frequency.value = this.currentFrequency;

    // Create filter (303's resonant low-pass)
    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.updateFilterParams();

    // Filter envelope modulation (using a gain node as envelope source)
    this.filterEnvelope = ctx.createGain();
    this.filterEnvelope.gain.value = 0;

    // VCA (volume envelope)
    this.vca = ctx.createGain();
    this.vca.gain.value = 0;

    // Master gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.5;

    // Connect the chain: Oscillator -> Filter -> VCA -> Master -> Output
    this.oscillator.connect(this.filter);
    this.filter.connect(this.vca);
    this.vca.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    this.oscillator.start();
  }

  private updateFilterParams() {
    if (!this.filter || !this.audioContext) return;

    // Map cutoff 0-100 to frequency 100-8000 Hz (logarithmic)
    const minFreq = 100;
    const maxFreq = 8000;
    const normalizedCutoff = this.cutoff / 100;
    const filterFreq = minFreq * Math.pow(maxFreq / minFreq, normalizedCutoff);
    this.filter.frequency.value = filterFreq;

    // Map resonance 0-100 to Q 0.5-20
    const q = 0.5 + (this.resonance / 100) * 19.5;
    this.filter.Q.value = q;
  }

  setWaveform(waveform: 'saw' | 'square') {
    this.waveform = waveform === 'saw' ? 'sawtooth' : 'square';
    if (this.oscillator) {
      this.oscillator.type = this.waveform;
    }
  }

  setCutoff(value: number) {
    this.cutoff = Math.max(0, Math.min(100, value));
    this.updateFilterParams();
  }

  setResonance(value: number) {
    this.resonance = Math.max(0, Math.min(100, value));
    this.updateFilterParams();
  }

  setEnvMod(value: number) {
    this.envMod = Math.max(0, Math.min(100, value));
  }

  setDecay(value: number) {
    this.decay = Math.max(0, Math.min(100, value));
  }

  setAccent(value: number) {
    this.accentLevel = Math.max(0, Math.min(100, value));
  }

  triggerNote(pitch: number, octave: -1 | 0 | 1, accent: boolean, slide: boolean) {
    const ctx = this.ensureAudioContext();

    if (!this.oscillator || !this.filter || !this.vca) {
      this.setupNodes();
    }

    const targetFrequency = getFrequency(pitch, octave);
    const now = ctx.currentTime;

    // Calculate envelope times based on decay parameter
    const attackTime = 0.003; // Fast attack (3ms)
    const decayTime = 0.1 + (this.decay / 100) * 0.5; // 100ms to 600ms

    // Accent affects amplitude and filter
    const accentMultiplier = accent ? 1 + (this.accentLevel / 100) * 0.5 : 1;
    const targetAmp = 0.3 * accentMultiplier;

    // Frequency slide or immediate change
    if (this.oscillator) {
      if (slide && this.isSliding) {
        // Slide to new frequency over ~60ms (303-style glide)
        this.oscillator.frequency.cancelScheduledValues(now);
        this.oscillator.frequency.setValueAtTime(this.currentFrequency, now);
        this.oscillator.frequency.linearRampToValueAtTime(targetFrequency, now + 0.06);
      } else {
        this.oscillator.frequency.cancelScheduledValues(now);
        this.oscillator.frequency.setValueAtTime(targetFrequency, now);
      }
    }
    this.currentFrequency = targetFrequency;

    // VCA envelope
    if (this.vca) {
      this.vca.gain.cancelScheduledValues(now);
      this.vca.gain.setValueAtTime(this.vca.gain.value, now);
      this.vca.gain.linearRampToValueAtTime(targetAmp, now + attackTime);
      if (!slide) {
        // Only decay if not sliding
        this.vca.gain.linearRampToValueAtTime(targetAmp * 0.3, now + attackTime + decayTime);
      }
    }

    // Filter envelope modulation
    if (this.filter) {
      const baseCutoff = 100 * Math.pow(80, this.cutoff / 100);
      const envAmount = (this.envMod / 100) * 6000 * accentMultiplier;

      this.filter.frequency.cancelScheduledValues(now);
      this.filter.frequency.setValueAtTime(baseCutoff + envAmount, now);
      this.filter.frequency.linearRampToValueAtTime(baseCutoff, now + decayTime * 1.5);
    }

    this.isSliding = slide;
  }

  releaseNote() {
    if (!this.audioContext || !this.vca) return;

    const now = this.audioContext.currentTime;
    this.vca.gain.cancelScheduledValues(now);
    this.vca.gain.setValueAtTime(this.vca.gain.value, now);
    this.vca.gain.linearRampToValueAtTime(0, now + 0.05);
    this.isSliding = false;
  }

  stop() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }
    if (this.filter) {
      this.filter.disconnect();
      this.filter = null;
    }
    if (this.vca) {
      this.vca.disconnect();
      this.vca = null;
    }
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
    this.isSliding = false;
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }
}
