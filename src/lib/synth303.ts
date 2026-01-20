import { getFrequency } from './constants';

// PBLEP (Polynomial Band-Limited Step) for anti-aliasing
function pblep(t: number, dt: number): number {
  if (t < dt) {
    t = t / dt;
    return t + t - t * t - 1;
  } else if (t > 1 - dt) {
    t = (t - 1) / dt;
    return t * t + t + t + 1;
  }
  return 0;
}

// State Variable Filter - more accurate 303 filter
class SVFilter {
  private low = 0;
  private band = 0;
  private kf = 0.5;
  private kq = 0.5;

  setParams(cutoffNorm: number, resonance: number) {
    // cutoffNorm is 0-1, we map to filter coefficient
    this.kf = Math.min(0.99, 2 * Math.sin(Math.PI * cutoffNorm * 0.5));
    this.kq = Math.max(0.1, 1 - resonance * 0.9);
  }

  process(input: number): number {
    this.low += this.kf * this.band;
    const high = input - this.low - this.kq * this.band;
    this.band += this.kf * high;
    return this.low;
  }

  reset() {
    this.low = 0;
    this.band = 0;
  }
}

// Cascaded SVFilter for steeper rolloff (like 303)
class SVFilter2 {
  private f1 = new SVFilter();
  private f2 = new SVFilter();

  setParams(cutoffNorm: number, resonance: number) {
    this.f1.setParams(cutoffNorm, resonance);
    this.f2.setParams(cutoffNorm, resonance * 0.7); // Less resonance on second stage
  }

  process(input: number): number {
    return this.f2.process(this.f1.process(input));
  }

  reset() {
    this.f1.reset();
    this.f2.reset();
  }
}

// Stereo delay for echo effect
class StereoDelay {
  private bufferL: Float32Array;
  private bufferR: Float32Array;
  private writePos = 0;
  private size: number;

  constructor(sampleRate: number, maxDelayMs: number = 500) {
    this.size = Math.floor(sampleRate * maxDelayMs / 1000);
    this.bufferL = new Float32Array(this.size);
    this.bufferR = new Float32Array(this.size);
  }

  process(inputL: number, inputR: number, delayMs: number, feedback: number, mix: number, sampleRate: number): [number, number] {
    const delaySamples = Math.floor(sampleRate * delayMs / 1000);
    const readPos = (this.writePos - delaySamples + this.size) % this.size;

    const delayedL = this.bufferL[readPos];
    const delayedR = this.bufferR[readPos];

    // Cross-feedback for wider stereo
    this.bufferL[this.writePos] = inputL + delayedR * feedback * 0.8;
    this.bufferR[this.writePos] = inputR + delayedL * feedback * 0.8;

    this.writePos = (this.writePos + 1) % this.size;

    return [
      inputL * (1 - mix) + delayedL * mix,
      inputR * (1 - mix) + delayedR * mix
    ];
  }

  reset() {
    this.bufferL.fill(0);
    this.bufferR.fill(0);
    this.writePos = 0;
  }
}

export class Synth303 {
  private audioContext: AudioContext | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private masterGain: GainNode | null = null;

  // Synth params
  private waveform: 'saw' | 'square' = 'saw';
  private cutoff = 50;
  private resonance = 50;
  private envMod = 50;
  private decay = 50;
  private overdrive = 30;
  private echo = 20;

  // Internal state
  private phase = 0;
  private frequency = 220;
  private targetFrequency = 220;
  private slideRate = 0;
  private filter = new SVFilter2();
  private delay: StereoDelay | null = null;

  // Envelopes
  private ampEnv = 0;
  private filterEnv = 0;
  private noteOn = false;
  private accent = false;
  private gateTime = 0;
  private sampleRate = 44100;

  constructor() {}

