import { clusterApiUrl } from '@solana/web3.js';

// Use Helius RPC if API key is available, otherwise fall back to public endpoints
const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY || '';

export const SOLANA_NETWORKS = {
  'devnet': HELIUS_API_KEY 
    ? `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
    : clusterApiUrl('devnet'),
  'mainnet-beta': HELIUS_API_KEY
    ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
    : clusterApiUrl('mainnet-beta'),
} as const;

// Environment variables (from .env or OS env vars)
// Use import.meta.env in Vite apps
export const TREASURY_WALLET = import.meta.env.VITE_TREASURY_WALLET || '';
export const TOKEN_303_MINT = import.meta.env.VITE_303_TOKEN_MINT || '';
export const COLLECTION_ADDRESS = import.meta.env.VITE_COLLECTION_ADDRESS || '';

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
