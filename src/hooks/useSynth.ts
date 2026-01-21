import { useRef, useState, useCallback, useEffect } from 'react';
import { getTB303, TB303Step } from '../lib/tb303';
import { Pattern303, GateType } from '../types/pattern';

// Convert our pattern format to TB303 format
function patternToTB303Steps(pattern: Pattern303): TB303Step[] {
  return pattern.steps.map(step => {
    // Handle legacy boolean gate values
    const gateType: GateType = typeof step.gate === 'boolean'
      ? (step.gate ? 'note' : 'rest')
      : step.gate;

    // For ties, we set slide=true and gate=true so the note continues
    const isGateOn = gateType === 'note' || gateType === 'tie';
    const isSlide = step.slide || gateType === 'tie';

    // Convert pitch (0-12) to MIDI note
    // Base is C1 (24) - octave adjustment is handled by down/up flags in tb303.ts
    const midiNote = 24 + step.pitch;

    return {
      pitch: midiNote,
      accent: step.accent && isGateOn, // Only accent if note is playing
      slide: isSlide && isGateOn, // Only slide if note is playing
      gate: isGateOn,
      down: step.octave === -1,
      up: step.octave === 1,
    };
  });
}

export function useSynth(pattern: Pattern303) {
  const synthRef = useRef(getTB303());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Set up step change callback
  useEffect(() => {
    const synth = synthRef.current;
    synth.onStepChange = (step) => {
      setCurrentStep(step);
    };
    return () => {
      synth.onStepChange = undefined;
    };
  }, []);

  // Update synth parameters when pattern changes
  useEffect(() => {
    const synth = synthRef.current;

    // Convert 0-100 values to appropriate ranges
    synth.setTempo(pattern.tempo);
    synth.setWaveform(pattern.waveform === 'saw' ? 0 : 1);

    // Cutoff: 0-100 -> 100-4000 Hz (logarithmic)
    const cutoffHz = 100 * Math.pow(40, pattern.cutoff / 100);
    synth.setCutoff(cutoffHz);

    // Resonance: 0-100 -> 0-1
    synth.setResonance(pattern.resonance / 100);

    // Env mod: 0-100 -> 0-1
    synth.setEnvMod(pattern.envMod / 100);

    // Decay: 0-100 -> 50-2000 ms
    synth.setDecay(50 + (pattern.decay / 100) * 1950);

    // Accent: 0-100 -> 0-1
    synth.setAccent(pattern.accent / 100);

    // Update pattern
    synth.setPattern(patternToTB303Steps(pattern));
  }, [pattern]);

  const play = useCallback(() => {
    if (isPlaying) return;

    const synth = synthRef.current;
    synth.setPattern(patternToTB303Steps(pattern));
    synth.reset();
    synth.start();
    setIsPlaying(true);
  }, [isPlaying, pattern]);

  const stop = useCallback(() => {
    const synth = synthRef.current;
    synth.stop();
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

  return {
    isPlaying,
    currentStep,
    play,
    stop,
    togglePlayback,
  };
}
