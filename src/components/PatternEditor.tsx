import { useEffect, useRef } from 'react';
import { usePattern } from '../hooks/usePattern';
import { useSynth } from '../hooks/useSynth';
import { useSolanaName } from '../hooks/useSolanaName';
import { KnobControl } from './KnobControl';
import { TransportControls } from './TransportControls';
import { PatternSheet } from './PatternSheet';
import { MintButton } from './MintButton';
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
    setCreator,
    setTempo,
    setWaveform,
    setCutoff,
    setResonance,
    setEnvMod,
    setDecay,
    setAccent,
    updateStep,
    randomizePattern,
    clearPattern,
  } = usePattern();

  const { isPlaying, currentStep, togglePlayback, stop } = useSynth(pattern);
  const { displayName, walletAddress } = useSolanaName('devnet');
  const hasAutoSetCreator = useRef(false);

  // Auto-populate creator with wallet display name (domain or short address)
  useEffect(() => {
    if (displayName && !pattern.creator && !hasAutoSetCreator.current) {
      setCreator(displayName);
      hasAutoSetCreator.current = true;
    }
  }, [displayName, pattern.creator, setCreator]);

  // Reset auto-set flag when pattern is cleared or loaded
  useEffect(() => {
    if (!pattern.creator) {
      hasAutoSetCreator.current = false;
    }
  }, [pattern.creator]);

  // Load initial pattern if provided
  useEffect(() => {
    if (initialPattern) {
      setPattern(initialPattern);
      hasAutoSetCreator.current = true; // Don't override loaded pattern's creator
    }
  }, [initialPattern, setPattern]);

  // Notify parent of pattern changes
  useEffect(() => {
    if (onPatternChange) {
      onPatternChange(pattern);
    }
  }, [pattern, onPatternChange]);

  return (
    <div className="flex flex-col gap-6">
      {/* Pattern Sheet */}
      <PatternSheet
        pattern={pattern}
        onStepChange={updateStep}
        onNameChange={setName}
        onCreatorChange={setCreator}
        onCutoffChange={setCutoff}
        onResonanceChange={setResonance}
        onEnvModChange={setEnvMod}
        onDecayChange={setDecay}
        onAccentChange={setAccent}
        editable={true}
      />

      {/* Transport controls */}
      <TransportControls
        isPlaying={isPlaying}
        tempo={pattern.tempo}
        onTogglePlay={togglePlayback}
        onStop={stop}
        onTempoChange={setTempo}
        onRandomize={randomizePattern}
        onClear={clearPattern}
      />

      {/* Synth parameters */}
      <div className="flex items-center gap-6 p-4 bg-synth-panel rounded-lg flex-wrap">
        {/* Waveform selector */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-synth-silver uppercase tracking-wider">Waveform</span>
          <div className="flex gap-1">
            <button
              onClick={() => setWaveform('saw')}
              className={`px-3 py-1 text-sm rounded ${
                pattern.waveform === 'saw'
                  ? 'bg-synth-accent text-white'
                  : 'bg-synth-dark text-gray-400 hover:bg-gray-600'
              }`}
            >
              SAW
            </button>
            <button
              onClick={() => setWaveform('square')}
              className={`px-3 py-1 text-sm rounded ${
                pattern.waveform === 'square'
                  ? 'bg-synth-accent text-white'
                  : 'bg-synth-dark text-gray-400 hover:bg-gray-600'
              }`}
            >
              SQR
            </button>
          </div>
        </div>

        <div className="h-12 w-px bg-gray-600" />

        {/* Parameter knobs */}
        <KnobControl label="Cutoff" value={pattern.cutoff} onChange={setCutoff} />
        <KnobControl label="Reso" value={pattern.resonance} onChange={setResonance} />
        <KnobControl label="Env Mod" value={pattern.envMod} onChange={setEnvMod} />
        <KnobControl label="Decay" value={pattern.decay} onChange={setDecay} />
        <KnobControl label="Accent" value={pattern.accent} onChange={setAccent} />
      </div>

      {/* Mint NFT Section */}
      <div className="p-4 bg-synth-panel rounded-lg">
        <h2 className="text-lg font-bold text-synth-silver mb-4">Mint as NFT</h2>
        <MintButton pattern={pattern} network="devnet" />
      </div>
    </div>
  );
}
