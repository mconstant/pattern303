import { useRef, useState, useCallback, useEffect } from 'react';
import { Synth303 } from '../lib/synth303';
import { Pattern303 } from '../types/pattern';

export function useSynth(pattern: Pattern303) {
  const synthRef = useRef<Synth303 | null>(null);
  const timerRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Initialize synth on mount
  useEffect(() => {
    synthRef.current = new Synth303();
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Update synth parameters when pattern changes
  useEffect(() => {
    if (!synthRef.current) return;
    synthRef.current.setWaveform(pattern.waveform);
    synthRef.current.setCutoff(pattern.cutoff);
    synthRef.current.setResonance(pattern.resonance);
    synthRef.current.setEnvMod(pattern.envMod);
    synthRef.current.setDecay(pattern.decay);
    synthRef.current.setAccent(pattern.accent);
  }, [pattern.waveform, pattern.cutoff, pattern.resonance, pattern.envMod, pattern.decay, pattern.accent]);

  const playStep = useCallback((stepIndex: number) => {
    if (!synthRef.current) return;

    const step = pattern.steps[stepIndex];
    if (step.gate) {
      synthRef.current.triggerNote(step.pitch, step.octave, step.accent, step.slide);
    } else {
      synthRef.current.releaseNote();
    }
  }, [pattern.steps]);

  const play = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);

    const stepDuration = (60 / pattern.tempo) * 1000 / 4; // 16th notes
    let step = 0;

    // Play first step immediately
    playStep(step);
    setCurrentStep(step);
    step = (step + 1) % 16;

    timerRef.current = window.setInterval(() => {
      playStep(step);
      setCurrentStep(step);
      step = (step + 1) % 16;
    }, stepDuration);
  }, [isPlaying, pattern.tempo, playStep]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.releaseNote();
    }
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  // Update timer interval when tempo changes during playback
  useEffect(() => {
    if (isPlaying && timerRef.current) {
      stop();
      play();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern.tempo]);

  return {
    isPlaying,
    currentStep,
    play,
    stop,
    togglePlayback,
  };
}
