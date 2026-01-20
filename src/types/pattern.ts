export interface Step {
  pitch: number; // 0-12 (C to C, semitones)
  octave: -1 | 0 | 1; // down, normal, up
  accent: boolean;
  slide: boolean;
  gate: boolean; // note on or rest
}

export interface Pattern303 {
  name: string;
  creator: string; // Artist/creator name
  tempo: number; // 60-300 BPM
  waveform: 'saw' | 'square';
  cutoff: number; // 0-100
  resonance: number; // 0-100
  envMod: number; // 0-100
  decay: number; // 0-100
  accent: number; // 0-100
  steps: Step[];
}

export type NetworkType = 'devnet' | 'mainnet-beta';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'] as const;

export const DEFAULT_STEP: Step = {
  pitch: 0,
  octave: 0,
  accent: false,
  slide: false,
  gate: true,
};

export const DEFAULT_PATTERN: Pattern303 = {
  name: '',
  creator: '',
  tempo: 120,
  waveform: 'saw',
  cutoff: 50,
  resonance: 50,
  envMod: 50,
  decay: 50,
  accent: 50,
  steps: Array(16).fill(null).map(() => ({ ...DEFAULT_STEP })),
};
