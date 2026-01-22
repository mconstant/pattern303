import { useEffect, useRef } from 'react';
import { usePattern } from '../hooks/usePattern';
import { useSynth } from '../hooks/useSynth';
import { useCreatorNames } from '../hooks/useCreatorNames';
import { PatternSheet } from './PatternSheet';
import { Pattern303 } from '../types/pattern';

interface PatternEditorProps {
  initialPattern?: Pattern303 | null;
  onPatternChange?: (pattern: ReturnType<typeof usePattern>['pattern']) => void;
}

export function PatternEditor({ initialPattern, onPatternChange }: PatternEditorProps) {
  const {
    pattern,
    setPattern,
    setName,
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
  } = usePattern();

  const { isPlaying, togglePlayback, stop } = useSynth(pattern);
  const { primaryName } = useCreatorNames('mainnet-beta');
  const hasAutoSetCreator = useRef(false);

  // Load initial pattern if provided
  useEffect(() => {
    if (initialPattern) {
      setPattern(initialPattern);
      hasAutoSetCreator.current = true;
    }
  }, [initialPattern, setPattern]);

  // Notify parent of pattern changes
  useEffect(() => {
    if (onPatternChange) {
      onPatternChange(pattern);
    }
  }, [pattern, onPatternChange]);

  return (
    <PatternSheet
      pattern={pattern}
      onStepChange={updateStep}
      onNameChange={setName}
      onBankChange={setBank}
      onSectionChange={setSection}
      onPatternNumberChange={setPatternNumber}
      onEfxNotesChange={setEfxNotes}
      onTempoChange={setTempo}
      onWaveformChange={setWaveform}
      onCutoffChange={setCutoff}
      onResonanceChange={setResonance}
      onEnvModChange={setEnvMod}
      onDecayChange={setDecay}
      onAccentChange={setAccent}
      onRandomize={randomizePattern}
      onClear={clearPattern}
      editable={true}
      creatorDisplay={primaryName}
      isPlaying={isPlaying}
      onTogglePlay={togglePlayback}
      onStop={stop}
      network="mainnet-beta"
    />
  );
}
