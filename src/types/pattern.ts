// Gate types: note (plays), tie (extends previous), rest (silence)
export type GateType = 'note' | 'tie' | 'rest';

// Pattern bank (I, II, III, IV), section (A, B), and pattern number (1-8)
export type PatternBank = 'I' | 'II' | 'III' | 'IV';
export type PatternSection = 'A' | 'B';
export type PatternNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Step {
  pitch: number; // 0-12 (C to C, semitones)
  octave: -1 | 0 | 1; // down, normal, up
  accent: boolean;
  slide: boolean;
  gate: GateType; // note, tie, or rest
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
  // Pattern organization
  bank?: PatternBank;
  section?: PatternSection;
  patternNumber?: PatternNumber;
  // Freeform notes
  efxNotes?: string;
}

export type NetworkType = 'devnet' | 'mainnet-beta';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'] as const;

export const DEFAULT_STEP: Step = {
  pitch: 0,
  octave: 0,
  accent: false,
  slide: false,
  gate: 'note',
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
  bank: 'I',
  section: 'A',
  patternNumber: 1,
  efxNotes: '',
};
