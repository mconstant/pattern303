// TB-303 Synthesizer Engine
// Based on js303 by Emil Loer (thedjinn)
// Adapted for Pattern 303 NFT app - no delay/echo effects

const SAMPLE_RATE = 44100;

// Generate band-limited wavetables for saw and square waves
function generateWavetables(): Float32Array {
  // 128 MIDI notes * 4096 samples per wave * 2 waveforms
  const wavetable = new Float32Array(128 * 4096 * 2);

  for (let note = 0; note < 128; note++) {
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    const numHarmonics = Math.floor(SAMPLE_RATE / 2 / freq);

    for (let i = 0; i < 4096; i++) {
      const phase = (i / 4096) * 2 * Math.PI;

      // Sawtooth (first half of table)
      let sawSample = 0;
      for (let h = 1; h <= numHarmonics; h++) {
        sawSample += Math.sin(phase * h) / h;
      }
      wavetable[note * 4096 + i] = sawSample * (2 / Math.PI);

      // Square (second half of table)
      let sqrSample = 0;
      for (let h = 1; h <= numHarmonics; h += 2) {
        sqrSample += Math.sin(phase * h) / h;
      }
      wavetable[524288 + note * 4096 + i] = sqrSample * (4 / Math.PI);
    }
  }

  return wavetable;
}

// One-pole highpass filter coefficients
function coeffHighpass(cutoff: number): number[] {
  const x = Math.exp(-2.0 * Math.PI * cutoff / SAMPLE_RATE);
  return [0, 0, 0.5 * (1.0 + x), -0.5 * (1.0 + x), x];
}

// One-pole allpass filter coefficients
function coeffAllpass(cutoff: number): number[] {
  const t = Math.tan(Math.PI * cutoff / SAMPLE_RATE);
  const x = (t - 1.0) / (t + 1.0);
  return [0, 0, x, 1.0, -x];
}

// Biquad lowpass filter coefficients
function coeffBiquadLowpass12db(freq: number, gain: number): number[] {
  const w = 2.0 * Math.PI * freq / SAMPLE_RATE;
  const s = Math.sin(w);
  const c = Math.cos(w);
  const alpha = s / (2.0 * gain);
  const scale = 1.0 / (1.0 + alpha);

  const a1 = 2.0 * c * scale;
  const a2 = (alpha - 1.0) * scale;
  const b1 = (1.0 - c) * scale;
  const b0 = 0.5 * b1;

  return [0, 0, 0, 0, b0, b1, b0, a1, a2];
}

// Biquad notch filter coefficients
function coeffBiquadNotch(freq: number, bandwidth: number): number[] {
  const w = 2.0 * Math.PI * freq / SAMPLE_RATE;
  const s = Math.sin(w);
  const c = Math.cos(w);
  const alpha = s * Math.sinh(0.5 * Math.log(2.0) * bandwidth * w / s);
  const scale = 1.0 / (1.0 + alpha);

  return [0, 0, 0, 0, scale, -2.0 * c * scale, scale, 2.0 * c * scale, (alpha - 1.0) * scale];
}

export interface TB303Step {
  pitch: number;      // MIDI note number (0-127)
  accent: boolean;
  slide: boolean;
  gate: boolean;      // true = note, false = rest
  down: boolean;      // octave down
  up: boolean;        // octave up
}

export class TB303Synth {
  private wavetable: Float32Array;
  private audioContext: AudioContext | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private isRunning = false;

  // Sound parameters
  private _tempo = 120;
  private _tuning = 0;
  private _waveform = 0; // 0 = saw, 1 = square
  private _cutoff = 400;
  private _resonance = 0.5;
  private _envmod = 0.5;
  private _decay = 200;
  private _accent = 0.5;

  // Pattern
  private pattern: TB303Step[] = [];
  private pos = -1;

  // Filter state
  private onepole: number[][] = [];
  private biquad: number[][] = [];
  private tbfilter = [0, 0, 0, 0, 0];
  private resonanceSkewed = 0;
  private tbfB0 = 0;
  private tbfK = 0;
  private tbfG = 1.0;

  // Oscillator state
  private steplength = 0;
  private samplepos = 1000000;
  private oscpos = 0;
  private oscdelta = 0;
  private table = 0;
  private slide = 0;
  private slidestep = 64;

  // Envelope state
  private ampenv = 0;
  private filterenv = 0;
  private filtermult = 0;
  private ampmult = 0;
  private accentgain = 0;
  private envscaler = 0;
  private envoffset = 0;

  // Callbacks
  public onStepChange?: (step: number) => void;

  constructor() {
    this.wavetable = generateWavetables();
    this.reset();
  }

