import { Pattern303, Step } from '../types/pattern';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C'];

// Engineering drawing style dial component
function EngineeringDial({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange?: (value: number) => void;
}) {
  const size = 80;
  const center = size / 2;
  const radius = 30;

  // Convert 0-100 to angle (-135 to +135 degrees, 270 degree sweep)
  const angle = -135 + (value / 100) * 270;
  const angleRad = (angle * Math.PI) / 180;

  // Pointer end position
  const pointerLength = radius - 8;
  const pointerX = center + Math.cos(angleRad) * pointerLength;
  const pointerY = center + Math.sin(angleRad) * pointerLength;

  // Generate tick marks
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const tickAngle = -135 + (i / 10) * 270;
    const tickRad = (tickAngle * Math.PI) / 180;
    const innerR = i % 5 === 0 ? radius + 1 : radius + 3;
    const outerR = radius + 7;
    ticks.push({
      x1: center + Math.cos(tickRad) * innerR,
      y1: center + Math.sin(tickRad) * innerR,
      x2: center + Math.cos(tickRad) * outerR,
      y2: center + Math.sin(tickRad) * outerR,
      major: i % 5 === 0,
      angle: tickAngle,
    });
  }

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onChange) return;
    e.preventDefault();

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();

    const updateValue = (clientY: number) => {
      const startY = rect.top + rect.height / 2;
      const deltaY = startY - clientY;
      const newValue = Math.max(0, Math.min(100, value + deltaY * 0.5));
      onChange(Math.round(newValue));
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientY);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Label above */}
      <div
        className="mb-2 text-center font-bold"
        style={{
          fontSize: '9px',
          color: '#1a1a1a',
          letterSpacing: '0.5px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {label}
      </div>

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible', cursor: onChange ? 'ns-resize' : 'default' }}
        onMouseDown={handleMouseDown}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="white"
          stroke="#1a1a1a"
          strokeWidth="2"
        />

        {/* Inner circle detail */}
        <circle
          cx={center}
          cy={center}
          r={radius - 10}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />

        {/* Tick marks */}
        {ticks.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="#1a1a1a"
            strokeWidth={tick.major ? 1.5 : 0.75}
          />
        ))}

        {/* Pointer line */}
        <line
          x1={center}
          y1={center}
          x2={pointerX}
          y2={pointerY}
          stroke="#1a1a1a"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Center dot */}
        <circle
          cx={center}
          cy={center}
          r={4}
          fill="#1a1a1a"
        />
      </svg>

      {/* Value below */}
      <div
        className="mt-2 text-center"
        style={{
          fontSize: '12px',
          color: '#1a1a1a',
          fontFamily: "'Courier New', monospace",
          fontWeight: 'bold',
        }}
      >
        {value}
      </div>
    </div>
  );
}

interface PatternSheetProps {
  pattern: Pattern303;
  onStepChange?: (stepIndex: number, updates: Partial<Step>) => void;
  onNameChange?: (name: string) => void;
  onCreatorChange?: (creator: string) => void;
  onCutoffChange?: (value: number) => void;
  onResonanceChange?: (value: number) => void;
  onEnvModChange?: (value: number) => void;
  onDecayChange?: (value: number) => void;
  onAccentChange?: (value: number) => void;
  editable?: boolean;
}

