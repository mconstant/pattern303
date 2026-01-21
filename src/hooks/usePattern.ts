import { useState, useCallback, useEffect } from 'react';
import { Pattern303, Step, DEFAULT_PATTERN, DEFAULT_STEP, PatternBank, PatternSection, PatternNumber, GateType } from '../types/pattern';

const STORAGE_KEY = 'pattern303_draft';

// Load pattern from localStorage
function loadSavedPattern(): Pattern303 {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate it has the right structure
      if (parsed.steps && Array.isArray(parsed.steps) && parsed.steps.length === 16) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load saved pattern:', e);
  }
  return {
    ...DEFAULT_PATTERN,
    steps: Array(16).fill(null).map(() => ({ ...DEFAULT_STEP })),
  };
}

export function usePattern() {
  const [pattern, setPattern] = useState<Pattern303>(loadSavedPattern);

  // Auto-save pattern to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pattern));
    } catch (e) {
      console.warn('Failed to save pattern:', e);
    }
  }, [pattern]);

  const setName = useCallback((name: string) => {
    setPattern(prev => ({ ...prev, name }));
  }, []);

  const setCreator = useCallback((creator: string) => {
    setPattern(prev => ({ ...prev, creator }));
  }, []);

  const setTempo = useCallback((tempo: number) => {
    setPattern(prev => ({ ...prev, tempo: Math.max(60, Math.min(300, tempo)) }));
  }, []);

  const setWaveform = useCallback((waveform: 'saw' | 'square') => {
    setPattern(prev => ({ ...prev, waveform }));
  }, []);

  const setCutoff = useCallback((cutoff: number) => {
    setPattern(prev => ({ ...prev, cutoff: Math.max(0, Math.min(100, cutoff)) }));
  }, []);

  const setResonance = useCallback((resonance: number) => {
    setPattern(prev => ({ ...prev, resonance: Math.max(0, Math.min(100, resonance)) }));
  }, []);

  const setEnvMod = useCallback((envMod: number) => {
    setPattern(prev => ({ ...prev, envMod: Math.max(0, Math.min(100, envMod)) }));
  }, []);

  const setDecay = useCallback((decay: number) => {
    setPattern(prev => ({ ...prev, decay: Math.max(0, Math.min(100, decay)) }));
  }, []);

  const setAccent = useCallback((accent: number) => {
    setPattern(prev => ({ ...prev, accent: Math.max(0, Math.min(100, accent)) }));
  }, []);

  const setBank = useCallback((bank: PatternBank) => {
    setPattern(prev => ({ ...prev, bank }));
  }, []);

  const setSection = useCallback((section: PatternSection) => {
    setPattern(prev => ({ ...prev, section }));
  }, []);

  const setPatternNumber = useCallback((patternNumber: PatternNumber) => {
    setPattern(prev => ({ ...prev, patternNumber }));
  }, []);

  const setEfxNotes = useCallback((efxNotes: string) => {
    setPattern(prev => ({ ...prev, efxNotes }));
  }, []);

  const updateStep = useCallback((stepIndex: number, updates: Partial<Step>) => {
    setPattern(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === stepIndex ? { ...step, ...updates } : step
      ),
    }));
  }, []);

  const randomizePattern = useCallback(() => {
    setPattern(prev => ({
      ...prev,
      steps: prev.steps.map(() => {
        // Weighted random: 60% note, 25% tie, 15% rest
        const rand = Math.random();
        const gate: GateType = rand > 0.4 ? 'note' : rand > 0.15 ? 'tie' : 'rest';
        return {
          pitch: Math.floor(Math.random() * 13),
          octave: (Math.floor(Math.random() * 3) - 1) as -1 | 0 | 1,
          accent: Math.random() > 0.7,
          slide: Math.random() > 0.8,
          gate,
        };
      }),
    }));
  }, []);

  const clearPattern = useCallback(() => {
    setPattern(prev => ({
      ...prev,
      steps: Array(16).fill(null).map(() => ({ ...DEFAULT_STEP })),
    }));
  }, []);

  return {
    pattern,
    setPattern,
    setName,
    setCreator,
    setTempo,
    setWaveform,
    setCutoff,
    setResonance,
    setEnvMod,
    setDecay,
    setAccent,
    setBank,
    setSection,
    setPatternNumber,
    setEfxNotes,
    updateStep,
    randomizePattern,
    clearPattern,
  };
}