  reset() {
    this.onepole = [
      coeffHighpass(44.486),
      coeffHighpass(150.0),
      coeffAllpass(14.008),
      coeffHighpass(24.167)
    ];

    this.biquad = [
      coeffBiquadLowpass12db(200.0, Math.sqrt(0.5)),
      coeffBiquadNotch(7.5164, 4.7)
    ];

    this.tbfilter = [0, 0, 0, 0, 0];
    this.setTempo(this._tempo);
    this.setResonance(this._resonance);
    this.setEnvMod(this._envmod);

    this.samplepos = 1000000;
    this.pos = -1;
    this.oscpos = 0;
  }

  // Parameter setters
  setTempo(bpm: number) {
    this._tempo = bpm;
    this.steplength = SAMPLE_RATE * 60.0 / bpm / 4.0;
  }

  setCutoff(hz: number) {
    this._cutoff = hz;
    this.setEnvMod(this._envmod);
  }

  setResonance(value: number) {
    this._resonance = value;
    this.resonanceSkewed = (1.0 - Math.exp(-3.0 * value)) / (1.0 - Math.exp(-3.0));
  }

  setEnvMod(value: number) {
    this._envmod = value;

    const c0 = 313.8152786059267;
    const c1 = 2394.411986817546;
    const c = Math.log(this._cutoff / c0) / Math.log(c1 / c0);

    const slo = 3.773996325111173 * value + 0.736965594166206;
    const shi = 4.194548788411135 * value + 0.864344900642434;

    this.envscaler = (1.0 - c) * slo + c * shi;
    this.envoffset = 0.048292930943553 * c + 0.294391201442418;
  }

  setDecay(ms: number) {
    this._decay = ms;
  }

  setAccent(value: number) {
    this._accent = value;
  }

  setWaveform(waveform: 0 | 1) {
    this._waveform = waveform;
  }

  setPattern(steps: TB303Step[]) {
    this.pattern = steps;
  }

  get tempo() { return this._tempo; }
  get cutoff() { return this._cutoff; }
  get resonance() { return this._resonance; }
  get envmod() { return this._envmod; }
  get decay() { return this._decay; }
  get accent() { return this._accent; }
  get waveform() { return this._waveform; }
  get currentStep() { return this.pos; }