export function PatternSheet({
  pattern,
  onStepChange,
  onNameChange,
  onCreatorChange,
  onCutoffChange,
  onResonanceChange,
  onEnvModChange,
  onDecayChange,
  onAccentChange,
  editable = false
}: PatternSheetProps) {
  return (
    <div
      className="mx-auto max-w-4xl"
      style={{
        background: 'linear-gradient(135deg, #f5f5dc 0%, #f0ead6 50%, #e8e4c9 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 0 60px rgba(0,0,0,0.05)',
        borderRadius: '4px',
        padding: '24px',
        fontFamily: '"Courier New", Courier, monospace',
        position: 'relative',
      }}
    >
      {/* Paper texture overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          borderRadius: '4px',
        }}
      />

      {/* Header */}
      <div className="relative text-center mb-6 pb-4" style={{ borderBottom: '2px solid #333' }}>
        <h1
          className="text-2xl font-bold tracking-widest mb-1"
          style={{ color: '#1a1a1a', fontFamily: 'Arial Black, sans-serif' }}
        >
          TB-303 PATTERN SHEET
        </h1>
        <div className="text-sm" style={{ color: '#444' }}>
          BASS LINE SYNTHESIZER
        </div>
      </div>

      {/* Pattern Info */}
      <div className="relative grid grid-cols-2 gap-4 mb-4 text-sm" style={{ color: '#333' }}>
        <div>
          <span className="font-bold">PATTERN NAME:</span>{' '}
          {editable ? (
            <input
              type="text"
              value={pattern.name}
              onChange={(e) => onNameChange?.(e.target.value)}
              className="bg-transparent outline-none"
              style={{
                borderBottom: '1px solid #666',
                paddingBottom: '2px',
                width: '200px',
                fontFamily: '"Courier New", monospace',
              }}
            />
          ) : (
            <span style={{ borderBottom: pattern.name ? '1px solid #666' : 'none', paddingBottom: '2px' }}>
              {pattern.name}
            </span>
          )}
        </div>
        <div>
          <span className="font-bold">CREATED BY:</span>{' '}
          {editable ? (
            <input
              type="text"
              value={pattern.creator}
              onChange={(e) => onCreatorChange?.(e.target.value)}
              className="bg-transparent outline-none"
              style={{
                borderBottom: '1px solid #666',
                paddingBottom: '2px',
                width: '200px',
                fontFamily: '"Courier New", monospace',
              }}
            />
          ) : (
            <span style={{ borderBottom: pattern.creator ? '1px solid #666' : 'none', paddingBottom: '2px' }}>
              {pattern.creator}
            </span>
          )}
        </div>
        <div>
          <span className="font-bold">TEMPO:</span>{' '}
          <span style={{ borderBottom: '1px solid #666', paddingBottom: '2px' }}>
            {pattern.tempo} BPM
          </span>
        </div>
        <div>
          <span className="font-bold">WAVEFORM:</span>{' '}
          <span style={{ borderBottom: '1px solid #666', paddingBottom: '2px' }}>
            {pattern.waveform === 'saw' ? 'SAWTOOTH' : 'SQUARE'}
          </span>
        </div>
      </div>

      {/* Pattern Grid */}
      <div className="relative overflow-x-auto mb-4">
        <table
          className="w-full text-xs"
          style={{
            borderCollapse: 'collapse',
            color: '#1a1a1a',
          }}
        >
          <thead>
            <tr>
              <th
                className="text-left py-2 px-2 font-bold"
                style={{ borderBottom: '2px solid #333', width: '80px' }}
              >
                STEP
              </th>
              {pattern.steps.map((_, i) => (
                <th
                  key={i}
                  className="text-center py-2 px-1 font-bold"
                  style={{
                    borderBottom: '2px solid #333',
                    borderLeft: i % 4 === 0 ? '2px solid #333' : '1px solid #999',
                    minWidth: '36px',
                  }}
                >
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Note Row */}
            <tr>
              <td className="py-2 px-2 font-bold" style={{ borderBottom: '1px solid #999' }}>
                NOTE
              </td>
              {pattern.steps.map((step, i) => (
                <td
                  key={i}
                  className="text-center py-2 px-1"
                  style={{
                    borderBottom: '1px solid #999',
                    borderLeft: i % 4 === 0 ? '2px solid #333' : '1px solid #ccc',
                    backgroundColor: step.gate ? 'rgba(0,0,0,0.05)' : 'transparent',
                  }}
                >
                  {editable ? (
                    <select
                      value={step.pitch}
                      onChange={(e) => onStepChange?.(i, { pitch: parseInt(e.target.value) })}
                      className="bg-transparent text-center w-full cursor-pointer outline-none font-bold"
                      style={{ color: step.gate ? '#000' : '#999' }}
                    >
                      {NOTE_NAMES.map((note, idx) => (
                        <option key={idx} value={idx}>{note}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={step.gate ? 'font-bold' : 'text-gray-400'}>
                      {NOTE_NAMES[step.pitch]}
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Octave Row */}
            <tr>
              <td className="py-2 px-2 font-bold" style={{ borderBottom: '1px solid #999' }}>
                OCTAVE
              </td>
              {pattern.steps.map((step, i) => (
                <td
                  key={i}
                  className="text-center py-2 px-1 cursor-pointer hover:bg-black/10"
                  style={{
                    borderBottom: '1px solid #999',
                    borderLeft: i % 4 === 0 ? '2px solid #333' : '1px solid #ccc',
                  }}
                  onClick={() => {
                    if (editable) {
                      const next = step.octave === 0 ? 1 : step.octave === 1 ? -1 : 0;
                      onStepChange?.(i, { octave: next as -1 | 0 | 1 });
                    }
                  }}
                >
                  <span className={step.octave !== 0 ? 'font-bold' : 'text-gray-400'}>
                    {step.octave === 1 ? '▲' : step.octave === -1 ? '▼' : '—'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Gate Row */}
            <tr>
              <td className="py-2 px-2 font-bold" style={{ borderBottom: '1px solid #999' }}>
                GATE
              </td>
              {pattern.steps.map((step, i) => (
                <td
                  key={i}
                  className="text-center py-2 px-1 cursor-pointer hover:bg-black/10"
                  style={{
                    borderBottom: '1px solid #999',
                    borderLeft: i % 4 === 0 ? '2px solid #333' : '1px solid #ccc',
                  }}
                  onClick={() => editable && onStepChange?.(i, { gate: !step.gate })}
                >
                  {step.gate ? (
                    <span className="font-bold">●</span>
                  ) : (
                    <span className="text-gray-400">○</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Accent Row */}
            <tr>
              <td className="py-2 px-2 font-bold" style={{ borderBottom: '1px solid #999' }}>
                ACCENT
              </td>
              {pattern.steps.map((step, i) => (
                <td
                  key={i}
                  className="text-center py-2 px-1 cursor-pointer hover:bg-black/10"
                  style={{
                    borderBottom: '1px solid #999',
                    borderLeft: i % 4 === 0 ? '2px solid #333' : '1px solid #ccc',
                  }}
                  onClick={() => editable && onStepChange?.(i, { accent: !step.accent })}
                >
                  {step.accent ? (
                    <span className="font-bold">▶</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Slide Row */}
            <tr>
              <td className="py-2 px-2 font-bold" style={{ borderBottom: '2px solid #333' }}>
                SLIDE
              </td>
              {pattern.steps.map((step, i) => (
                <td
                  key={i}
                  className="text-center py-2 px-1 cursor-pointer hover:bg-black/10"
                  style={{
                    borderBottom: '2px solid #333',
                    borderLeft: i % 4 === 0 ? '2px solid #333' : '1px solid #ccc',
                  }}
                  onClick={() => editable && onStepChange?.(i, { slide: !step.slide })}
                >
                  {step.slide ? (
                    <span className="font-bold">⌒</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Synth Parameters - Engineering Drawing Style Dials */}
      <div
        className="relative pt-4"
        style={{ borderTop: '1px solid #999' }}
      >
        <div className="flex justify-around items-end">
          <EngineeringDial label="CUTOFF" value={pattern.cutoff} onChange={onCutoffChange} />
          <EngineeringDial label="RESONANCE" value={pattern.resonance} onChange={onResonanceChange} />
          <EngineeringDial label="ENV MOD" value={pattern.envMod} onChange={onEnvModChange} />
          <EngineeringDial label="DECAY" value={pattern.decay} onChange={onDecayChange} />
          <EngineeringDial label="ACCENT" value={pattern.accent} onChange={onAccentChange} />
        </div>
      </div>

      {/* Footer */}
      <div
        className="relative mt-6 pt-4 flex justify-between text-xs"
        style={{ borderTop: '1px solid #999', color: '#666' }}
      >
        <div>© ROLAND CORPORATION</div>
        <div>PATTERN 303</div>
      </div>

      {/* Legend */}
      {editable && (
        <div
          className="relative mt-4 text-xs text-center"
          style={{ color: '#888' }}
        >
          Click cells to edit • ● = Gate On • ▲▼ = Octave Up/Down • ▶ = Accent • ⌒ = Slide
        </div>
      )}
    </div>
  );
}