  private ensureAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.sampleRate = this.audioContext.sampleRate;
      this.delay = new StereoDelay(this.sampleRate, 400);
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  private setupNodes() {
    const ctx = this.ensureAudioContext();

    // Use ScriptProcessorNode for custom DSP (deprecated but widely supported)
    // In production, AudioWorklet would be better
    const bufferSize = 512;
    this.scriptProcessor = ctx.createScriptProcessor(bufferSize, 0, 2);

    this.scriptProcessor.onaudioprocess = (e) => {
      const outputL = e.outputBuffer.getChannelData(0);
      const outputR = e.outputBuffer.getChannelData(1);

      for (let i = 0; i < bufferSize; i++) {
        const sample = this.processSample();

        // Apply echo
        if (this.delay && this.echo > 0) {
          const echoMix = this.echo / 100;
          const [l, r] = this.delay.process(sample, sample, 180, 0.4, echoMix, this.sampleRate);
          outputL[i] = l;
          outputR[i] = r;
        } else {
          outputL[i] = sample;
          outputR[i] = sample;
        }
      }
    };

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.6;

    this.scriptProcessor.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);
  }

  private processSample(): number {
    const dt = this.frequency / this.sampleRate;

    // Slide frequency
    if (Math.abs(this.frequency - this.targetFrequency) > 0.1) {
      this.frequency += (this.targetFrequency - this.frequency) * this.slideRate;
    } else {
      this.frequency = this.targetFrequency;
    }

    // Update phase
    this.phase += dt;
    if (this.phase >= 1) this.phase -= 1;

    // Generate waveform with PBLEP anti-aliasing
    let osc = 0;
    if (this.waveform === 'saw') {
      osc = 2 * this.phase - 1;
      osc -= pblep(this.phase, dt);
    } else {
      // Square/pulse wave
      const pw = 0.5;
      osc = this.phase < pw ? 1 : -1;
      osc += pblep(this.phase, dt);
      osc -= pblep((this.phase + 1 - pw) % 1, dt);
    }

    // Update envelopes
    const attackRate = 0.005; // Fast attack
    const decayRate = 0.0001 + (1 - this.decay / 100) * 0.003;
    const releaseRate = 0.002;

    if (this.noteOn) {
      // Attack/sustain
      const targetAmp = this.accent ? 1.0 : 0.7;
      if (this.ampEnv < targetAmp) {
        this.ampEnv += attackRate;
        if (this.ampEnv > targetAmp) this.ampEnv = targetAmp;
      } else {
        // Decay to sustain
        const sustain = targetAmp * (0.3 + this.gateTime * 0.3);
        this.ampEnv -= decayRate;
        if (this.ampEnv < sustain) this.ampEnv = sustain;
      }

      // Filter envelope
      if (this.filterEnv > 0.01) {
        this.filterEnv *= (1 - decayRate * 2);
      }
    } else {
      // Release
      this.ampEnv -= releaseRate;
      if (this.ampEnv < 0) this.ampEnv = 0;
      this.filterEnv *= 0.995;
    }

    // Calculate filter cutoff with envelope modulation
    const baseCutoff = this.cutoff / 100;
    const envAmount = (this.envMod / 100) * this.filterEnv * (this.accent ? 1.5 : 1.0);
    const cutoffNorm = Math.min(0.95, baseCutoff + envAmount);

    this.filter.setParams(cutoffNorm, this.resonance / 100);
    let filtered = this.filter.process(osc);

    // Overdrive/saturation
    if (this.overdrive > 0) {
      const drive = 1 + (this.overdrive / 100) * 8;
      filtered = Math.tanh(filtered * drive) / Math.tanh(drive);
    }

    // Apply amplitude envelope
    return filtered * this.ampEnv * 0.5;
  }

  setWaveform(waveform: 'saw' | 'square') {
    this.waveform = waveform;
  }

  setCutoff(value: number) {
    this.cutoff = Math.max(0, Math.min(100, value));
  }

  setResonance(value: number) {
    this.resonance = Math.max(0, Math.min(100, value));
  }

  setEnvMod(value: number) {
    this.envMod = Math.max(0, Math.min(100, value));
  }

  setDecay(value: number) {
    this.decay = Math.max(0, Math.min(100, value));
  }

  setAccent(_value: number) {
    // Accent is handled per-note via the triggerNote method
    // This method exists for API compatibility
  }

  setOverdrive(value: number) {
    this.overdrive = Math.max(0, Math.min(100, value));
  }

  setEcho(value: number) {
    this.echo = Math.max(0, Math.min(100, value));
  }

  triggerNote(pitch: number, octave: -1 | 0 | 1, accent: boolean, slide: boolean) {
    this.ensureAudioContext();

    if (!this.scriptProcessor) {
      this.setupNodes();
    }

    this.targetFrequency = getFrequency(pitch, octave);
    this.accent = accent;
    this.noteOn = true;
    this.gateTime = 0.58; // Gate length similar to dittytoy

    // Slide or immediate frequency change
    if (slide) {
      this.slideRate = 0.05; // Smooth slide
    } else {
      this.frequency = this.targetFrequency;
      this.slideRate = 1;
      // Retrigger filter envelope on non-slide notes
      this.filterEnv = 1.0;
    }

    // Accent boosts filter envelope
    if (accent) {
      this.filterEnv = Math.max(this.filterEnv, 1.2);
    }
  }

  releaseNote() {
    this.noteOn = false;
  }

  stop() {
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
    this.ampEnv = 0;
    this.filterEnv = 0;
    this.filter.reset();
    if (this.delay) {
      this.delay.reset();
    }
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }
}