  // Render a single sample
  private render(): number {
    const antiDenormal = 1.0e-20;

    if (this.isRunning && this.pattern.length > 0) {
      // Step sequencer
      if (++this.samplepos >= this.steplength) {
        this.samplepos = 0;
        this.pos++;

        if (this.pos >= this.pattern.length) {
          this.pos = 0;
        }

        // Trigger callback
        if (this.onStepChange) {
          this.onStepChange(this.pos);
        }

        const step = this.pattern[this.pos];

        if (step.gate) {
          // Calculate target pitch
          const pitch = step.pitch - (step.down ? 12 : 0) + (step.up ? 12 : 0) + this._tuning;
          const f = 440.0 * Math.pow(2.0, (pitch - 69.0) / 12.0);

          // Decay multiplier
          this.ampmult = Math.exp(-1.0 / (0.001 * this._decay * SAMPLE_RATE));

          if (step.accent) {
            this.filtermult = Math.exp(-1.0 / (0.001 * 200 * SAMPLE_RATE));
            this.accentgain = this._accent;
          } else {
            this.filtermult = this.ampmult;
            this.accentgain = 0;
          }

          this.ampenv = 1.0 / this.ampmult;

          // VCO parameters
          if (step.slide) {
            // Portamento slide
            this.slide = (this.oscdelta - (f * 4096.0 / SAMPLE_RATE)) / 64.0;
            this.slidestep = 0;
          } else {
            // New note
            this.filterenv = 1.0 / this.filtermult;
            this.oscpos = 0;
            this.slide = 0;
            this.slidestep = 64;
            this.oscdelta = f * 4096.0 / SAMPLE_RATE;
            this.table = this._waveform * 524288 + (step.pitch << 12);
          }
        } else {
          // Rest - silence
          this.ampenv = 0;
        }
      }
    } else {
      this.ampenv *= 0.9995; // Fade out when stopped
    }

    // Envelopes
    this.ampenv = this.ampenv * this.ampmult + antiDenormal;
    this.filterenv = this.filterenv * this.filtermult + antiDenormal;

    // VCO - wavetable oscillator
    const idx = Math.floor(this.oscpos);
    const r = this.oscpos - idx;
    let sample = (1.0 - r) * this.wavetable[this.table + idx] +
                 r * this.wavetable[this.table + ((idx + 1) & 4095)];

    this.oscpos += this.oscdelta;
    if (this.oscpos >= 4096.0) {
      this.oscpos -= 4096.0;
    }

    // Modulators (run every 64 samples for efficiency)
    if ((this.samplepos & 63) === 0) {
      // Portamento
      if (this.slidestep++ < 64) {
        this.oscdelta -= this.slide;
      }

      // Cutoff modulation
      const tmp1 = this.envscaler * (this.filterenv - this.envoffset);
      const tmp2 = this.accentgain * this.filterenv * 2.0; // Accent boosts filter more
      const effectiveCutoff = Math.min(this._cutoff * Math.pow(2.0, tmp1 + tmp2), 20000);

      // Recalculate main filter coefficients
      const wc = (2.0 * Math.PI / SAMPLE_RATE) * effectiveCutoff;
      const fx = wc * 0.11253953951963826;
      this.tbfB0 = (0.00045522346 + 6.1922189 * fx) / (1.0 + 12.358354 * fx + 4.4156345 * fx * fx);
      const k = fx * (fx * (fx * (fx * (fx * (fx + 7198.6997) - 5837.7917) - 476.47308) + 614.95611) + 213.87126) + 16.998792;
      this.tbfG = (((k * 0.058823529411764705) - 1.0) * this.resonanceSkewed + 1.0) * (1.0 + this.resonanceSkewed);
      this.tbfK = k * this.resonanceSkewed;
    }

    // High pass filter 1
    let flt = this.onepole[0];
    flt[1] = flt[2] * sample + flt[3] * flt[0] + flt[4] * flt[1] + antiDenormal;
    flt[0] = sample;
    sample = flt[1];

    // Main 303 filter + feedback highpass
    const tbf = this.tbfilter;
    let fbhp = this.tbfK * tbf[4];

    flt = this.onepole[1];
    flt[1] = flt[2] * fbhp + flt[3] * flt[0] + flt[4] * flt[1] + antiDenormal;
    flt[0] = fbhp;
    fbhp = flt[1];

    tbf[0] = sample - fbhp;
    tbf[1] += 2 * this.tbfB0 * (tbf[0] - tbf[1] + tbf[2]);
    tbf[2] += this.tbfB0 * (tbf[1] - 2 * tbf[2] + tbf[3]);
    tbf[3] += this.tbfB0 * (tbf[2] - 2 * tbf[3] + tbf[4]);
    tbf[4] += this.tbfB0 * (tbf[3] - 2 * tbf[4]);
    sample = 2 * this.tbfG * tbf[4];

    // Allpass filter
    flt = this.onepole[2];
    flt[1] = flt[2] * sample + flt[3] * flt[0] + flt[4] * flt[1] + antiDenormal;
    flt[0] = sample;
    sample = flt[1];

    // High pass filter 2
    flt = this.onepole[3];
    flt[1] = flt[2] * sample + flt[3] * flt[0] + flt[4] * flt[1] + antiDenormal;
    flt[0] = sample;
    sample = flt[1];

    // Notch filter
    const bq = this.biquad[1];
    let biquady = bq[4] * sample + bq[5] * bq[0] + bq[6] * bq[1] + bq[7] * bq[2] + bq[8] * bq[3] + antiDenormal;
    bq[1] = bq[0];
    bq[0] = sample;
    bq[3] = bq[2];
    bq[2] = biquady;
    sample = biquady;

    // Output gain with declicker - accent boosts volume significantly
    let outputGain = (this.accentgain * 6.0 + 1.0) * this.ampenv;
    const dc = this.biquad[0];
    biquady = dc[4] * outputGain + dc[5] * dc[0] + dc[6] * dc[1] + dc[7] * dc[2] + dc[8] * dc[3] + antiDenormal;
    dc[1] = dc[0];
    dc[0] = outputGain;
    dc[3] = dc[2];
    dc[2] = biquady;
    outputGain = biquady;

    // Apply gain
    sample *= outputGain;

    // Soft clipping
    if (sample > 1) sample = 1;
    if (sample < -1) sample = -1;

    return sample * 0.5; // Master volume
  }

  start() {
    if (this.isRunning) return;

    this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Use ScriptProcessorNode for sample-by-sample rendering
    // Note: This is deprecated but still widely supported
    // For production, consider AudioWorklet
    this.scriptNode = this.audioContext.createScriptProcessor(2048, 0, 1);

    this.scriptNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) {
        output[i] = this.render();
      }
    };

    this.scriptNode.connect(this.audioContext.destination);
    this.isRunning = true;
    this.pos = -1;
    this.samplepos = 1000000;
  }

  stop() {
    this.isRunning = false;
    if (this.scriptNode) {
      this.scriptNode.disconnect();
      this.scriptNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.pos = -1;
  }

  get playing() {
    return this.isRunning;
  }
}

// Singleton instance
let synthInstance: TB303Synth | null = null;

export function getTB303(): TB303Synth {
  if (!synthInstance) {
    synthInstance = new TB303Synth();
  }
  return synthInstance;
}
