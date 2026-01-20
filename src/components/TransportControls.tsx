interface TransportControlsProps {
  isPlaying: boolean;
  tempo: number;
  onTogglePlay: () => void;
  onStop: () => void;
  onTempoChange: (tempo: number) => void;
  onRandomize: () => void;
  onClear: () => void;
}

export function TransportControls({
  isPlaying,
  tempo,
  onTogglePlay,
  onStop,
  onTempoChange,
  onRandomize,
  onClear,
}: TransportControlsProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-synth-panel rounded-lg">
      {/* Play/Pause button */}
      <button
        onClick={onTogglePlay}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          ${isPlaying ? 'bg-synth-accent' : 'bg-synth-led'}
          hover:opacity-80 transition-opacity
        `}
      >
        {isPlaying ? (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-synth-dark" fill="currentColor" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      {/* Stop button */}
      <button
        onClick={onStop}
        className="w-10 h-10 rounded-lg bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors"
      >
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" />
        </svg>
      </button>

      {/* Tempo control */}
      <div className="flex items-center gap-2">
        <span className="text-synth-silver text-sm">BPM</span>
        <input
          type="number"
          value={tempo}
          onChange={(e) => onTempoChange(parseInt(e.target.value) || 120)}
          min={60}
          max={300}
          className="w-16 bg-synth-dark text-synth-accent text-center text-lg font-bold p-1 rounded border border-gray-600 focus:border-synth-accent outline-none"
        />
        <input
          type="range"
          value={tempo}
          onChange={(e) => onTempoChange(parseInt(e.target.value))}
          min={60}
          max={300}
          className="w-24 accent-synth-accent"
        />
      </div>

      <div className="h-8 w-px bg-gray-600" />

      {/* Pattern controls */}
      <button
        onClick={onRandomize}
        className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded transition-colors"
      >
        Randomize
      </button>
      <button
        onClick={onClear}
        className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition-colors"
      >
        Clear
      </button>
    </div>
  );
}
