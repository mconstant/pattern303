import { Step } from '../types/pattern';
import { NOTE_NAMES } from '../lib/constants';

interface StepEditorProps {
  step: Step;
  stepIndex: number;
  isCurrentStep: boolean;
  isPlaying: boolean;
  onChange: (updates: Partial<Step>) => void;
}

export function StepEditor({ step, stepIndex, isCurrentStep, isPlaying, onChange }: StepEditorProps) {
  return (
    <div
      className={`
        flex flex-col items-center gap-1 p-2 rounded-lg
        ${isCurrentStep && isPlaying ? 'bg-synth-accent/30 ring-2 ring-synth-accent' : 'bg-synth-panel'}
        ${!step.gate ? 'opacity-50' : ''}
        transition-all duration-75
      `}
    >
      {/* Step number */}
      <div className="text-xs text-gray-500 font-bold">{stepIndex + 1}</div>

      {/* Note selector */}
      <select
        value={step.pitch}
        onChange={(e) => onChange({ pitch: parseInt(e.target.value) })}
        className="w-12 bg-synth-dark text-synth-silver text-xs p-1 rounded border border-gray-600 focus:border-synth-accent outline-none"
      >
        {NOTE_NAMES.map((note, i) => (
          <option key={i} value={i}>{note}</option>
        ))}
      </select>

      {/* Octave selector */}
      <div className="flex gap-0.5">
        {([-1, 0, 1] as const).map((oct) => (
          <button
            key={oct}
            onClick={() => onChange({ octave: oct })}
            className={`
              w-4 h-4 text-[10px] rounded
              ${step.octave === oct ? 'bg-synth-accent text-white' : 'bg-synth-dark text-gray-400'}
              hover:bg-synth-accent/70
            `}
          >
            {oct === -1 ? '-' : oct === 0 ? '0' : '+'}
          </button>
        ))}
      </div>

      {/* Toggle buttons */}
      <div className="flex flex-col gap-1 mt-1">
        {/* Gate (note on/off) */}
        <button
          onClick={() => onChange({ gate: !step.gate })}
          className={`
            w-10 h-5 text-[9px] rounded font-bold
            ${step.gate ? 'bg-synth-led text-synth-dark' : 'bg-synth-ledOff text-synth-led/50'}
          `}
        >
          GATE
        </button>

        {/* Accent */}
        <button
          onClick={() => onChange({ accent: !step.accent })}
          className={`
            w-10 h-5 text-[9px] rounded font-bold
            ${step.accent ? 'bg-synth-accent text-white' : 'bg-synth-dark text-gray-500'}
          `}
        >
          ACC
        </button>

        {/* Slide */}
        <button
          onClick={() => onChange({ slide: !step.slide })}
          className={`
            w-10 h-5 text-[9px] rounded font-bold
            ${step.slide ? 'bg-blue-500 text-white' : 'bg-synth-dark text-gray-500'}
          `}
        >
          SLD
        </button>
      </div>
    </div>
  );
}
