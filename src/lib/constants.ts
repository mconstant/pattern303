import { clusterApiUrl } from '@solana/web3.js';

export const SOLANA_NETWORKS = {
  'devnet': clusterApiUrl('devnet'),
  'mainnet-beta': clusterApiUrl('mainnet-beta'),
} as const;

// Base frequencies for notes (C3 = ~130.81 Hz as base)
export const BASE_FREQUENCY = 130.81; // C3

// MIDI note offset for C3
export const BASE_MIDI_NOTE = 48;

// Get frequency for a given pitch and octave
export function getFrequency(pitch: number, octave: -1 | 0 | 1): number {
  const midiNote = BASE_MIDI_NOTE + pitch + (octave * 12);
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'] as const;
